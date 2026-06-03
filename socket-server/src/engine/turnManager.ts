import { Server, Socket } from 'socket.io';
import { ActiveSession, GameStatePayload } from '../types';
import {
  checkLetter,
  initHangmanState,
  isWordSolved,
  pickRandomWord,
  toClientState,
} from '../games/hangman';
import { logTurn, persistScore, finalizeSession } from './scoreEngine';
import { prisma } from '../db/prisma';

export const activeSessions = new Map<string, ActiveSession>();

const MAX_SECONDS = 40;   // hard cap on timer
const BONUS_SECONDS = 5;  // added per correct letter
const TOTAL_WORDS = 20;   // 10 per team, alternating
const WORD_POINTS = 5;    // flat points for solving a word

function buildStatePayload(session: ActiveSession): GameStatePayload {
  return {
    sessionId: session.sessionId,
    gameType: 'HANGMAN',
    teamAId: session.teamAId,
    teamBId: session.teamBId,
    teamAName: session.teamAName,
    teamBName: session.teamBName,
    teamAScore: session.teamAScore,
    teamBScore: session.teamBScore,
    currentTurnTeamId: session.currentTurnTeamId,
    timeLeft: session.timeLeft,
    status: session.status,
    hangman: toClientState(session.hangman),
  };
}

function emitMicControl(io: Server, session: ActiveSession, activeTeamId: string): void {
  Array.from(session.participantSockets.entries()).forEach(([userId, socketId]) => {
    const teamId = session.participantTeams.get(userId);
    io.to(socketId).emit('mic:control', { enabled: teamId === activeTeamId });
  });
}

function clearTimer(session: ActiveSession): void {
  if (session.timer) {
    clearInterval(session.timer);
    session.timer = null;
  }
}

function startWordTimer(io: Server, session: ActiveSession): void {
  clearTimer(session);

  session.timer = setInterval(() => {
    session.timeLeft -= 1;
    io.to(session.sessionId).emit('game:tick', { timeLeft: session.timeLeft });

    if (session.timeLeft <= 0) {
      handleWordFailed(io, session, 'timeout');
    }
  }, 1000);
}

// Word failed — either timeout or hangman complete
async function handleWordFailed(
  io: Server,
  session: ActiveSession,
  reason: 'timeout' | 'hangman'
): Promise<void> {
  clearTimer(session);

  io.to(session.sessionId).emit('hangman:failed', {
    word: session.hangman.word,
    reason,
  });

  await logTurn(session.sessionId, session.currentTurnTeamId, null, { type: reason }, false, 0);
  await persistScore(session.sessionId, session.teamAScore, session.teamBScore);

  if (session.wordNumber >= TOTAL_WORDS) {
    await endGame(io, session);
  } else {
    setTimeout(() => startNextWord(io, session), 3000);
  }
}

function startNextWord(io: Server, session: ActiveSession): void {
  // Alternate word ownership
  session.currentTurnTeamId =
    session.currentTurnTeamId === session.teamAId ? session.teamBId : session.teamAId;

  session.wordNumber += 1;

  const nextEntry = pickRandomWord(session.usedWords);
  session.usedWords.push(nextEntry.word);
  session.hangman = initHangmanState(nextEntry, session.wordNumber, TOTAL_WORDS);
  session.timeLeft = MAX_SECONDS;

  io.to(session.sessionId).emit('game:state', buildStatePayload(session));
  io.to(session.sessionId).emit('game:turn', {
    teamId: session.currentTurnTeamId,
    teamName:
      session.currentTurnTeamId === session.teamAId ? session.teamAName : session.teamBName,
    timeLeft: MAX_SECONDS,
  });

  emitMicControl(io, session, session.currentTurnTeamId);
  startWordTimer(io, session);
}

async function endGame(io: Server, session: ActiveSession): Promise<void> {
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

  activeSessions.delete(session.sessionId);
}

// --- Public API ---

export async function startGame(io: Server, sessionId: string): Promise<void> {
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
  const hangman = initHangmanState(firstEntry, 1, TOTAL_WORDS);

  const participantSockets = new Map<string, string>();
  const participantTeams = new Map<string, string>();

  dbSession.roster.forEach(r => {
    participantTeams.set(r.userId, r.teamId);
  });

  const session: ActiveSession = {
    sessionId,
    teamAId: dbSession.teamAId,
    teamBId: dbSession.teamBId,
    teamAName: dbSession.teamA.name,
    teamBName: dbSession.teamB.name,
    currentTurnTeamId: dbSession.teamAId, // Team A owns word 1
    timer: null,
    turnDuration: MAX_SECONDS,
    timeLeft: MAX_SECONDS,
    teamAScore: 0,
    teamBScore: 0,
    hangman,
    participantSockets,
    participantTeams,
    status: 'in_progress',
    usedWords: [firstEntry.word],
    wordNumber: 1,
  };

  activeSessions.set(sessionId, session);

  await prisma.gameSession.update({
    where: { id: sessionId },
    data: { status: 'IN_PROGRESS', startedAt: new Date(), currentTurnTeamId: dbSession.teamAId },
  });

  io.to(sessionId).emit('game:started', buildStatePayload(session));

  // Announce word 1 and activate Team A's mics
  io.to(sessionId).emit('game:turn', {
    teamId: session.currentTurnTeamId,
    teamName: session.teamAName,
    timeLeft: MAX_SECONDS,
  });
  emitMicControl(io, session, session.currentTurnTeamId);
  startWordTimer(io, session);
}

export async function handleHangmanGuess(
  io: Server,
  socket: Socket,
  sessionId: string,
  userId: string,
  letter: string
): Promise<void> {
  const session = activeSessions.get(sessionId);
  if (!session || session.status !== 'in_progress') return;

  const userTeamId = session.participantTeams.get(userId);
  if (!userTeamId) return; // spectator

  // Only the team that owns this word can guess
  if (userTeamId !== session.currentTurnTeamId) {
    socket.emit('error', { message: 'This is not your word' });
    return;
  }

  const upper = letter.toUpperCase();
  if (session.hangman.guessedLetters.includes(upper)) {
    socket.emit('error', { message: 'Letter already guessed' });
    return;
  }

  const { correct, newMasked } = checkLetter(session.hangman, upper);

  if (correct) {
    session.hangman.guessedLetters.push(upper);
    session.hangman.maskedWord = newMasked;

    // Add 5s per correct letter, capped at MAX_SECONDS
    session.timeLeft = Math.min(MAX_SECONDS, session.timeLeft + BONUS_SECONDS);
    io.to(sessionId).emit('game:tick', { timeLeft: session.timeLeft });
  } else {
    session.hangman.wrongLetters.push(upper);
    session.hangman.guessedLetters.push(upper);
    session.hangman.wrongCount += 1;
  }

  await logTurn(session.sessionId, userTeamId, userId, { type: 'letter', value: upper }, correct, 0);

  io.to(sessionId).emit('hangman:update', toClientState(session.hangman));

  // Check: word solved
  if (isWordSolved(session.hangman.maskedWord)) {
    clearTimer(session);
    session.hangman.wordSolved = true;

    // Award flat 5 points to the word-owner team
    if (session.currentTurnTeamId === session.teamAId) {
      session.teamAScore += WORD_POINTS;
    } else {
      session.teamBScore += WORD_POINTS;
    }

    io.to(sessionId).emit('hangman:solved', {
      word: session.hangman.word,
      teamId: session.currentTurnTeamId,
      pointsAwarded: WORD_POINTS,
    });
    io.to(sessionId).emit('game:score', {
      teamAScore: session.teamAScore,
      teamBScore: session.teamBScore,
    });

    await persistScore(sessionId, session.teamAScore, session.teamBScore);

    if (session.wordNumber >= TOTAL_WORDS) {
      await endGame(io, session);
    } else {
      setTimeout(() => startNextWord(io, session), 3000);
    }
    return;
  }

  // Check: hangman complete (6 wrong guesses)
  if (session.hangman.wrongCount >= session.hangman.maxWrong) {
    await handleWordFailed(io, session, 'hangman');
    return;
  }

  // Otherwise — continue, timer is already running
  io.to(sessionId).emit('game:score', {
    teamAScore: session.teamAScore,
    teamBScore: session.teamBScore,
  });
}

export function registerParticipantSocket(
  session: ActiveSession,
  userId: string,
  socketId: string
): void {
  session.participantSockets.set(userId, socketId);
}

export function unregisterParticipantSocket(session: ActiveSession, userId: string): void {
  session.participantSockets.delete(userId);
}

export function getCurrentState(sessionId: string): GameStatePayload | null {
  const session = activeSessions.get(sessionId);
  if (!session) return null;
  return buildStatePayload(session);
}
