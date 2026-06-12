"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerGameRoomHandlers = registerGameRoomHandlers;
const crypto_1 = require("crypto");
const prisma_1 = require("../db/prisma");
const turnManager_1 = require("../engine/turnManager");
const scrambleManager_1 = require("../engine/scrambleManager");
const chainManager_1 = require("../engine/chainManager");
const categoriesManager_1 = require("../engine/categoriesManager");
const triviaManager_1 = require("../engine/triviaManager");
const auth_1 = require("../middleware/auth");
async function getRoster(sessionId) {
    const entries = await prisma_1.prisma.gameRoster.findMany({
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
function getActiveSession(sessionId) {
    return turnManager_1.activeSessions.get(sessionId)
        ?? scrambleManager_1.activeScrambleSessions.get(sessionId)
        ?? chainManager_1.activeChainSessions.get(sessionId)
        ?? categoriesManager_1.activeCategorySessions.get(sessionId)
        ?? triviaManager_1.activeTrivaSessions.get(sessionId)
        ?? null;
}
async function getSpectatorCount(io, sessionId) {
    const sockets = await io.in(sessionId).fetchSockets();
    const active = getActiveSession(sessionId);
    const participantIds = active && 'participantSockets' in active
        ? new Set(active.participantSockets.keys())
        : new Set();
    return sockets.filter(s => !participantIds.has(s.data.user.id)).length;
}
function registerGameRoomHandlers(io, socket) {
    const user = socket.data.user;
    socket.on('join-room', async (sessionId) => {
        try {
            const dbSession = await prisma_1.prisma.gameSession.findUnique({
                where: { id: sessionId },
                include: { teamA: true, teamB: true },
            });
            if (!dbSession) {
                socket.emit('error', { message: 'Game session not found' });
                return;
            }
            const rosterEntry = await prisma_1.prisma.gameRoster.findUnique({
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
            const hangmanSession = turnManager_1.activeSessions.get(sessionId);
            const scrambleSession = scrambleManager_1.activeScrambleSessions.get(sessionId);
            const chainSession = chainManager_1.activeChainSessions.get(sessionId);
            const categoriesSession = categoriesManager_1.activeCategorySessions.get(sessionId);
            const trivSession = triviaManager_1.activeTrivaSessions.get(sessionId);
            if (isParticipant) {
                if (hangmanSession)
                    (0, turnManager_1.registerParticipantSocket)(hangmanSession, user.id, socket.id);
                if (scrambleSession)
                    (0, scrambleManager_1.registerScrambleParticipantSocket)(scrambleSession, user.id, socket.id);
                if (chainSession)
                    (0, chainManager_1.registerChainParticipantSocket)(chainSession, user.id, socket.id);
            }
            socket.emit('room:joined', { role, teamId, teamName });
            // Send current game state
            const catState = (0, categoriesManager_1.getCategoriesState)(sessionId);
            const trivState = (0, triviaManager_1.getTriviaState)(sessionId);
            const state = (0, turnManager_1.getCurrentState)(sessionId) ?? (0, scrambleManager_1.getCurrentScrambleState)(sessionId) ?? (0, chainManager_1.getCurrentChainState)(sessionId)
                ?? (catState ? { categories: catState, currentTurnTeamId: catState.currentTurnTeamId, timeLeft: catState.timeLeft } : null)
                ?? (trivState ? { trivia: trivState, currentTurnTeamId: trivState.currentTurnTeamId, timeLeft: trivState.timeLeft } : null);
            if (state) {
                socket.emit('game:state', state);
                if (isParticipant) {
                    if (hangmanSession) {
                        socket.emit('mic:control', { enabled: hangmanSession.currentTurnTeamId === teamId });
                    }
                    else if (scrambleSession) {
                        socket.emit('mic:control', { enabled: scrambleSession.currentTurnTeamId === teamId });
                    }
                    else if (chainSession) {
                        socket.emit('mic:control', { enabled: chainSession.currentTurnTeamId === teamId });
                    }
                    else if (categoriesSession) {
                        socket.emit('mic:control', { enabled: categoriesSession.currentTurnTeamId === teamId });
                    }
                    else if (trivSession) {
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
        }
        catch (err) {
            console.error('join-room error', err);
            socket.emit('error', { message: 'Failed to join room' });
        }
    });
    socket.on('hangman:guess', async ({ sessionId, letter }) => {
        if (!letter || typeof letter !== 'string' || letter.length !== 1)
            return;
        await (0, turnManager_1.handleHangmanGuess)(io, socket, sessionId, user.id, letter);
    });
    socket.on('scramble:guess', async ({ sessionId, answer }) => {
        if (!answer || typeof answer !== 'string' || answer.length > 50)
            return;
        await (0, scrambleManager_1.handleScrambleGuess)(io, socket, sessionId, user.id, answer);
    });
    socket.on('chain:guess', async ({ sessionId, word }) => {
        if (!word || typeof word !== 'string' || word.length > 40)
            return;
        await (0, chainManager_1.handleChainGuess)(io, socket, sessionId, user.id, word);
    });
    socket.on('trivia:buzz', async ({ sessionId }) => {
        const ts = triviaManager_1.activeTrivaSessions.get(sessionId);
        if (!ts)
            return;
        const entry = await prisma_1.prisma.gameRoster.findFirst({
            where: { gameSessionId: sessionId, userId: user.id },
            select: { teamId: true },
        });
        if (!entry)
            return;
        (0, triviaManager_1.handleTriviaBuzz)(io, sessionId, entry.teamId);
    });
    socket.on('trivia:answer', async ({ sessionId, answer }) => {
        if (!answer || !['A', 'B', 'C', 'D'].includes(answer.toUpperCase()))
            return;
        const ts = triviaManager_1.activeTrivaSessions.get(sessionId);
        if (!ts)
            return;
        const entry = await prisma_1.prisma.gameRoster.findFirst({
            where: { gameSessionId: sessionId, userId: user.id },
            select: { teamId: true },
        });
        if (!entry)
            return;
        (0, triviaManager_1.handleTriviaAnswer)(io, sessionId, entry.teamId, answer);
    });
    socket.on('categories:guess', async ({ sessionId, answer }) => {
        if (!answer || typeof answer !== 'string' || answer.length > 60)
            return;
        const catSession = categoriesManager_1.activeCategorySessions.get(sessionId);
        if (!catSession)
            return;
        const entry = await prisma_1.prisma.gameRoster.findFirst({
            where: { gameSessionId: sessionId, userId: user.id },
            select: { teamId: true },
        });
        if (!entry)
            return;
        (0, categoriesManager_1.handleCategoriesGuess)(io, sessionId, entry.teamId, user.id, answer);
    });
    socket.on('chat:send', async ({ sessionId, message, replyTo }) => {
        if (!message?.trim() || message.length > 500)
            return;
        try {
            const saved = await prisma_1.prisma.chatMessage.create({
                data: { id: (0, crypto_1.randomUUID)(), gameSessionId: sessionId, userId: user.id, message: message.trim() },
                include: { User: { select: { fullName: true } } },
            });
            io.to(sessionId).emit('chat:message', {
                userId: user.id,
                userName: saved.User.fullName,
                message: saved.message,
                createdAt: saved.createdAt.toISOString(),
                replyTo: replyTo ?? null,
            });
        }
        catch {
            // ignore chat failures silently
        }
    });
    socket.on('admin:start', async ({ sessionId }) => {
        if (!(0, auth_1.isAdmin)(user)) {
            socket.emit('error', { message: 'Admin access required' });
            return;
        }
        try {
            const dbSession = await prisma_1.prisma.gameSession.findUnique({
                where: { id: sessionId },
                select: { gameType: true },
            });
            const gameType = dbSession?.gameType;
            if (gameType === 'WORD_SCRAMBLE') {
                await (0, scrambleManager_1.startScrambleGame)(io, sessionId);
            }
            else if (gameType === 'WORD_CHAIN') {
                await (0, chainManager_1.startChainGame)(io, sessionId);
            }
            else if (gameType === 'BIBLE_CATEGORIES') {
                await (0, categoriesManager_1.startCategoriesGame)(io, sessionId);
            }
            else if (gameType === 'BIBLE_TRIVIA') {
                await (0, triviaManager_1.startTriviaGame)(io, sessionId);
            }
            else {
                await (0, turnManager_1.startGame)(io, sessionId);
            }
            // Register all online participants into the active session
            const hangmanSession = turnManager_1.activeSessions.get(sessionId);
            const scrambleSession = scrambleManager_1.activeScrambleSessions.get(sessionId);
            const chainSession = chainManager_1.activeChainSessions.get(sessionId);
            const activeSession = hangmanSession ?? scrambleSession ?? chainSession;
            if (activeSession) {
                const socketsInRoom = await io.in(sessionId).fetchSockets();
                for (const s of socketsInRoom) {
                    const su = s.data.user;
                    if (activeSession.participantTeams.has(su.id)) {
                        if (hangmanSession)
                            (0, turnManager_1.registerParticipantSocket)(hangmanSession, su.id, s.id);
                        else if (scrambleSession)
                            (0, scrambleManager_1.registerScrambleParticipantSocket)(scrambleSession, su.id, s.id);
                        else if (chainSession)
                            (0, chainManager_1.registerChainParticipantSocket)(chainSession, su.id, s.id);
                    }
                }
                if (hangmanSession) {
                    for (const [uid, sid] of Array.from(hangmanSession.participantSockets.entries())) {
                        const tid = hangmanSession.participantTeams.get(uid);
                        io.to(sid).emit('mic:control', { enabled: tid === hangmanSession.currentTurnTeamId });
                    }
                }
                else if (scrambleSession) {
                    for (const [uid, sid] of Array.from(scrambleSession.participantSockets.entries())) {
                        const tid = scrambleSession.participantTeams.get(uid);
                        io.to(sid).emit('mic:control', { enabled: tid === scrambleSession.currentTurnTeamId });
                    }
                }
                else if (chainSession) {
                    for (const [uid, sid] of Array.from(chainSession.participantSockets.entries())) {
                        const tid = chainSession.participantTeams.get(uid);
                        io.to(sid).emit('mic:control', { enabled: tid === chainSession.currentTurnTeamId });
                    }
                }
            }
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : 'Failed to start game';
            socket.emit('error', { message: msg });
        }
    });
    socket.on('admin:end', async ({ sessionId }) => {
        if (!(0, auth_1.isAdmin)(user)) {
            socket.emit('error', { message: 'Admin access required' });
            return;
        }
        const hangmanSession = turnManager_1.activeSessions.get(sessionId);
        const scrambleSession = scrambleManager_1.activeScrambleSessions.get(sessionId);
        const chainSession = chainManager_1.activeChainSessions.get(sessionId);
        const session = hangmanSession ?? scrambleSession ?? chainSession;
        if (!session)
            return;
        session.status = 'completed';
        if (session.timer)
            clearInterval(session.timer);
        try {
            const { finalizeSession } = await Promise.resolve().then(() => __importStar(require('../engine/scoreEngine')));
            await finalizeSession(sessionId, null, session.teamAScore, session.teamBScore);
        }
        catch (err) {
            console.error('admin:end — finalizeSession failed', err);
        }
        io.to(sessionId).emit('game:ended', {
            winnerId: null,
            winnerName: null,
            teamAScore: session.teamAScore,
            teamBScore: session.teamBScore,
        });
        if (hangmanSession)
            turnManager_1.activeSessions.delete(sessionId);
        else if (scrambleSession)
            scrambleManager_1.activeScrambleSessions.delete(sessionId);
        else
            chainManager_1.activeChainSessions.delete(sessionId);
    });
    socket.on('leave-room', (sessionId) => {
        handleLeave(io, socket, user, sessionId);
    });
    socket.on('disconnect', () => {
        const sessionId = socket.data.sessionId;
        if (sessionId)
            handleLeave(io, socket, user, sessionId);
    });
}
async function handleLeave(io, socket, user, sessionId) {
    socket.leave(sessionId);
    const hangmanSession = turnManager_1.activeSessions.get(sessionId);
    const scrambleSession = scrambleManager_1.activeScrambleSessions.get(sessionId);
    const chainSession = chainManager_1.activeChainSessions.get(sessionId);
    if (hangmanSession)
        (0, turnManager_1.unregisterParticipantSocket)(hangmanSession, user.id);
    if (scrambleSession)
        (0, scrambleManager_1.unregisterScrambleParticipantSocket)(scrambleSession, user.id);
    if (chainSession)
        (0, chainManager_1.unregisterChainParticipantSocket)(chainSession, user.id);
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
