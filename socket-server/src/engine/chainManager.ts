import { Server, Socket } from 'socket.io';
import { ActiveChainSession, ChainClientState, GameStatePayload } from '../types';
import { pickWordForLetter, pickSafeLetter, nextRequiredLetter } from '../games/wordChain';
import { logTurn, persistScore, finalizeSession } from './scoreEngine';
import { prisma } from '../db/prisma';

export const activeChainSessions = new Map<string, ActiveChainSession>();

const TURN_SECONDS = 40;
const TOTAL_TURNS = 20;
const WORD_POINTS = 5;

function toChainClientState(session: ActiveChainSession): ChainClientState {
  return {
    chain: session.chain,
    requiredLetter: session.requiredLetter,
    category: session.category,
    hint: session.hint,
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
  if (session.timer) {
    clearInterval(session.timer);
    session.timer = null;
  }
}

function emitMicControl(io: Server, session: ActiveChainSession): void {
  Array.from(session.participantSockets.entries()).forEach(([userId, socketId]) => {
    const teamId = session.participantTeams.get(userId);
    io.to(socketId).emit('mic:control', { enabled: teamId === session.currentTurnTeamId });
  });
}

function startTurnTimer(io: Server, session: ActiveChainSession): void {
  clearTimer(session);

  session.timer = setInterval(() => {
    session.timeLeft -= 1;
    io.to(session.sessionId).emit('game:tick', { timeLeft: session.timeLeft });

    if (session.timeLeft <= 0) {
      handleTurnTimeout(io, session);
    }
  }, 1000);
}

async function handleTurnTimeout(io: Server, session: ActiveChainSession): Promise<void> {
  clearTimer(session);
  session.consecutiveFailures += 1;

  const teamName = session.currentTurnTeamId === session.teamAId
    ? session.teamAName : session.teamBName;

  // Reveal the word everyone was trying to guess
  io.to(session.sessionId).emit('chain:timeout', {
    correctWord: session.currentWord,
    teamId: session.currentTurnTeamId,
    teamName,
  });

  await logTurn(session.sessionId, session.currentTurnTeamId, null, { type: 'timeout' }, false, 0);
  await persistScore(session.sessionId, session.teamAScore, session.teamBScore);

  // If 2 consecutive failures on same letter, advance to a new one
  if (session.consecutiveFailures >= 2) {
    session.requiredLetter = pickSafeLetter(session.usedWords, session.requiredLetter);
    session.consecutiveFailures = 0;
  }

  if (session.turnNumber >= TOTAL_TURNS) {
    await endGame(io, session);
  } else {
    setTimeout(() => startNextTurn(io, session), 3000);
  }
}

function startNextTurn(io: Server, session: ActiveChainSession): void {
  session.turnNumber += 1;
  session.currentTurnTeamId =
    session.currentTurnTeamId === session.teamAId ? session.teamBId : session.teamAId;

  // Pick a word from the bank starting with the required letter
  const entry = pickWordForLetter(session.requiredLetter, session.usedWords);
  if (entry) {
    session.currentWord = entry.word;
    session.category = entry.category;
    session.hint = entry.hint ?? '';
    session.usedWords.push(entry.word);
  } else {
    // No words left for this letter — pick a safe new letter
    session.requiredLetter = pickSafeLetter(session.usedWords);
    const fallback = pickWordForLetter(session.requiredLetter, session.usedWords)!;
    session.currentWord = fallback.word;
    session.category = fallback.category;
    session.hint = fallback.hint ?? '';
    session.usedWords.push(fallback.word);
  }

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

async function endGame(io: Server, session: ActiveChainSession): Promise<void> {
  clearTimer(session);
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

  const startingLetter = pickSafeLetter([]);
  const firstEntry = pickWordForLetter(startingLetter, [])!;

  const session: ActiveChainSession = {
    sessionId,
    teamAId: dbSession.teamAId,
    teamBId: dbSession.teamBId,
    teamAName: dbSession.teamA.name,
    teamBName: dbSession.teamB.name,
    currentTurnTeamId: dbSession.teamAId,
    timer: null,
    timeLeft: TURN_SECONDS,
    teamAScore: 0,
    teamBScore: 0,
    requiredLetter: startingLetter,
    currentWord: firstEntry.word,
    category: firstEntry.category,
    hint: firstEntry.hint ?? '',
    wrongAttempts: [],
    chain: [],
    usedWords: [firstEntry.word],
    turnNumber: 1,
    totalTurns: TOTAL_TURNS,
    consecutiveFailures: 0,
    participantSockets: new Map(),
    participantTeams,
    status: 'in_progress',
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

  // Client-side already validates the starting letter, but double-check server-side
  if (!upper.startsWith(session.requiredLetter)) {
    socket.emit('chain:invalid', { reason: 'wrong_letter', word: upper });
    return;
  }

  // Already tried this word this turn
  if (session.wrongAttempts.includes(upper)) {
    socket.emit('chain:invalid', { reason: 'already_tried', word: upper });
    return;
  }

  if (upper === session.currentWord) {
    // Correct!
    clearTimer(session);
    session.consecutiveFailures = 0;
    session.chain.push(session.currentWord);

    if (userTeamId === session.teamAId) session.teamAScore += WORD_POINTS;
    else session.teamBScore += WORD_POINTS;

    const teamName = userTeamId === session.teamAId ? session.teamAName : session.teamBName;
    const solvedWord = session.currentWord;

    // Compute next required letter before moving on
    session.requiredLetter = nextRequiredLetter(solvedWord, session.usedWords);

    await logTurn(session.sessionId, userTeamId, userId, { type: 'word', value: solvedWord }, true, WORD_POINTS);
    await persistScore(sessionId, session.teamAScore, session.teamBScore);

    io.to(sessionId).emit('chain:correct', {
      word: solvedWord,
      category: session.category,
      teamId: userTeamId,
      teamName,
      pointsAwarded: WORD_POINTS,
      nextLetter: session.requiredLetter,
      chain: session.chain,
    });
    io.to(sessionId).emit('game:score', {
      teamAScore: session.teamAScore,
      teamBScore: session.teamBScore,
    });

    if (session.turnNumber >= TOTAL_TURNS) {
      await endGame(io, session);
    } else {
      setTimeout(() => startNextTurn(io, session), 3000);
    }
  } else {
    // Wrong — add to attempts list and broadcast so everyone can see what was tried
    session.wrongAttempts.push(upper);
    await logTurn(session.sessionId, userTeamId, userId, { type: 'word', value: upper }, false, 0);

    const teamName = userTeamId === session.teamAId ? session.teamAName : session.teamBName;

    io.to(sessionId).emit('chain:attempt', {
      word: upper,
      teamId: userTeamId,
      teamName,
    });
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
