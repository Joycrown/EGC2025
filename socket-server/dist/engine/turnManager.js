"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activeSessions = void 0;
exports.startGame = startGame;
exports.handleHangmanGuess = handleHangmanGuess;
exports.registerParticipantSocket = registerParticipantSocket;
exports.unregisterParticipantSocket = unregisterParticipantSocket;
exports.getCurrentState = getCurrentState;
const hangman_1 = require("../games/hangman");
const scoreEngine_1 = require("./scoreEngine");
const prisma_1 = require("../db/prisma");
exports.activeSessions = new Map();
const MAX_SECONDS = 40; // hard cap on timer
const BONUS_SECONDS = 5; // added per correct letter
const TOTAL_WORDS = 20; // 10 per team, alternating
const WORD_POINTS = 5; // flat points for solving a word
function buildStatePayload(session) {
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
        hangman: (0, hangman_1.toClientState)(session.hangman),
    };
}
function emitMicControl(io, session, activeTeamId) {
    Array.from(session.participantSockets.entries()).forEach(([userId, socketId]) => {
        const teamId = session.participantTeams.get(userId);
        io.to(socketId).emit('mic:control', { enabled: teamId === activeTeamId });
    });
}
function clearTimer(session) {
    if (session.timer) {
        clearInterval(session.timer);
        session.timer = null;
    }
}
function startWordTimer(io, session) {
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
async function handleWordFailed(io, session, reason) {
    clearTimer(session);
    io.to(session.sessionId).emit('hangman:failed', {
        word: session.hangman.word,
        reason,
    });
    await (0, scoreEngine_1.logTurn)(session.sessionId, session.currentTurnTeamId, null, { type: reason }, false, 0);
    await (0, scoreEngine_1.persistScore)(session.sessionId, session.teamAScore, session.teamBScore);
    if (session.wordNumber >= TOTAL_WORDS) {
        await endGame(io, session);
    }
    else {
        setTimeout(() => startNextWord(io, session), 3000);
    }
}
function startNextWord(io, session) {
    // Alternate word ownership
    session.currentTurnTeamId =
        session.currentTurnTeamId === session.teamAId ? session.teamBId : session.teamAId;
    session.wordNumber += 1;
    const nextEntry = (0, hangman_1.pickRandomWord)(session.usedWords);
    session.usedWords.push(nextEntry.word);
    session.hangman = (0, hangman_1.initHangmanState)(nextEntry, session.wordNumber, TOTAL_WORDS);
    session.timeLeft = MAX_SECONDS;
    io.to(session.sessionId).emit('game:state', buildStatePayload(session));
    io.to(session.sessionId).emit('game:turn', {
        teamId: session.currentTurnTeamId,
        teamName: session.currentTurnTeamId === session.teamAId ? session.teamAName : session.teamBName,
        timeLeft: MAX_SECONDS,
    });
    emitMicControl(io, session, session.currentTurnTeamId);
    startWordTimer(io, session);
}
async function endGame(io, session) {
    clearTimer(session);
    session.status = 'completed';
    const winnerId = session.teamAScore > session.teamBScore
        ? session.teamAId
        : session.teamBScore > session.teamAScore
            ? session.teamBId
            : null;
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
    exports.activeSessions.delete(session.sessionId);
}
// --- Public API ---
async function startGame(io, sessionId) {
    const dbSession = await prisma_1.prisma.gameSession.findUnique({
        where: { id: sessionId },
        include: {
            teamA: true,
            teamB: true,
            roster: { include: { user: true } },
        },
    });
    if (!dbSession)
        throw new Error('Session not found');
    if (dbSession.status === 'IN_PROGRESS')
        throw new Error('Game already in progress');
    const assignment = dbSession.poolAssignment;
    const testMode = assignment?.testMode === true;
    const preUsed = testMode
        ? hangman_1.WORD_BANK.filter(e => !hangman_1.TEST_WORD_BANK_WORDS.includes(e.word)).map(e => e.word)
        : (assignment?.words ? hangman_1.WORD_BANK.filter(e => !assignment.words.includes(e.word)).map(e => e.word) : []);
    const firstEntry = (0, hangman_1.pickRandomWord)(preUsed);
    const hangman = (0, hangman_1.initHangmanState)(firstEntry, 1, TOTAL_WORDS);
    const participantSockets = new Map();
    const participantTeams = new Map();
    dbSession.roster.forEach(r => {
        participantTeams.set(r.userId, r.teamId);
    });
    const session = {
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
        usedWords: [...preUsed, firstEntry.word],
        wordNumber: 1,
    };
    exports.activeSessions.set(sessionId, session);
    await prisma_1.prisma.gameSession.update({
        where: { id: sessionId },
        data: { status: 'IN_PROGRESS', startedAt: new Date(), currentTurnTeamId: dbSession.teamAId },
    });
    io.to(sessionId).emit('game:started', buildStatePayload(session));
    // Announce word 1 — mic:control sent per-socket in gameRoom join handler
    io.to(sessionId).emit('game:turn', {
        teamId: session.currentTurnTeamId,
        teamName: session.teamAName,
        timeLeft: MAX_SECONDS,
    });
    startWordTimer(io, session);
}
async function handleHangmanGuess(io, socket, sessionId, userId, letter) {
    const session = exports.activeSessions.get(sessionId);
    if (!session || session.status !== 'in_progress')
        return;
    const userTeamId = session.participantTeams.get(userId);
    if (!userTeamId)
        return; // spectator
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
    const { correct, newMasked } = (0, hangman_1.checkLetter)(session.hangman, upper);
    if (correct) {
        session.hangman.guessedLetters.push(upper);
        session.hangman.maskedWord = newMasked;
        // Add 5s per correct letter, capped at MAX_SECONDS
        session.timeLeft = Math.min(MAX_SECONDS, session.timeLeft + BONUS_SECONDS);
        io.to(sessionId).emit('game:tick', { timeLeft: session.timeLeft });
    }
    else {
        session.hangman.wrongLetters.push(upper);
        session.hangman.guessedLetters.push(upper);
        session.hangman.wrongCount += 1;
    }
    await (0, scoreEngine_1.logTurn)(session.sessionId, userTeamId, userId, { type: 'letter', value: upper }, correct, 0);
    io.to(sessionId).emit('hangman:update', (0, hangman_1.toClientState)(session.hangman));
    // Check: word solved
    if ((0, hangman_1.isWordSolved)(session.hangman.maskedWord)) {
        clearTimer(session);
        session.hangman.wordSolved = true;
        // Award flat 5 points to the word-owner team
        if (session.currentTurnTeamId === session.teamAId) {
            session.teamAScore += WORD_POINTS;
        }
        else {
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
        await (0, scoreEngine_1.persistScore)(sessionId, session.teamAScore, session.teamBScore);
        if (session.wordNumber >= TOTAL_WORDS) {
            await endGame(io, session);
        }
        else {
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
function registerParticipantSocket(session, userId, socketId) {
    session.participantSockets.set(userId, socketId);
}
function unregisterParticipantSocket(session, userId) {
    session.participantSockets.delete(userId);
}
function getCurrentState(sessionId) {
    const session = exports.activeSessions.get(sessionId);
    if (!session)
        return null;
    return buildStatePayload(session);
}
