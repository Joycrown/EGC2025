import { Server } from 'socket.io';
import { prisma } from '../db/prisma';
import { pickQuestions, TriviaQuestion, TRIVIA_QUESTIONS, TEST_TRIVIA_QUESTIONS } from '../games/bibleTrivia';
import { persistScore, finalizeSession } from './scoreEngine';

const BUZZ_WINDOW_SECONDS = 20;   // time to buzz in
const ANSWER_SECONDS = 12;         // time to answer after buzzing
const PASS_SECONDS = 8;            // time for other team to answer after pass
const QUESTIONS_PER_GAME = 20;   // 10 per half
const POINTS_FIRST = 5;
const POINTS_SECOND = 3;           // answering after other team passed
const HALF_TIME_SECONDS = 30;     // auto-resume break between halves

type PhaseType = 'buzzing' | 'answering' | 'passing' | 'reveal';

interface ActiveTriviaSession {
  sessionId: string;
  teamAId: string;
  teamBId: string;
  teamAScore: number;
  teamBScore: number;
  currentTurnTeamId: string;
  teamAName: string;
  teamBName: string;

  questions: TriviaQuestion[];
  currentIndex: number;
  totalQuestions: number;

  phase: PhaseType;
  buzzedTeamId: string | null;      // who buzzed in
  passingToTeamId: string | null;   // who gets the pass
  pointsOnOffer: number;

  timer: ReturnType<typeof setTimeout> | null;
  halfTimeTimer: ReturnType<typeof setTimeout> | null;
  timeLeft: number;
  currentHalf: number;
}

export const activeTrivaSessions = new Map<string, ActiveTriviaSession>();

function currentQuestion(s: ActiveTriviaSession): TriviaQuestion {
  return s.questions[s.currentIndex];
}

function safeQuestion(q: TriviaQuestion) {
  return {
    id: q.id,
    question: q.question,
    options: q.options,
    category: q.category,
    points: q.points,
    // answer is NEVER sent to client during active play
  };
}

function buildClientState(s: ActiveTriviaSession) {
  return {
    questionNumber: s.currentIndex + 1,
    totalQuestions: s.totalQuestions,
    question: safeQuestion(currentQuestion(s)),
    phase: s.phase,
    buzzedTeamId: s.buzzedTeamId,
    passingToTeamId: s.passingToTeamId,
    pointsOnOffer: s.pointsOnOffer,
    teamAScore: s.teamAScore,
    teamBScore: s.teamBScore,
    currentTurnTeamId: s.currentTurnTeamId,
    timeLeft: s.timeLeft,
  };
}

function clearTimer(s: ActiveTriviaSession) {
  if (s.timer) { clearTimeout(s.timer); s.timer = null; }
}

function startTimer(io: Server, s: ActiveTriviaSession, seconds: number, onExpire: () => void) {
  clearTimer(s);
  s.timeLeft = seconds;
  const tick = () => {
    s.timeLeft--;
    io.to(s.sessionId).emit('game:tick', { timeLeft: s.timeLeft });
    if (s.timeLeft <= 0) {
      onExpire();
    } else {
      s.timer = setTimeout(tick, 1000);
    }
  };
  s.timer = setTimeout(tick, 1000);
}

async function revealAndAdvance(io: Server, s: ActiveTriviaSession, correctTeamId: string | null) {
  clearTimer(s);
  const q = currentQuestion(s);

  io.to(s.sessionId).emit('trivia:reveal', {
    correctAnswer: q.answer,
    correctOption: q.options[['A','B','C','D'].indexOf(q.answer)],
    correctTeamId,
    teamAScore: s.teamAScore,
    teamBScore: s.teamBScore,
  });

  await persistScore(s.sessionId, s.teamAScore, s.teamBScore);

  s.currentIndex++;

  if (s.currentIndex >= s.totalQuestions) {
    if (s.halfTimeTimer) { clearTimeout(s.halfTimeTimer); s.halfTimeTimer = null; }
    const winnerId = s.teamAScore > s.teamBScore ? s.teamAId
      : s.teamBScore > s.teamAScore ? s.teamBId : null;

    await finalizeSession(s.sessionId, winnerId, s.teamAScore, s.teamBScore);

    io.to(s.sessionId).emit('game:ended', {
      winnerId,
      winnerName: null,
      teamAScore: s.teamAScore,
      teamBScore: s.teamBScore,
    });

    activeTrivaSessions.delete(s.sessionId);
    return;
  }

  // Check for half-time
  if (s.currentIndex === s.totalQuestions / 2 && s.currentHalf === 1) {
    setTimeout(() => {
      s.phase = 'buzzing';
      s.buzzedTeamId = null;
      s.passingToTeamId = null;
      s.pointsOnOffer = POINTS_FIRST;

      s.halfTimeTimer = setTimeout(() => {
        s.halfTimeTimer = null;
        s.currentHalf = 2;
        io.to(s.sessionId).emit('game:second-half', { teamAScore: s.teamAScore, teamBScore: s.teamBScore });
        io.to(s.sessionId).emit('trivia:question', buildClientState(s));
        startBuzzWindow(io, s);
      }, HALF_TIME_SECONDS * 1000);

      io.to(s.sessionId).emit('game:half-time', {
        teamAScore: s.teamAScore,
        teamBScore: s.teamBScore,
        teamAName: s.teamAName,
        teamBName: s.teamBName,
        resumeIn: HALF_TIME_SECONDS,
      });
    }, 4000);
    return;
  }

  // Next question after 4-second reveal pause
  setTimeout(() => {
    s.phase = 'buzzing';
    s.buzzedTeamId = null;
    s.passingToTeamId = null;
    s.pointsOnOffer = POINTS_FIRST;
    s.currentTurnTeamId = s.teamAId; // reset to teamA each question

    io.to(s.sessionId).emit('trivia:question', buildClientState(s));
    startBuzzWindow(io, s);
  }, 4000);
}

function startBuzzWindow(io: Server, s: ActiveTriviaSession) {
  startTimer(io, s, BUZZ_WINDOW_SECONDS, () => {
    // No one buzzed — reveal and move on
    s.phase = 'reveal';
    revealAndAdvance(io, s, null);
  });
}

// ── Public API ────────────────────────────────────────────────────

export async function startTriviaGame(io: Server, sessionId: string) {
  const dbSession = await prisma.gameSession.findUnique({
    where: { id: sessionId },
    select: { teamAId: true, teamBId: true, poolAssignment: true },
  });
  if (!dbSession) throw new Error('Session not found');

  const assignment = dbSession.poolAssignment as { questionIds?: string[], testMode?: boolean } | null;
  const testMode = assignment?.testMode === true;
  const questions: TriviaQuestion[] = testMode
    ? TEST_TRIVIA_QUESTIONS.slice(0, QUESTIONS_PER_GAME)
    : (assignment?.questionIds
        ? TRIVIA_QUESTIONS.filter(q => assignment.questionIds!.includes(q.id)).slice(0, QUESTIONS_PER_GAME)
        : pickQuestions(QUESTIONS_PER_GAME));

  const dbSessionFull = await prisma.gameSession.findUnique({
    where: { id: sessionId },
    include: { teamA: true, teamB: true },
  });

  const session: ActiveTriviaSession = {
    sessionId,
    teamAId: dbSession.teamAId,
    teamBId: dbSession.teamBId,
    teamAScore: 0,
    teamBScore: 0,
    currentTurnTeamId: dbSession.teamAId,
    teamAName: dbSessionFull?.teamA.name ?? 'Team A',
    teamBName: dbSessionFull?.teamB.name ?? 'Team B',
    questions,
    currentIndex: 0,
    totalQuestions: questions.length,
    phase: 'buzzing',
    buzzedTeamId: null,
    passingToTeamId: null,
    pointsOnOffer: POINTS_FIRST,
    timer: null,
    halfTimeTimer: null,
    timeLeft: BUZZ_WINDOW_SECONDS,
    currentHalf: 1,
  };

  activeTrivaSessions.set(sessionId, session);

  await prisma.gameSession.update({
    where: { id: sessionId },
    data: { status: 'IN_PROGRESS', startedAt: new Date(), currentTurnTeamId: dbSession.teamAId },
  });

  io.to(sessionId).emit('game:started', {
    sessionId,
    gameType: 'BIBLE_TRIVIA',
    teamAId: session.teamAId,
    teamBId: session.teamBId,
    teamAScore: 0,
    teamBScore: 0,
    currentTurnTeamId: session.currentTurnTeamId,
    timeLeft: BUZZ_WINDOW_SECONDS,
    status: 'IN_PROGRESS',
    trivia: buildClientState(session),
  });

  startBuzzWindow(io, session);
}

export function handleTriviaBuzz(io: Server, sessionId: string, teamId: string) {
  const s = activeTrivaSessions.get(sessionId);
  if (!s || s.phase !== 'buzzing') return;

  clearTimer(s);
  s.phase = 'answering';
  s.buzzedTeamId = teamId;
  s.pointsOnOffer = POINTS_FIRST;

  io.to(sessionId).emit('trivia:buzz-locked', {
    teamId,
    ...buildClientState(s),
  });

  startTimer(io, s, ANSWER_SECONDS, () => {
    // Buzzed team timed out — pass to other team
    s.phase = 'passing';
    s.passingToTeamId = teamId === s.teamAId ? s.teamBId : s.teamAId;
    s.pointsOnOffer = POINTS_SECOND;

    io.to(sessionId).emit('trivia:pass', {
      fromTeamId: teamId,
      toTeamId: s.passingToTeamId,
      pointsOnOffer: POINTS_SECOND,
      timeLeft: PASS_SECONDS,
    });

    startTimer(io, s, PASS_SECONDS, () => {
      // Both teams failed
      s.phase = 'reveal';
      revealAndAdvance(io, s, null);
    });
  });
}

export function handleTriviaAnswer(io: Server, sessionId: string, teamId: string, answer: string) {
  const s = activeTrivaSessions.get(sessionId);
  if (!s) return;
  if (s.phase !== 'answering' && s.phase !== 'passing') return;

  // Validate who can answer
  if (s.phase === 'answering' && s.buzzedTeamId !== teamId) {
    io.to(sessionId).emit('trivia:invalid', { reason: 'not_your_buzz' });
    return;
  }
  if (s.phase === 'passing' && s.passingToTeamId !== teamId) {
    io.to(sessionId).emit('trivia:invalid', { reason: 'not_your_turn' });
    return;
  }

  const q = currentQuestion(s);
  const isCorrect = answer.toUpperCase() === q.answer;

  clearTimer(s);

  if (isCorrect) {
    const pts = s.pointsOnOffer;
    if (teamId === s.teamAId) s.teamAScore += pts;
    else s.teamBScore += pts;

    io.to(sessionId).emit('trivia:correct', {
      teamId,
      answer,
      points: pts,
      teamAScore: s.teamAScore,
      teamBScore: s.teamBScore,
    });
    io.to(sessionId).emit('game:score', { teamAScore: s.teamAScore, teamBScore: s.teamBScore });

    s.phase = 'reveal';
    revealAndAdvance(io, s, teamId);
  } else {
    io.to(sessionId).emit('trivia:wrong', { teamId, answer });

    if (s.phase === 'answering') {
      // Pass to other team
      s.phase = 'passing';
      s.passingToTeamId = teamId === s.teamAId ? s.teamBId : s.teamAId;
      s.pointsOnOffer = POINTS_SECOND;

      io.to(sessionId).emit('trivia:pass', {
        fromTeamId: teamId,
        toTeamId: s.passingToTeamId,
        pointsOnOffer: POINTS_SECOND,
        timeLeft: PASS_SECONDS,
      });

      startTimer(io, s, PASS_SECONDS, () => {
        s.phase = 'reveal';
        revealAndAdvance(io, s, null);
      });
    } else {
      // Passing team also wrong — reveal
      s.phase = 'reveal';
      revealAndAdvance(io, s, null);
    }
  }
}

export function getTriviaState(sessionId: string) {
  const s = activeTrivaSessions.get(sessionId);
  if (!s) return null;
  return buildClientState(s);
}

export function startTriviaSecondHalf(io: Server, sessionId: string): void {
  const s = activeTrivaSessions.get(sessionId);
  if (!s || s.currentHalf !== 1 || !s.halfTimeTimer) return;
  clearTimeout(s.halfTimeTimer);
  s.halfTimeTimer = null;
  s.currentHalf = 2;
  io.to(s.sessionId).emit('game:second-half', { teamAScore: s.teamAScore, teamBScore: s.teamBScore });
  io.to(s.sessionId).emit('trivia:question', buildClientState(s));
  startBuzzWindow(io, s);
}
