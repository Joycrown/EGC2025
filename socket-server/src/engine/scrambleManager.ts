import { Server, Socket } from 'socket.io';
import { ActiveScrambleSession, GameStatePayload } from '../types';
import { pickRandomWord, scrambleWord, toScrambleClientState, isCorrectAnswer } from '../games/wordScramble';
import { logTurn, persistScore, finalizeSession } from './scoreEngine';
import { prisma } from '../db/prisma';

export const activeScrambleSessions = new Map<string, ActiveScrambleSession>();

const MAX_SECONDS = 40;
const TOTAL_WORDS = 20;
const WORD_POINTS = 5;
const WRONG_COOLDOWN_MS = 3000;  // 3s lockout per team after wrong answer

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
    currentTurnTeamId: '',   // not applicable in race format
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

function enableAllMics(io: Server, session: ActiveScrambleSession): void {
  Array.from(session.participantSockets.entries()).forEach(([, socketId]) => {
    io.to(socketId).emit('mic:control', { enabled: true });
  });
}

function startWordTimer(io: Server, session: ActiveScrambleSession): void {
  clearTimer(session);

  session.timer = setInterval(() => {
    session.timeLeft -= 1;
    io.to(session.sessionId).emit('game:tick', { timeLeft: session.timeLeft });

    if (session.timeLeft <= 0) {
      handleWordTimeout(io, session);
    }
  }, 1000);
}

async function handleWordTimeout(io: Server, session: ActiveScrambleSession): Promise<void> {
  clearTimer(session);

  io.to(session.sessionId).emit('scramble:timeout', {
    word: session.currentWord,
  });

  await logTurn(session.sessionId, '', null, { type: 'timeout' }, false, 0);
  await persistScore(session.sessionId, session.teamAScore, session.teamBScore);

  if (session.wordNumber >= TOTAL_WORDS) {
    await endGame(io, session);
  } else {
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
  session.timeLeft = MAX_SECONDS;
  session.wordSolved = false;
  session.teamACooldownUntil = 0;
  session.teamBCooldownUntil = 0;

  io.to(session.sessionId).emit('game:state', buildStatePayload(session));
  startWordTimer(io, session);
}

async function endGame(io: Server, session: ActiveScrambleSession): Promise<void> {
  clearTimer(session);
  session.status = 'completed';

  const winnerId =
    session.teamAScore > session.teamBScore
      ? session.teamAId
      : session.teamBScore > session.teamAScore
      ? session.teamBId
      : null;

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
    include: {
      teamA: true,
      teamB: true,
      roster: { include: { user: true } },
    },
  });

  if (!dbSession) throw new Error('Session not found');
  if (dbSession.status === 'IN_PROGRESS') throw new Error('Game already in progress');

  const firstEntry = pickRandomWord();
  const participantTeams = new Map<string, string>();
  dbSession.roster.forEach(r => { participantTeams.set(r.userId, r.teamId); });

  const session: ActiveScrambleSession = {
    sessionId,
    teamAId: dbSession.teamAId,
    teamBId: dbSession.teamBId,
    teamAName: dbSession.teamA.name,
    teamBName: dbSession.teamB.name,
    timer: null,
    turnDuration: MAX_SECONDS,
    timeLeft: MAX_SECONDS,
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
    usedWords: [firstEntry.word],
    teamACooldownUntil: 0,
    teamBCooldownUntil: 0,
  };

  activeScrambleSessions.set(sessionId, session);

  await prisma.gameSession.update({
    where: { id: sessionId },
    data: { status: 'IN_PROGRESS', startedAt: new Date() },
  });

  io.to(sessionId).emit('game:started', buildStatePayload(session));
  enableAllMics(io, session);
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

  // Team cooldown check
  const now = Date.now();
  const cooldownUntil = userTeamId === session.teamAId
    ? session.teamACooldownUntil
    : session.teamBCooldownUntil;

  if (now < cooldownUntil) {
    const remaining = Math.ceil((cooldownUntil - now) / 1000);
    socket.emit('scramble:cooldown', { seconds: remaining });
    return;
  }

  if (isCorrectAnswer(answer, session.currentWord)) {
    clearTimer(session);
    session.wordSolved = true;

    // Award points
    if (userTeamId === session.teamAId) {
      session.teamAScore += WORD_POINTS;
    } else {
      session.teamBScore += WORD_POINTS;
    }

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
    } else {
      setTimeout(() => startNextWord(io, session), 3000);
    }
  } else {
    // Wrong answer — apply cooldown to that team
    if (userTeamId === session.teamAId) {
      session.teamACooldownUntil = Date.now() + WRONG_COOLDOWN_MS;
    } else {
      session.teamBCooldownUntil = Date.now() + WRONG_COOLDOWN_MS;
    }

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
