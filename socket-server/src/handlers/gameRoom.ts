import { Server, Socket } from 'socket.io';
import { randomUUID } from 'crypto';
import { prisma } from '../db/prisma';
import { AuthUser } from '../types';
import {
  activeSessions,
  getCurrentState,
  handleHangmanGuess,
  registerParticipantSocket,
  startGame,
  unregisterParticipantSocket,
} from '../engine/turnManager';
import {
  activeScrambleSessions,
  getCurrentScrambleState,
  handleScrambleGuess,
  registerScrambleParticipantSocket,
  startScrambleGame,
  unregisterScrambleParticipantSocket,
} from '../engine/scrambleManager';
import {
  activeChainSessions,
  getCurrentChainState,
  handleChainGuess,
  registerChainParticipantSocket,
  startChainGame,
  unregisterChainParticipantSocket,
} from '../engine/chainManager';
import {
  activeCategorySessions,
  getCategoriesState,
  handleCategoriesGuess,
  startCategoriesGame,
} from '../engine/categoriesManager';
import {
  activeTrivaSessions,
  getTriviaState,
  handleTriviaBuzz,
  handleTriviaAnswer,
  startTriviaGame,
} from '../engine/triviaManager';
import { isAdmin } from '../middleware/auth';

interface RosterEntry {
  userId: string;
  fullName: string;
  teamId: string;
  teamName: string;
}

async function getRoster(sessionId: string): Promise<RosterEntry[]> {
  const entries = await prisma.gameRoster.findMany({
    where: { gameSessionId: sessionId },
    include: { user: { select: { id: true, fullName: true } }, team: { select: { name: true } } },
  });
  return entries.map(e => ({
    userId: e.userId,
    fullName: e.user.fullName,
    teamId: e.teamId,
    teamName: e.team.name,
  }));
}

function getActiveSession(sessionId: string) {
  return activeSessions.get(sessionId)
    ?? activeScrambleSessions.get(sessionId)
    ?? activeChainSessions.get(sessionId)
    ?? activeCategorySessions.get(sessionId)
    ?? activeTrivaSessions.get(sessionId)
    ?? null;
}

async function getSpectatorCount(io: Server, sessionId: string): Promise<number> {
  const sockets = await io.in(sessionId).fetchSockets();
  const active = getActiveSession(sessionId);
  const participantIds = active && 'participantSockets' in active
    ? new Set((active as { participantSockets: Map<string, string> }).participantSockets.keys())
    : new Set<string>();
  return sockets.filter(s => !participantIds.has((s.data.user as AuthUser).id)).length;
}

export function registerGameRoomHandlers(io: Server, socket: Socket): void {
  const user = socket.data.user as AuthUser;

  socket.on('join-room', async (sessionId: string) => {
    try {
      const dbSession = await prisma.gameSession.findUnique({
        where: { id: sessionId },
        include: { teamA: true, teamB: true },
      });

      if (!dbSession) {
        socket.emit('error', { message: 'Game session not found' });
        return;
      }

      const rosterEntry = await prisma.gameRoster.findUnique({
        where: { gameSessionId_userId: { gameSessionId: sessionId, userId: user.id } },
        include: { team: true },
      });

      const isParticipant = !!rosterEntry;
      const role = isParticipant ? 'participant' : 'spectator';
      const teamId = rosterEntry?.teamId ?? null;
      const teamName = rosterEntry?.team?.name ?? null;

      socket.join(sessionId);
      socket.data.sessionId = sessionId;
      socket.data.role = role;

      const hangmanSession = activeSessions.get(sessionId);
      const scrambleSession = activeScrambleSessions.get(sessionId);
      const chainSession = activeChainSessions.get(sessionId);
      const categoriesSession = activeCategorySessions.get(sessionId);
      const trivSession = activeTrivaSessions.get(sessionId);

      if (isParticipant) {
        if (hangmanSession) registerParticipantSocket(hangmanSession, user.id, socket.id);
        if (scrambleSession) registerScrambleParticipantSocket(scrambleSession, user.id, socket.id);
        if (chainSession) registerChainParticipantSocket(chainSession, user.id, socket.id);
      }

      socket.emit('room:joined', { role, teamId, teamName });

      // Send current game state
      const catState = getCategoriesState(sessionId);
      const trivState = getTriviaState(sessionId);
      const state = getCurrentState(sessionId) ?? getCurrentScrambleState(sessionId) ?? getCurrentChainState(sessionId)
        ?? (catState ? { categories: catState } : null)
        ?? (trivState ? { trivia: trivState } : null);
      if (state) {
        socket.emit('game:state', state);

        if (isParticipant) {
          if (hangmanSession) {
            socket.emit('mic:control', { enabled: hangmanSession.currentTurnTeamId === teamId });
          } else if (scrambleSession) {
            socket.emit('mic:control', { enabled: scrambleSession.currentTurnTeamId === teamId });
          } else if (chainSession) {
            socket.emit('mic:control', { enabled: chainSession.currentTurnTeamId === teamId });
          } else if (categoriesSession) {
            socket.emit('mic:control', { enabled: categoriesSession.currentTurnTeamId === teamId });
          } else if (trivSession) {
            socket.emit('mic:control', { enabled: true }); // both teams always active in trivia
          }
        }
      }

      const roster = await getRoster(sessionId);
      const spectatorCount = await getSpectatorCount(io, sessionId);
      const activeSession = hangmanSession ?? scrambleSession ?? chainSession;
      io.to(sessionId).emit('room:roster', {
        participants: roster.map(r => ({
          ...r,
          isOnline: !!(activeSession?.participantSockets.get(r.userId)),
        })),
        spectatorCount,
      });
    } catch (err) {
      console.error('join-room error', err);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  socket.on('hangman:guess', async ({ sessionId, letter }: { sessionId: string; letter: string }) => {
    if (!letter || typeof letter !== 'string' || letter.length !== 1) return;
    await handleHangmanGuess(io, socket, sessionId, user.id, letter);
  });

  socket.on('scramble:guess', async ({ sessionId, answer }: { sessionId: string; answer: string }) => {
    if (!answer || typeof answer !== 'string' || answer.length > 50) return;
    await handleScrambleGuess(io, socket, sessionId, user.id, answer);
  });

  socket.on('chain:guess', async ({ sessionId, word }: { sessionId: string; word: string }) => {
    if (!word || typeof word !== 'string' || word.length > 40) return;
    await handleChainGuess(io, socket, sessionId, user.id, word);
  });

  socket.on('trivia:buzz', async ({ sessionId }: { sessionId: string }) => {
    const ts = activeTrivaSessions.get(sessionId);
    if (!ts) return;
    const entry = await prisma.gameRoster.findFirst({
      where: { gameSessionId: sessionId, userId: user.id },
      select: { teamId: true },
    });
    if (!entry) return;
    handleTriviaBuzz(io, sessionId, entry.teamId);
  });

  socket.on('trivia:answer', async ({ sessionId, answer }: { sessionId: string; answer: string }) => {
    if (!answer || !['A','B','C','D'].includes(answer.toUpperCase())) return;
    const ts = activeTrivaSessions.get(sessionId);
    if (!ts) return;
    const entry = await prisma.gameRoster.findFirst({
      where: { gameSessionId: sessionId, userId: user.id },
      select: { teamId: true },
    });
    if (!entry) return;
    handleTriviaAnswer(io, sessionId, entry.teamId, answer);
  });

  socket.on('categories:guess', async ({ sessionId, answer }: { sessionId: string; answer: string }) => {
    if (!answer || typeof answer !== 'string' || answer.length > 60) return;
    const catSession = activeCategorySessions.get(sessionId);
    if (!catSession) return;
    const entry = await prisma.gameRoster.findFirst({
      where: { gameSessionId: sessionId, userId: user.id },
      select: { teamId: true },
    });
    if (!entry) return;
    handleCategoriesGuess(io, sessionId, entry.teamId, user.id, answer);
  });

  socket.on('chat:send', async ({ sessionId, message }: { sessionId: string; message: string }) => {
    if (!message?.trim() || message.length > 500) return;
    try {
      const saved = await prisma.chatMessage.create({
        data: { id: randomUUID(), gameSessionId: sessionId, userId: user.id, message: message.trim() },
        include: { User: { select: { fullName: true } } },
      });
      io.to(sessionId).emit('chat:message', {
        userId: user.id,
        userName: saved.User.fullName,
        message: saved.message,
        createdAt: saved.createdAt.toISOString(),
      });
    } catch {
      // ignore chat failures silently
    }
  });

  socket.on('admin:start', async ({ sessionId }: { sessionId: string }) => {
    if (!isAdmin(user)) {
      socket.emit('error', { message: 'Admin access required' });
      return;
    }
    try {
      const dbSession = await prisma.gameSession.findUnique({
        where: { id: sessionId },
        select: { gameType: true },
      });

      const gameType = dbSession?.gameType as string | undefined;
      if (gameType === 'WORD_SCRAMBLE') {
        await startScrambleGame(io, sessionId);
      } else if (gameType === 'WORD_CHAIN') {
        await startChainGame(io, sessionId);
      } else if (gameType === 'BIBLE_CATEGORIES') {
        await startCategoriesGame(io, sessionId);
      } else if (gameType === 'BIBLE_TRIVIA') {
        await startTriviaGame(io, sessionId);
      } else {
        await startGame(io, sessionId);
      }

      // Register all online participants into the active session
      const hangmanSession = activeSessions.get(sessionId);
      const scrambleSession = activeScrambleSessions.get(sessionId);
      const chainSession = activeChainSessions.get(sessionId);
      const activeSession = hangmanSession ?? scrambleSession ?? chainSession;

      if (activeSession) {
        const socketsInRoom = await io.in(sessionId).fetchSockets();
        for (const s of socketsInRoom) {
          const su = s.data.user as AuthUser;
          if (activeSession.participantTeams.has(su.id)) {
            if (hangmanSession) registerParticipantSocket(hangmanSession, su.id, s.id);
            else if (scrambleSession) registerScrambleParticipantSocket(scrambleSession, su.id, s.id);
            else if (chainSession) registerChainParticipantSocket(chainSession, su.id, s.id);
          }
        }

        if (hangmanSession) {
          for (const [uid, sid] of Array.from(hangmanSession.participantSockets.entries())) {
            const tid = hangmanSession.participantTeams.get(uid);
            io.to(sid).emit('mic:control', { enabled: tid === hangmanSession.currentTurnTeamId });
          }
        } else if (scrambleSession) {
          for (const [uid, sid] of Array.from(scrambleSession.participantSockets.entries())) {
            const tid = scrambleSession.participantTeams.get(uid);
            io.to(sid).emit('mic:control', { enabled: tid === scrambleSession.currentTurnTeamId });
          }
        } else if (chainSession) {
          for (const [uid, sid] of Array.from(chainSession.participantSockets.entries())) {
            const tid = chainSession.participantTeams.get(uid);
            io.to(sid).emit('mic:control', { enabled: tid === chainSession.currentTurnTeamId });
          }
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to start game';
      socket.emit('error', { message: msg });
    }
  });

  socket.on('admin:end', async ({ sessionId }: { sessionId: string }) => {
    if (!isAdmin(user)) {
      socket.emit('error', { message: 'Admin access required' });
      return;
    }

    const hangmanSession = activeSessions.get(sessionId);
    const scrambleSession = activeScrambleSessions.get(sessionId);
    const chainSession = activeChainSessions.get(sessionId);
    const session = hangmanSession ?? scrambleSession ?? chainSession;
    if (!session) return;

    session.status = 'completed';
    if (session.timer) clearInterval(session.timer);

    try {
      const { finalizeSession } = await import('../engine/scoreEngine');
      await finalizeSession(sessionId, null, session.teamAScore, session.teamBScore);
    } catch (err) {
      console.error('admin:end — finalizeSession failed', err);
    }

    io.to(sessionId).emit('game:ended', {
      winnerId: null,
      winnerName: null,
      teamAScore: session.teamAScore,
      teamBScore: session.teamBScore,
    });

    if (hangmanSession) activeSessions.delete(sessionId);
    else if (scrambleSession) activeScrambleSessions.delete(sessionId);
    else activeChainSessions.delete(sessionId);
  });

  socket.on('leave-room', (sessionId: string) => {
    handleLeave(io, socket, user, sessionId);
  });

  socket.on('disconnect', () => {
    const sessionId = socket.data.sessionId as string | undefined;
    if (sessionId) handleLeave(io, socket, user, sessionId);
  });
}

async function handleLeave(io: Server, socket: Socket, user: AuthUser, sessionId: string): Promise<void> {
  socket.leave(sessionId);

  const hangmanSession = activeSessions.get(sessionId);
  const scrambleSession = activeScrambleSessions.get(sessionId);
  const chainSession = activeChainSessions.get(sessionId);

  if (hangmanSession) unregisterParticipantSocket(hangmanSession, user.id);
  if (scrambleSession) unregisterScrambleParticipantSocket(scrambleSession, user.id);
  if (chainSession) unregisterChainParticipantSocket(chainSession, user.id);

  const roster = await getRoster(sessionId).catch(() => []);
  const spectatorCount = await getSpectatorCount(io, sessionId);
  const activeSession = hangmanSession ?? scrambleSession ?? chainSession;
  io.to(sessionId).emit('room:roster', {
    participants: roster.map(r => ({
      ...r,
      isOnline: !!(activeSession?.participantSockets.get(r.userId)),
    })),
    spectatorCount,
  });
}
