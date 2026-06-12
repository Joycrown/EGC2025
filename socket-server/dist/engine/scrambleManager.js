"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activeScrambleSessions = void 0;
exports.startScrambleGame = startScrambleGame;
exports.handleScrambleGuess = handleScrambleGuess;
exports.registerScrambleParticipantSocket = registerScrambleParticipantSocket;
exports.unregisterScrambleParticipantSocket = unregisterScrambleParticipantSocket;
exports.getCurrentScrambleState = getCurrentScrambleState;
const wordScramble_1 = require("../games/wordScramble");
const hangman_1 = require("../games/hangman");
const scoreEngine_1 = require("./scoreEngine");
const prisma_1 = require("../db/prisma");
exports.activeScrambleSessions = new Map();
const TURN_SECONDS = 30;
const TOTAL_WORDS = 20;
const WORD_POINTS = 5;
function buildStatePayload(session) {
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
        scramble: (0, wordScramble_1.toScrambleClientState)(session.scrambledWord, session.category, session.hint, session.wordNumber, session.totalWords, session.wordSolved),
    };
}
function clearTimer(session) {
    if (session.timer) {
        clearInterval(session.timer);
        session.timer = null;
    }
}
// Only the active team's mic is on — same pattern as all other turn-based games
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
function startWordTimer(io, session) {
    clearTimer(session);
    session.timer = setInterval(() => {
        session.timeLeft -= 1;
        io.to(session.sessionId).emit('game:tick', { timeLeft: session.timeLeft });
        if (session.timeLeft <= 0)
            handleWordTimeout(io, session);
    }, 1000);
}
async function handleWordTimeout(io, session) {
    clearTimer(session);
    const teamName = session.currentTurnTeamId === session.teamAId
        ? session.teamAName : session.teamBName;
    io.to(session.sessionId).emit('scramble:timeout', {
        word: session.currentWord,
        teamId: session.currentTurnTeamId,
        teamName,
    });
    await (0, scoreEngine_1.logTurn)(session.sessionId, session.currentTurnTeamId, null, { type: 'timeout' }, false, 0);
    await (0, scoreEngine_1.persistScore)(session.sessionId, session.teamAScore, session.teamBScore);
    if (session.wordNumber >= TOTAL_WORDS) {
        await endGame(io, session);
    }
    else {
        switchTurn(session);
        setTimeout(() => startNextWord(io, session), 3000);
    }
}
function startNextWord(io, session) {
    session.wordNumber += 1;
    const nextEntry = (0, wordScramble_1.pickRandomWord)(session.usedWords);
    session.usedWords.push(nextEntry.word);
    session.currentWord = nextEntry.word;
    session.scrambledWord = (0, wordScramble_1.scrambleWord)(nextEntry.word);
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
    exports.activeScrambleSessions.delete(session.sessionId);
}
// ─── Public API ───────────────────────────────────────────────────────────────
async function startScrambleGame(io, sessionId) {
    const dbSession = await prisma_1.prisma.gameSession.findUnique({
        where: { id: sessionId },
        include: { teamA: true, teamB: true, roster: { include: { user: true } } },
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
    const firstEntry = (0, wordScramble_1.pickRandomWord)(preUsed);
    const participantTeams = new Map();
    dbSession.roster.forEach(r => { participantTeams.set(r.userId, r.teamId); });
    const session = {
        sessionId,
        teamAId: dbSession.teamAId,
        teamBId: dbSession.teamBId,
        teamAName: dbSession.teamA.name,
        teamBName: dbSession.teamB.name,
        currentTurnTeamId: dbSession.teamAId, // Team A always goes first
        timer: null,
        turnDuration: TURN_SECONDS,
        timeLeft: TURN_SECONDS,
        teamAScore: 0,
        teamBScore: 0,
        currentWord: firstEntry.word,
        scrambledWord: (0, wordScramble_1.scrambleWord)(firstEntry.word),
        category: firstEntry.category,
        hint: firstEntry.hint ?? '',
        wordNumber: 1,
        totalWords: TOTAL_WORDS,
        wordSolved: false,
        participantSockets: new Map(),
        participantTeams,
        status: 'in_progress',
        usedWords: [...preUsed, firstEntry.word],
    };
    exports.activeScrambleSessions.set(sessionId, session);
    await prisma_1.prisma.gameSession.update({
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
async function handleScrambleGuess(io, socket, sessionId, userId, answer) {
    const session = exports.activeScrambleSessions.get(sessionId);
    if (!session || session.status !== 'in_progress')
        return;
    const userTeamId = session.participantTeams.get(userId);
    if (!userTeamId)
        return; // spectator
    // Only the active team can submit
    if (userTeamId !== session.currentTurnTeamId) {
        socket.emit('scramble:not-your-turn');
        return;
    }
    if ((0, wordScramble_1.isCorrectAnswer)(answer, session.currentWord)) {
        clearTimer(session);
        session.wordSolved = true;
        if (userTeamId === session.teamAId)
            session.teamAScore += WORD_POINTS;
        else
            session.teamBScore += WORD_POINTS;
        const teamName = userTeamId === session.teamAId ? session.teamAName : session.teamBName;
        await (0, scoreEngine_1.logTurn)(session.sessionId, userTeamId, userId, { type: 'answer', value: answer.toUpperCase() }, true, WORD_POINTS);
        await (0, scoreEngine_1.persistScore)(sessionId, session.teamAScore, session.teamBScore);
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
        }
        else {
            switchTurn(session);
            setTimeout(() => startNextWord(io, session), 3000);
        }
    }
    else {
        // Wrong — team keeps trying within the remaining turn time
        const teamName = userTeamId === session.teamAId ? session.teamAName : session.teamBName;
        await (0, scoreEngine_1.logTurn)(session.sessionId, userTeamId, userId, { type: 'answer', value: answer.toUpperCase() }, false, 0);
        io.to(sessionId).emit('scramble:wrong', {
            teamId: userTeamId,
            teamName,
        });
    }
}
function registerScrambleParticipantSocket(session, userId, socketId) {
    session.participantSockets.set(userId, socketId);
}
function unregisterScrambleParticipantSocket(session, userId) {
    session.participantSockets.delete(userId);
}
function getCurrentScrambleState(sessionId) {
    const session = exports.activeScrambleSessions.get(sessionId);
    if (!session)
        return null;
    return buildStatePayload(session);
}
