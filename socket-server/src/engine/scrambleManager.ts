import { Server, Socket } from 'socket.io';
import { ActiveScrambleSession, GameStatePayload } from '../types';
import { pickRandomWord, scrambleWord, toScrambleClientState, isCorrectAnswer } from '../games/wordScramble';
import { WORD_BANK, TEST_WORD_BANK_WORDS } from '../games/hangman';
import { logTurn, persistScore, finalizeSession } from './scoreEngine';
import { prisma } from '../db/prisma';

export const activeScrambleSessions = new Map<string, ActiveScrambleSession>();

const TURN_SECONDS = 30;
const TOTAL_WORDS = 40;        // 20 per half, 10 per team per half
const WORD_POINTS = 5;
const HALF_TIME_SECONDS = 90;  // auto-resume break between halves

function buildStatePayload(session: ActiveScrambleSession): GameStatePayload {
  return {
    sessionId: session.sessionId,
    gameType: 'WORD_SCRAMBLE',
    teamAId: session.teamAId,
    teamBId: session.teamBId,
    teamAName: session.teamAName,
    teamBName: session.teamBName,
    teamAScore: session.teamAScore,
    teamBScore: session.teamBScore,
    currentTurnTeamId: session.currentTurnTeamId,
    timeLeft: session.timeLeft,
    status: session.status,
    scramble: toScrambleClientState(
      session.scrambledWord,
      session.category,
      session.hint,
      session.wordNumber,
      session.totalWords,
      session.wordSolved,
    ),
  };
}

function clearTimer(session: ActiveScrambleSession): void {
  if (session.timer) {
    clearInterval(session.timer);
    session.timer = null;
  }
}

// Only the active team's mic is on — same pattern as all other turn-based games
function emitMicControl(io: Server, session: ActiveScrambleSession): void {
  Array.from(session.participantSockets.entries()).forEach(([userId, socketId]) => {
    const teamId = session.participantTeams.get(userId);
    io.to(socketId).emit('mic:control', { enabled: teamId === session.currentTurnTeamId });
  });
}

function switchTurn(session: ActiveScrambleSession): void {
  session.currentTurnTeamId =
    session.currentTurnTeamId === session.teamAId ? session.teamBId : session.teamAId;
}

function startWordTimer(io: Server, session: ActiveScrambleSession): void {
  clearTimer(session);
  session.timer = setInterval(() => {
    session.timeLeft -= 1;
    io.to(session.sessionId).emit('game:tick', { timeLeft: session.timeLeft });
    if (session.timeLeft <= 0) handleWordTimeout(io, session);
  }, 1000);
}

async function handleWordTimeout(io: Server, session: ActiveScrambleSession): Promise<void> {
  clearTimer(session);

  const teamName = session.currentTurnTeamId === session.teamAId
    ? session.teamAName : session.teamBName;

  io.to(session.sessionId).emit('scramble:timeout', {
    word: session.currentWord,
    teamId: session.currentTurnTeamId,
    teamName,
  });

  await logTurn(session.sessionId, session.currentTurnTeamId, null, { type: 'timeout' }, false, 0);
  await persistScore(session.sessionId, session.teamAScore, session.teamBScore);

  if (session.wordNumber >= TOTAL_WORDS) {
    await endGame(io, session);
  } else if (session.wordNumber === TOTAL_WORDS / 2 && session.currentHalf === 1) {
    setTimeout(() => triggerHalfTime(io, session), 3000);
  } else {
    switchTurn(session);
    setTimeout(() => startNextWord(io, session), 3000);
  }
}

function startNextWord(io: Server, session: ActiveScrambleSession): void {
  session.wordNumber += 1;

  const nextEntry = pickRandomWord(session.usedWords);
  session.usedWords.push(nextEntry.word);
  session.currentWord = nextEntry.word;
  session.scrambledWord = scrambleWord(nextEntry.word);
  session.category = nextEntry.category;
  session.hint = nextEntry.hint ?? '';
  session.timeLeft = TURN_SECONDS;
  session.wordSolved = false;

  const turnTeamName = session.currentTurnTeamId === session.teamAId
    ? session.teamAName : session.teamBName;

  io.to(session.sessionId).emit('game:state', buildStatePayload(session));
  io.to(session.sessionId).emit('scramble:turn', {
    teamId: session.currentTurnTeamId,
    teamName: turnTeamName,
    wordNumber: session.wordNumber,
    timeLeft: TURN_SECONDS,
  });

  emitMicControl(io, session);
  startWordTimer(io, session);
}

function triggerHalfTime(io: Server, session: ActiveScrambleSession): void {
  clearTimer(session);
  session.status = 'half_time';

  io.to(session.sessionId).emit('game:half-time', {
    teamAScore: session.teamAScore,
    teamBScore: session.teamBScore,
    teamAName: session.teamAName,
    teamBName: session.teamBName,
    resumeIn: HALF_TIME_SECONDS,
  });

  session.halfTimeTimer = setTimeout(() => {
    session.halfTimeTimer = null;
    beginSecondHalf(io, session);
  }, HALF_TIME_SECONDS * 1000);
}

function beginSecondHalf(io: Server, session: ActiveScrambleSession): void {
  session.currentHalf = 2;
  session.status = 'in_progress';
  switchTurn(session);
  io.to(session.sessionId).emit('game:second-half', {
    teamAScore: session.teamAScore,
    teamBScore: session.teamBScore,
  });
  startNextWord(io, session);
}

async function endGame(io: Server, session: ActiveScrambleSession): Promise<void> {
  clearTimer(session);
  if (session.halfTimeTimer) { clearTimeout(session.halfTimeTimer); session.halfTimeTimer = null; }
  session.status = 'completed';

  const winnerId =
    session.teamAScore > session.teamBScore ? session.teamAId :
    session.teamBScore > session.teamAScore ? session.teamBId : null;

  const winnerName = winnerId
    ? winnerId === session.teamAId ? session.teamAName : session.teamBName
    : null;

  await finalizeSession(session.sessionId, winnerId, session.teamAScore, session.teamBScore);

  io.to(session.sessionId).emit('game:ended', {
    winnerId,
    winnerName,
    teamAScore: session.teamAScore,
    teamBScore: session.teamBScore,
  });

  activeScrambleSessions.delete(session.sessionId);
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function startScrambleGame(io: Server, sessionId: string): Promise<void> {
  const dbSession = await prisma.gameSession.findUnique({
    where: { id: sessionId },
    include: { teamA: true, teamB: true, roster: { include: { user: true } } },
  });

  if (!dbSession) throw new Error('Session not found');
  if (dbSession.status === 'IN_PROGRESS') throw new Error('Game already in progress');

  const assignment = dbSession.poolAssignment as { words?: string[], testMode?: boolean } | null;
  const testMode = assignment?.testMode === true;
  const preUsed = testMode
    ? WORD_BANK.filter(e => !TEST_WORD_BANK_WORDS.includes(e.word)).map(e => e.word)
    : (assignment?.words ? WORD_BANK.filter(e => !assignment.words!.includes(e.word)).map(e => e.word) : []);

  const firstEntry = pickRandomWord(preUsed);
  const participantTeams = new Map<string, string>();
  dbSession.roster.forEach(r => { participantTeams.set(r.userId, r.teamId); });

  const session: ActiveScrambleSession = {
    sessionId,
    teamAId: dbSession.teamAId,
    teamBId: dbSession.teamBId,
    teamAName: dbSession.teamA.name,
    teamBName: dbSession.teamB.name,
    currentTurnTeamId: dbSession.teamAId, // Team A always goes first
    timer: null,
    halfTimeTimer: null,
    turnDuration: TURN_SECONDS,
    timeLeft: TURN_SECONDS,
    teamAScore: 0,
    teamBScore: 0,
    currentWord: firstEntry.word,
    scrambledWord: scrambleWord(firstEntry.word),
    category: firstEntry.category,
    hint: firstEntry.hint ?? '',
    wordNumber: 1,
    totalWords: TOTAL_WORDS,
    wordSolved: false,
    participantSockets: new Map(),
    participantTeams,
    status: 'in_progress',
    currentHalf: 1,
    usedWords: [...preUsed, firstEntry.word],
  };

  activeScrambleSessions.set(sessionId, session);

  await prisma.gameSession.update({
    where: { id: sessionId },
    data: { status: 'IN_PROGRESS', startedAt: new Date(), currentTurnTeamId: dbSession.teamAId },
  });

  io.to(sessionId).emit('game:started', buildStatePayload(session));
  io.to(sessionId).emit('scramble:turn', {
    teamId: session.currentTurnTeamId,
    teamName: session.teamAName,
    wordNumber: 1,
    timeLeft: TURN_SECONDS,
  });

  emitMicControl(io, session);
  startWordTimer(io, session);
}

export async function handleScrambleGuess(
  io: Server,
  socket: Socket,
  sessionId: string,
  userId: string,
  answer: string,
): Promise<void> {
  const session = activeScrambleSessions.get(sessionId);
  if (!session || session.status !== 'in_progress') return;

  const userTeamId = session.participantTeams.get(userId);
  if (!userTeamId) return; // spectator

  // Only the active team can submit
  if (userTeamId !== session.currentTurnTeamId) {
    socket.emit('scramble:not-your-turn');
    return;
  }

  if (isCorrectAnswer(answer, session.currentWord)) {
    clearTimer(session);
    session.wordSolved = true;

    if (userTeamId === session.teamAId) session.teamAScore += WORD_POINTS;
    else session.teamBScore += WORD_POINTS;

    const teamName = userTeamId === session.teamAId ? session.teamAName : session.teamBName;

    await logTurn(session.sessionId, userTeamId, userId, { type: 'answer', value: answer.toUpperCase() }, true, WORD_POINTS);
    await persistScore(sessionId, session.teamAScore, session.teamBScore);

    io.to(sessionId).emit('scramble:correct', {
      word: session.currentWord,
      teamId: userTeamId,
      teamName,
      pointsAwarded: WORD_POINTS,
    });
    io.to(sessionId).emit('game:score', {
      teamAScore: session.teamAScore,
      teamBScore: session.teamBScore,
    });

    if (session.wordNumber >= TOTAL_WORDS) {
      await endGame(io, session);
    } else if (session.wordNumber === TOTAL_WORDS / 2 && session.currentHalf === 1) {
      setTimeout(() => triggerHalfTime(io, session), 3000);
    } else {
      switchTurn(session);
      setTimeout(() => startNextWord(io, session), 3000);
    }
  } else {
    // Wrong — team keeps trying within the remaining turn time
    const teamName = userTeamId === session.teamAId ? session.teamAName : session.teamBName;
    await logTurn(session.sessionId, userTeamId, userId, { type: 'answer', value: answer.toUpperCase() }, false, 0);

    io.to(sessionId).emit('scramble:wrong', {
      teamId: userTeamId,
      teamName,
    });
  }
}

export function registerScrambleParticipantSocket(
  session: ActiveScrambleSession,
  userId: string,
  socketId: string,
): void {
  session.participantSockets.set(userId, socketId);
}

export function unregisterScrambleParticipantSocket(session: ActiveScrambleSession, userId: string): void {
  session.participantSockets.delete(userId);
}

export function getCurrentScrambleState(sessionId: string): GameStatePayload | null {
  const session = activeScrambleSessions.get(sessionId);
  if (!session) return null;
  return buildStatePayload(session);
}

export function startScrambleSecondHalf(io: Server, sessionId: string): void {
  const session = activeScrambleSessions.get(sessionId);
  if (!session || session.status !== 'half_time') return;
  if (session.halfTimeTimer) { clearTimeout(session.halfTimeTimer); session.halfTimeTimer = null; }
  beginSecondHalf(io, session);
}
