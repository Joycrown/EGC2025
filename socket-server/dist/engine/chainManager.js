"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activeChainSessions = void 0;
exports.startChainGame = startChainGame;
exports.handleChainGuess = handleChainGuess;
exports.registerChainParticipantSocket = registerChainParticipantSocket;
exports.unregisterChainParticipantSocket = unregisterChainParticipantSocket;
exports.getCurrentChainState = getCurrentChainState;
const wordChain_1 = require("../games/wordChain");
const wordValidator_1 = require("../games/wordValidator");
const scoreEngine_1 = require("./scoreEngine");
const prisma_1 = require("../db/prisma");
exports.activeChainSessions = new Map();
const TURN_SECONDS = 40;
const TOTAL_TURNS = 20;
const POINTS_BIBLE = 3; // word found in the curated Bible bank
const POINTS_ENGLISH = 1; // valid English word not in Bible bank
const MIN_WORD_LENGTH = 4;
function toChainClientState(session) {
    return {
        chain: session.chain,
        requiredLetter: session.requiredLetter,
        wrongAttempts: session.wrongAttempts,
        turnNumber: session.turnNumber,
        totalTurns: session.totalTurns,
    };
}
function buildStatePayload(session) {
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
function clearTimer(session) {
    if (session.timer) {
        clearInterval(session.timer);
        session.timer = null;
    }
}
function emitMicControl(io, session) {
    Array.from(session.participantSockets.entries()).forEach(([userId, socketId]) => {
        const teamId = session.participantTeams.get(userId);
        io.to(socketId).emit('mic:control', { enabled: teamId === session.currentTurnTeamId });
    });
}
function switchTurn(session) {
    session.currentTurnTeamId =
        session.currentTurnTeamId === session.teamAId ? session.teamBId : session.teamAId;
}
function startTurnTimer(io, session) {
    clearTimer(session);
    session.timer = setInterval(() => {
        session.timeLeft -= 1;
        io.to(session.sessionId).emit('game:tick', { timeLeft: session.timeLeft });
        if (session.timeLeft <= 0)
            handleTurnTimeout(io, session);
    }, 1000);
}
async function handleTurnTimeout(io, session) {
    clearTimer(session);
    const teamName = session.currentTurnTeamId === session.teamAId
        ? session.teamAName : session.teamBName;
    // Required letter carries over — same starting constraint for the other team
    io.to(session.sessionId).emit('chain:timeout', {
        teamId: session.currentTurnTeamId,
        teamName,
        requiredLetter: session.requiredLetter,
    });
    await (0, scoreEngine_1.logTurn)(session.sessionId, session.currentTurnTeamId, null, { type: 'timeout' }, false, 0);
    await (0, scoreEngine_1.persistScore)(session.sessionId, session.teamAScore, session.teamBScore);
    if (session.turnNumber >= TOTAL_TURNS) {
        await endGame(io, session);
    }
    else {
        switchTurn(session);
        setTimeout(() => startNextTurn(io, session), 3000);
    }
}
function startNextTurn(io, session) {
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
async function endGame(io, session) {
    clearTimer(session);
    session.status = 'completed';
    const winnerId = session.teamAScore > session.teamBScore ? session.teamAId :
        session.teamBScore > session.teamAScore ? session.teamBId : null;
    const winnerName = winnerId
        ? winnerId === session.teamAId ? session.teamAName : session.teamBName
        : null;
    await (0, scoreEngine_1.finalizeSession)(session.sessionId, winnerId, session.teamAScore, session.teamBScore);
    io.to(session.sessionId).emit('game:ended', {
        winnerId,
        winnerName,
        teamAScore: session.teamAScore,
        teamBScore: session.teamBScore,
    });
    exports.activeChainSessions.delete(session.sessionId);
}
// ─── Public API ───────────────────────────────────────────────────────────────
async function startChainGame(io, sessionId) {
    const dbSession = await prisma_1.prisma.gameSession.findUnique({
        where: { id: sessionId },
        include: { teamA: true, teamB: true, roster: { include: { user: true } } },
    });
    if (!dbSession)
        throw new Error('Session not found');
    if (dbSession.status === 'IN_PROGRESS')
        throw new Error('Game already in progress');
    const participantTeams = new Map();
    dbSession.roster.forEach(r => { participantTeams.set(r.userId, r.teamId); });
    const assignment = dbSession.poolAssignment;
    const testMode = assignment?.testMode === true;
    const totalTurns = testMode ? 6 : TOTAL_TURNS;
    const startingLetter = (0, wordChain_1.pickSafeLetter)();
    const session = {
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
        chain: [],
        usedWords: [],
        wrongAttempts: [],
        turnNumber: 1,
        totalTurns,
        participantSockets: new Map(),
        participantTeams,
        status: 'in_progress',
    };
    exports.activeChainSessions.set(sessionId, session);
    await prisma_1.prisma.gameSession.update({
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
async function handleChainGuess(io, socket, sessionId, userId, word) {
    const session = exports.activeChainSessions.get(sessionId);
    if (!session || session.status !== 'in_progress')
        return;
    const userTeamId = session.participantTeams.get(userId);
    if (!userTeamId)
        return; // spectator
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
    const { valid, isBibleWord } = await (0, wordValidator_1.validateWord)(upper);
    if (!valid) {
        session.wrongAttempts.push(upper);
        await (0, scoreEngine_1.logTurn)(session.sessionId, userTeamId, userId, { type: 'word', value: upper }, false, 0);
        const teamName = userTeamId === session.teamAId ? session.teamAName : session.teamBName;
        io.to(sessionId).emit('chain:attempt', { word: upper, teamId: userTeamId, teamName, isBibleWord: false });
        return;
    }
    // ── Correct word ──────────────────────────────────────────────────────────
    clearTimer(session);
    const points = isBibleWord ? POINTS_BIBLE : POINTS_ENGLISH;
    if (userTeamId === session.teamAId)
        session.teamAScore += points;
    else
        session.teamBScore += points;
    session.chain.push(upper);
    session.usedWords.push(upper);
    session.requiredLetter = (0, wordChain_1.nextRequiredLetter)(upper);
    const teamName = userTeamId === session.teamAId ? session.teamAName : session.teamBName;
    await (0, scoreEngine_1.logTurn)(session.sessionId, userTeamId, userId, { type: 'word', value: upper }, true, points);
    await (0, scoreEngine_1.persistScore)(sessionId, session.teamAScore, session.teamBScore);
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
    }
    else {
        switchTurn(session);
        setTimeout(() => startNextTurn(io, session), 3000);
    }
}
function registerChainParticipantSocket(session, userId, socketId) {
    session.participantSockets.set(userId, socketId);
}
function unregisterChainParticipantSocket(session, userId) {
    session.participantSockets.delete(userId);
}
function getCurrentChainState(sessionId) {
    const session = exports.activeChainSessions.get(sessionId);
    if (!session)
        return null;
    return buildStatePayload(session);
}
