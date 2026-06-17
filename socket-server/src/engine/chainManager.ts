import { Server, Socket } from 'socket.io';
import { ActiveChainSession, ChainClientState, GameStatePayload } from '../types';
import { pickSafeLetter, nextRequiredLetter } from '../games/wordChain';
import { validateWord } from '../games/wordValidator';
import { logTurn, persistScore, finalizeSession } from './scoreEngine';
import { prisma } from '../db/prisma';

export const activeChainSessions = new Map<string, ActiveChainSession>();

const TURN_SECONDS = 40;
const TOTAL_TURNS = 40;        // 20 per half, 10 per team per half
const HALF_TIME_SECONDS = 30;  // auto-resume break between halves
const POINTS_BIBLE = 3;   // word found in the curated Bible bank
const POINTS_ENGLISH = 1; // valid English word not in Bible bank
const MIN_WORD_LENGTH = 4;

function toChainClientState(session: ActiveChainSession): ChainClientState {
  return {
    chain: session.chain,
    requiredLetter: session.requiredLetter,
    wrongAttempts: session.wrongAttempts,
    turnNumber: session.turnNumber,
    totalTurns: session.totalTurns,
  };
}

function buildStatePayload(session: ActiveChainSession): GameStatePayload {
  return {
    sessionId: session.sessionId,
    gameType: 'WORD_CHAIN',
    teamAId: session.teamAId,
    teamBId: session.teamBId,
    teamAName: session.teamAName,
    teamBName: session.teamBName,
    teamAScore: session.teamAScore,
    teamBScore: session.teamBScore,
    currentTurnTeamId: session.currentTurnTeamId,
    timeLeft: session.timeLeft,
    status: session.status,
    chain: toChainClientState(session),
  };
}

function clearTimer(session: ActiveChainSession): void {
  if (session.timer) { clearInterval(session.timer); session.timer = null; }
}

function emitMicControl(io: Server, session: ActiveChainSession): void {
  Array.from(session.participantSockets.entries()).forEach(([userId, socketId]) => {
    const teamId = session.participantTeams.get(userId);
    io.to(socketId).emit('mic:control', { enabled: teamId === session.currentTurnTeamId });
  });
}

function switchTurn(session: ActiveChainSession): void {
  session.currentTurnTeamId =
    session.currentTurnTeamId === session.teamAId ? session.teamBId : session.teamAId;
}

function startTurnTimer(io: Server, session: ActiveChainSession): void {
  clearTimer(session);
  session.timer = setInterval(() => {
    session.timeLeft -= 1;
    io.to(session.sessionId).emit('game:tick', { timeLeft: session.timeLeft });
    if (session.timeLeft <= 0) handleTurnTimeout(io, session);
  }, 1000);
}

async function handleTurnTimeout(io: Server, session: ActiveChainSession): Promise<void> {
  clearTimer(session);

  const teamName = session.currentTurnTeamId === session.teamAId
    ? session.teamAName : session.teamBName;

  // Required letter carries over — same starting constraint for the other team
  io.to(session.sessionId).emit('chain:timeout', {
    teamId: session.currentTurnTeamId,
    teamName,
    requiredLetter: session.requiredLetter,
  });

  await logTurn(session.sessionId, session.currentTurnTeamId, null, { type: 'timeout' }, false, 0);
  await persistScore(session.sessionId, session.teamAScore, session.teamBScore);

  if (session.turnNumber >= TOTAL_TURNS) {
    await endGame(io, session);
  } else if (session.turnNumber === TOTAL_TURNS / 2 && session.currentHalf === 1) {
    setTimeout(() => triggerHalfTime(io, session), 3000);
  } else {
    switchTurn(session);
    setTimeout(() => startNextTurn(io, session), 3000);
  }
}

function startNextTurn(io: Server, session: ActiveChainSession): void {
  session.turnNumber += 1;
  session.wrongAttempts = [];
  session.timeLeft = TURN_SECONDS;

  const teamName = session.currentTurnTeamId === session.teamAId
    ? session.teamAName : session.teamBName;

  io.to(session.sessionId).emit('game:state', buildStatePayload(session));
  io.to(session.sessionId).emit('chain:turn', {
    teamId: session.currentTurnTeamId,
    teamName,
    requiredLetter: session.requiredLetter,
    timeLeft: TURN_SECONDS,
    turnNumber: session.turnNumber,
  });

  emitMicControl(io, session);
  startTurnTimer(io, session);
}

function triggerHalfTime(io: Server, session: ActiveChainSession): void {
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

function beginSecondHalf(io: Server, session: ActiveChainSession): void {
  session.currentHalf = 2;
  session.status = 'in_progress';
  switchTurn(session);
  io.to(session.sessionId).emit('game:second-half', {
    teamAScore: session.teamAScore,
    teamBScore: session.teamBScore,
  });
  startNextTurn(io, session);
}

async function endGame(io: Server, session: ActiveChainSession): Promise<void> {
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

  activeChainSessions.delete(session.sessionId);
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function startChainGame(io: Server, sessionId: string): Promise<void> {
  const dbSession = await prisma.gameSession.findUnique({
    where: { id: sessionId },
    include: { teamA: true, teamB: true, roster: { include: { user: true } } },
  });

  if (!dbSession) throw new Error('Session not found');
  if (dbSession.status === 'IN_PROGRESS') throw new Error('Game already in progress');

  const participantTeams = new Map<string, string>();
  dbSession.roster.forEach(r => { participantTeams.set(r.userId, r.teamId); });

  const assignment = dbSession.poolAssignment as { words?: string[], testMode?: boolean } | null;
  const testMode = assignment?.testMode === true;
  const totalTurns = testMode ? 6 : TOTAL_TURNS;

  const startingLetter = pickSafeLetter();

  const session: ActiveChainSession = {
    sessionId,
    teamAId: dbSession.teamAId,
    teamBId: dbSession.teamBId,
    teamAName: dbSession.teamA.name,
    teamBName: dbSession.teamB.name,
    currentTurnTeamId: dbSession.teamAId,
    timer: null,
    halfTimeTimer: null,
    timeLeft: TURN_SECONDS,
    teamAScore: 0,
    teamBScore: 0,
    requiredLetter: startingLetter,
    chain: [],
    usedWords: [],
    wrongAttempts: [],
    turnNumber: 1,
    totalTurns,
    participantSockets: new Map(),
    participantTeams,
    status: 'in_progress',
    currentHalf: 1,
  };

  activeChainSessions.set(sessionId, session);

  await prisma.gameSession.update({
    where: { id: sessionId },
    data: { status: 'IN_PROGRESS', startedAt: new Date(), currentTurnTeamId: dbSession.teamAId },
  });

  io.to(sessionId).emit('game:started', buildStatePayload(session));
  io.to(sessionId).emit('chain:turn', {
    teamId: session.currentTurnTeamId,
    teamName: session.teamAName,
    requiredLetter: startingLetter,
    timeLeft: TURN_SECONDS,
    turnNumber: 1,
  });

  emitMicControl(io, session);
  startTurnTimer(io, session);
}

export async function handleChainGuess(
  io: Server,
  socket: Socket,
  sessionId: string,
  userId: string,
  word: string,
): Promise<void> {
  const session = activeChainSessions.get(sessionId);
  if (!session || session.status !== 'in_progress') return;

  const userTeamId = session.participantTeams.get(userId);
  if (!userTeamId) return; // spectator

  if (userTeamId !== session.currentTurnTeamId) {
    socket.emit('error', { message: "It is not your team's turn" });
    return;
  }

  const upper = word.trim().toUpperCase();

  // ── Validation layer ──────────────────────────────────────────────────────

  if (upper.length < MIN_WORD_LENGTH) {
    socket.emit('chain:invalid', { reason: 'too_short', word: upper });
    return;
  }

  if (!upper.startsWith(session.requiredLetter)) {
    socket.emit('chain:invalid', { reason: 'wrong_letter', word: upper });
    return;
  }

  if (session.usedWords.includes(upper)) {
    socket.emit('chain:invalid', { reason: 'already_used', word: upper });
    return;
  }

  if (session.wrongAttempts.includes(upper)) {
    socket.emit('chain:invalid', { reason: 'already_tried', word: upper });
    return;
  }

  // Dictionary check (Bible bank first, then Free Dictionary API)
  const { valid, isBibleWord } = await validateWord(upper);

  if (!valid) {
    session.wrongAttempts.push(upper);
    await logTurn(session.sessionId, userTeamId, userId, { type: 'word', value: upper }, false, 0);

    const teamName = userTeamId === session.teamAId ? session.teamAName : session.teamBName;
    io.to(sessionId).emit('chain:attempt', { word: upper, teamId: userTeamId, teamName, isBibleWord: false });
    return;
  }

  // ── Correct word ──────────────────────────────────────────────────────────

  clearTimer(session);

  const points = isBibleWord ? POINTS_BIBLE : POINTS_ENGLISH;
  if (userTeamId === session.teamAId) session.teamAScore += points;
  else session.teamBScore += points;

  session.chain.push(upper);
  session.usedWords.push(upper);
  session.requiredLetter = nextRequiredLetter(upper);

  const teamName = userTeamId === session.teamAId ? session.teamAName : session.teamBName;

  await logTurn(session.sessionId, userTeamId, userId, { type: 'word', value: upper }, true, points);
  await persistScore(sessionId, session.teamAScore, session.teamBScore);

  io.to(sessionId).emit('chain:correct', {
    word: upper,
    isBibleWord,
    teamId: userTeamId,
    teamName,
    pointsAwarded: points,
    nextLetter: session.requiredLetter,
    chain: session.chain,
  });
  io.to(sessionId).emit('game:score', {
    teamAScore: session.teamAScore,
    teamBScore: session.teamBScore,
  });

  if (session.turnNumber >= TOTAL_TURNS) {
    await endGame(io, session);
  } else if (session.turnNumber === TOTAL_TURNS / 2 && session.currentHalf === 1) {
    setTimeout(() => triggerHalfTime(io, session), 3000);
  } else {
    switchTurn(session);
    setTimeout(() => startNextTurn(io, session), 3000);
  }
}

export function registerChainParticipantSocket(
  session: ActiveChainSession,
  userId: string,
  socketId: string,
): void {
  session.participantSockets.set(userId, socketId);
}

export function unregisterChainParticipantSocket(session: ActiveChainSession, userId: string): void {
  session.participantSockets.delete(userId);
}

export function getCurrentChainState(sessionId: string): GameStatePayload | null {
  const session = activeChainSessions.get(sessionId);
  if (!session) return null;
  return buildStatePayload(session);
}

export function startChainSecondHalf(io: Server, sessionId: string): void {
  const session = activeChainSessions.get(sessionId);
  if (!session || session.status !== 'half_time') return;
  if (session.halfTimeTimer) { clearTimeout(session.halfTimeTimer); session.halfTimeTimer = null; }
  beginSecondHalf(io, session);
}
