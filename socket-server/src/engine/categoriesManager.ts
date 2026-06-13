import { Server } from 'socket.io';
import { prisma } from '../db/prisma';
import { pickCategories, matchAnswer, BibleCategory, BIBLE_CATEGORIES, TEST_CATEGORIES, TEST_CATEGORY_IDS } from '../games/bibleCategories';
import { persistScore, finalizeSession } from './scoreEngine';

const MAX_STRIKES = 3;
const TURN_SECONDS = 25;
const ROUNDS = 6;              // 3 per half
const HALF_TIME_SECONDS = 90;  // auto-resume break between halves

interface ActiveCategorySession {
  sessionId: string;
  teamAId: string;
  teamBId: string;
  teamAName: string;
  teamBName: string;
  currentTurnTeamId: string;
  teamAScore: number;
  teamBScore: number;

  // Round state
  categories: BibleCategory[];
  currentRound: number;   // 0-indexed
  totalRounds: number;
  currentCategory: BibleCategory;
  foundAnswers: string[]; // canonical text of found answers
  strikes: number;        // total strikes this round
  lastStrikeTeam: string | null;
  advancing: boolean;     // guard against double advanceRound calls

  timer: ReturnType<typeof setTimeout> | null;
  halfTimeTimer: ReturnType<typeof setTimeout> | null;
  timeLeft: number;
  currentHalf: number;
}

export const activeCategorySessions = new Map<string, ActiveCategorySession>();

function buildClientState(s: ActiveCategorySession) {
  return {
    roundNumber: s.currentRound + 1,
    totalRounds: s.totalRounds,
    category: {
      id: s.currentCategory.id,
      title: s.currentCategory.title,
      subtitle: s.currentCategory.subtitle,
      totalAnswers: s.currentCategory.answers.length,
    },
    foundAnswers: s.foundAnswers.map(f => {
      const a = s.currentCategory.answers.find(a => a.text === f)!;
      return { text: a.text, points: a.points };
    }),
    strikes: s.strikes,
    maxStrikes: MAX_STRIKES,
    teamAScore: s.teamAScore,
    teamBScore: s.teamBScore,
    currentTurnTeamId: s.currentTurnTeamId,
    timeLeft: s.timeLeft,
  };
}

function clearTimer(s: ActiveCategorySession) {
  if (s.timer) { clearTimeout(s.timer); s.timer = null; }
}

function startTurnTimer(io: Server, s: ActiveCategorySession) {
  clearTimer(s);
  s.timeLeft = TURN_SECONDS;

  const tick = () => {
    s.timeLeft--;
    io.to(s.sessionId).emit('game:tick', { timeLeft: s.timeLeft });

    if (s.timeLeft <= 0) {
      handleTimeout(io, s);
    } else {
      s.timer = setTimeout(tick, 1000);
    }
  };
  s.timer = setTimeout(tick, 1000);
}

function switchTurn(s: ActiveCategorySession) {
  s.currentTurnTeamId = s.currentTurnTeamId === s.teamAId ? s.teamBId : s.teamAId;
}

async function advanceRound(io: Server, s: ActiveCategorySession) {
  if (s.advancing) return; // prevent double-advance from timer + guess race
  s.advancing = true;
  clearTimer(s);

  // Reveal remaining answers
  const remaining = s.currentCategory.answers
    .filter(a => !s.foundAnswers.includes(a.text))
    .map(a => ({ text: a.text, points: a.points }));

  io.to(s.sessionId).emit('categories:round-end', {
    remaining,
    foundAnswers: s.foundAnswers.map(f => {
      const a = s.currentCategory.answers.find(a => a.text === f)!;
      return { text: a.text, points: a.points };
    }),
    teamAScore: s.teamAScore,
    teamBScore: s.teamBScore,
  });

  await persistScore(s.sessionId, s.teamAScore, s.teamBScore);

  const nextRound = s.currentRound + 1;

  if (nextRound >= s.totalRounds) {
    // Game over
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

    activeCategorySessions.delete(s.sessionId);
    return;
  }

  // Half-time check: after round 3 of 6 (nextRound === totalRounds/2)
  if (nextRound === Math.floor(s.totalRounds / 2) && s.currentHalf === 1) {
    setTimeout(() => {
      s.advancing = false;

      s.halfTimeTimer = setTimeout(() => {
        s.halfTimeTimer = null;
        s.currentHalf = 2;
        s.currentRound = nextRound;
        s.currentCategory = s.categories[s.currentRound];
        s.foundAnswers = [];
        s.strikes = 0;
        s.lastStrikeTeam = null;
        io.to(s.sessionId).emit('game:second-half', { teamAScore: s.teamAScore, teamBScore: s.teamBScore });
        io.to(s.sessionId).emit('categories:new-round', buildClientState(s));
        startTurnTimer(io, s);
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

  // Next round — 4 second delay to read the board.
  // Keep s.currentRound unchanged during the delay so reconnecting clients
  // see the completed round state (not a half-advanced inconsistent state).
  setTimeout(() => {
    s.currentRound = nextRound;
    s.currentCategory = s.categories[s.currentRound];
    s.foundAnswers = [];
    s.strikes = 0;
    s.lastStrikeTeam = null;
    s.advancing = false;

    io.to(s.sessionId).emit('categories:new-round', buildClientState(s));
    startTurnTimer(io, s);
  }, 4000);
}

async function handleTimeout(io: Server, s: ActiveCategorySession) {
  s.strikes++;
  const wasTeam = s.currentTurnTeamId;
  switchTurn(s);

  io.to(s.sessionId).emit('categories:strike', {
    teamId: wasTeam,
    reason: 'timeout',
    strikes: s.strikes,
    maxStrikes: MAX_STRIKES,
  });

  if (s.strikes >= MAX_STRIKES) {
    await advanceRound(io, s);
  } else {
    io.to(s.sessionId).emit('categories:state', buildClientState(s));
    startTurnTimer(io, s);
  }
}

// ── Public API ────────────────────────────────────────────────────

export async function startCategoriesGame(io: Server, sessionId: string) {
  const dbSession = await prisma.gameSession.findUnique({
    where: { id: sessionId },
    select: { teamAId: true, teamBId: true, poolAssignment: true },
  });
  if (!dbSession) throw new Error('Session not found');

  const assignment = dbSession.poolAssignment as { categoryIds?: string[], testMode?: boolean } | null;
  const testMode = assignment?.testMode === true;
  const categories = testMode
    ? TEST_CATEGORIES.slice(0, ROUNDS)
    : (assignment?.categoryIds
        ? BIBLE_CATEGORIES.filter(c => assignment.categoryIds!.includes(c.id)).slice(0, ROUNDS)
        : pickCategories(ROUNDS));

  const dbSessionFull = await prisma.gameSession.findUnique({
    where: { id: sessionId },
    include: { teamA: true, teamB: true },
  });

  const session: ActiveCategorySession = {
    sessionId,
    teamAId: dbSession.teamAId,
    teamBId: dbSession.teamBId,
    teamAName: dbSessionFull?.teamA.name ?? 'Team A',
    teamBName: dbSessionFull?.teamB.name ?? 'Team B',
    currentTurnTeamId: dbSession.teamAId,
    teamAScore: 0,
    teamBScore: 0,
    categories,
    currentRound: 0,
    totalRounds: categories.length, // use actual length — filter may return < ROUNDS items
    currentCategory: categories[0],
    foundAnswers: [],
    strikes: 0,
    lastStrikeTeam: null,
    advancing: false,
    timer: null,
    halfTimeTimer: null,
    timeLeft: TURN_SECONDS,
    currentHalf: 1,
  };

  activeCategorySessions.set(sessionId, session);

  await prisma.gameSession.update({
    where: { id: sessionId },
    data: { status: 'IN_PROGRESS', startedAt: new Date(), currentTurnTeamId: dbSession.teamAId },
  });

  io.to(sessionId).emit('game:started', {
    sessionId,
    gameType: 'BIBLE_CATEGORIES',
    teamAId: session.teamAId,
    teamBId: session.teamBId,
    teamAScore: 0,
    teamBScore: 0,
    currentTurnTeamId: session.currentTurnTeamId,
    timeLeft: TURN_SECONDS,
    status: 'IN_PROGRESS',
    categories: buildClientState(session),
  });

  startTurnTimer(io, session);
}

export function handleCategoriesGuess(
  io: Server,
  sessionId: string,
  teamId: string,
  userId: string | undefined,
  answer: string
) {
  const s = activeCategorySessions.get(sessionId);
  if (!s) return;
  if (s.currentTurnTeamId !== teamId) {
    io.to(sessionId).emit('categories:invalid', { reason: 'not_your_turn' });
    return;
  }
  if (!answer.trim()) return;

  const matched = matchAnswer(answer, s.currentCategory, s.foundAnswers);

  if (matched) {
    // Correct!
    s.foundAnswers.push(matched.text);

    if (teamId === s.teamAId) s.teamAScore += matched.points;
    else s.teamBScore += matched.points;

    clearTimer(s);

    io.to(sessionId).emit('categories:correct', {
      teamId,
      answer: matched.text,
      points: matched.points,
      foundAnswers: s.foundAnswers.map(f => {
        const a = s.currentCategory.answers.find(a => a.text === f)!;
        return { text: a.text, points: a.points };
      }),
      teamAScore: s.teamAScore,
      teamBScore: s.teamBScore,
      remaining: s.currentCategory.answers.length - s.foundAnswers.length,
    });

    io.to(sessionId).emit('game:score', { teamAScore: s.teamAScore, teamBScore: s.teamBScore });

    if (s.foundAnswers.length >= s.currentCategory.answers.length) {
      // All found — advance round
      advanceRound(io, s);
    } else {
      // Same team goes again with fresh timer
      s.timeLeft = TURN_SECONDS;
      startTurnTimer(io, s);
    }
  } else {
    // Wrong
    s.strikes++;
    const wasTeam = s.currentTurnTeamId;
    switchTurn(s);

    io.to(sessionId).emit('categories:wrong', {
      teamId: wasTeam,
      answer: answer.trim(),
      strikes: s.strikes,
      maxStrikes: MAX_STRIKES,
    });

    if (s.strikes >= MAX_STRIKES) {
      advanceRound(io, s);
    } else {
      io.to(sessionId).emit('categories:state', buildClientState(s));
      startTurnTimer(io, s);
    }
  }
}

export function getCategoriesState(sessionId: string) {
  const s = activeCategorySessions.get(sessionId);
  if (!s) return null;
  return buildClientState(s);
}

export function startCategoriesSecondHalf(io: Server, sessionId: string): void {
  const s = activeCategorySessions.get(sessionId);
  if (!s || s.currentHalf !== 1 || !s.halfTimeTimer) return;
  clearTimeout(s.halfTimeTimer);
  s.halfTimeTimer = null;
  const nextRound = Math.floor(s.totalRounds / 2);
  s.currentHalf = 2;
  s.currentRound = nextRound;
  s.currentCategory = s.categories[s.currentRound];
  s.foundAnswers = [];
  s.strikes = 0;
  s.lastStrikeTeam = null;
  s.advancing = false;
  io.to(s.sessionId).emit('game:second-half', { teamAScore: s.teamAScore, teamBScore: s.teamBScore });
  io.to(s.sessionId).emit('categories:new-round', buildClientState(s));
  startTurnTimer(io, s);
}
