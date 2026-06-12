"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activeTrivaSessions = void 0;
exports.startTriviaGame = startTriviaGame;
exports.handleTriviaBuzz = handleTriviaBuzz;
exports.handleTriviaAnswer = handleTriviaAnswer;
exports.getTriviaState = getTriviaState;
const prisma_1 = require("../db/prisma");
const bibleTrivia_1 = require("../games/bibleTrivia");
const scoreEngine_1 = require("./scoreEngine");
const BUZZ_WINDOW_SECONDS = 20; // time to buzz in
const ANSWER_SECONDS = 12; // time to answer after buzzing
const PASS_SECONDS = 8; // time for other team to answer after pass
const QUESTIONS_PER_GAME = 12;
const POINTS_FIRST = 5;
const POINTS_SECOND = 3; // answering after other team passed
exports.activeTrivaSessions = new Map();
function currentQuestion(s) {
    return s.questions[s.currentIndex];
}
function safeQuestion(q) {
    return {
        id: q.id,
        question: q.question,
        options: q.options,
        category: q.category,
        points: q.points,
        // answer is NEVER sent to client during active play
    };
}
function buildClientState(s) {
    return {
        questionNumber: s.currentIndex + 1,
        totalQuestions: s.totalQuestions,
        question: safeQuestion(currentQuestion(s)),
        phase: s.phase,
        buzzedTeamId: s.buzzedTeamId,
        passingToTeamId: s.passingToTeamId,
        pointsOnOffer: s.pointsOnOffer,
        teamAScore: s.teamAScore,
        teamBScore: s.teamBScore,
        currentTurnTeamId: s.currentTurnTeamId,
        timeLeft: s.timeLeft,
    };
}
function clearTimer(s) {
    if (s.timer) {
        clearTimeout(s.timer);
        s.timer = null;
    }
}
function startTimer(io, s, seconds, onExpire) {
    clearTimer(s);
    s.timeLeft = seconds;
    const tick = () => {
        s.timeLeft--;
        io.to(s.sessionId).emit('game:tick', { timeLeft: s.timeLeft });
        if (s.timeLeft <= 0) {
            onExpire();
        }
        else {
            s.timer = setTimeout(tick, 1000);
        }
    };
    s.timer = setTimeout(tick, 1000);
}
async function revealAndAdvance(io, s, correctTeamId) {
    clearTimer(s);
    const q = currentQuestion(s);
    io.to(s.sessionId).emit('trivia:reveal', {
        correctAnswer: q.answer,
        correctOption: q.options[['A', 'B', 'C', 'D'].indexOf(q.answer)],
        correctTeamId,
        teamAScore: s.teamAScore,
        teamBScore: s.teamBScore,
    });
    await (0, scoreEngine_1.persistScore)(s.sessionId, s.teamAScore, s.teamBScore);
    s.currentIndex++;
    if (s.currentIndex >= s.totalQuestions) {
        const winnerId = s.teamAScore > s.teamBScore ? s.teamAId
            : s.teamBScore > s.teamAScore ? s.teamBId : null;
        await (0, scoreEngine_1.finalizeSession)(s.sessionId, winnerId, s.teamAScore, s.teamBScore);
        io.to(s.sessionId).emit('game:ended', {
            winnerId,
            winnerName: null,
            teamAScore: s.teamAScore,
            teamBScore: s.teamBScore,
        });
        exports.activeTrivaSessions.delete(s.sessionId);
        return;
    }
    // Next question after 4-second reveal pause
    setTimeout(() => {
        s.phase = 'buzzing';
        s.buzzedTeamId = null;
        s.passingToTeamId = null;
        s.pointsOnOffer = POINTS_FIRST;
        s.currentTurnTeamId = s.teamAId; // reset to teamA each question
        io.to(s.sessionId).emit('trivia:question', buildClientState(s));
        startBuzzWindow(io, s);
    }, 4000);
}
function startBuzzWindow(io, s) {
    startTimer(io, s, BUZZ_WINDOW_SECONDS, () => {
        // No one buzzed — reveal and move on
        s.phase = 'reveal';
        revealAndAdvance(io, s, null);
    });
}
// ── Public API ────────────────────────────────────────────────────
async function startTriviaGame(io, sessionId) {
    const dbSession = await prisma_1.prisma.gameSession.findUnique({
        where: { id: sessionId },
        select: { teamAId: true, teamBId: true, poolAssignment: true },
    });
    if (!dbSession)
        throw new Error('Session not found');
    const assignment = dbSession.poolAssignment;
    const testMode = assignment?.testMode === true;
    const questions = testMode
        ? bibleTrivia_1.TEST_TRIVIA_QUESTIONS.slice(0, QUESTIONS_PER_GAME)
        : (assignment?.questionIds
            ? bibleTrivia_1.TRIVIA_QUESTIONS.filter(q => assignment.questionIds.includes(q.id)).slice(0, QUESTIONS_PER_GAME)
            : (0, bibleTrivia_1.pickQuestions)(QUESTIONS_PER_GAME));
    const session = {
        sessionId,
        teamAId: dbSession.teamAId,
        teamBId: dbSession.teamBId,
        teamAScore: 0,
        teamBScore: 0,
        currentTurnTeamId: dbSession.teamAId,
        questions,
        currentIndex: 0,
        totalQuestions: questions.length,
        phase: 'buzzing',
        buzzedTeamId: null,
        passingToTeamId: null,
        pointsOnOffer: POINTS_FIRST,
        timer: null,
        timeLeft: BUZZ_WINDOW_SECONDS,
    };
    exports.activeTrivaSessions.set(sessionId, session);
    await prisma_1.prisma.gameSession.update({
        where: { id: sessionId },
        data: { status: 'IN_PROGRESS', startedAt: new Date(), currentTurnTeamId: dbSession.teamAId },
    });
    io.to(sessionId).emit('game:started', {
        sessionId,
        gameType: 'BIBLE_TRIVIA',
        teamAId: session.teamAId,
        teamBId: session.teamBId,
        teamAScore: 0,
        teamBScore: 0,
        currentTurnTeamId: session.currentTurnTeamId,
        timeLeft: BUZZ_WINDOW_SECONDS,
        status: 'IN_PROGRESS',
        trivia: buildClientState(session),
    });
    startBuzzWindow(io, session);
}
function handleTriviaBuzz(io, sessionId, teamId) {
    const s = exports.activeTrivaSessions.get(sessionId);
    if (!s || s.phase !== 'buzzing')
        return;
    clearTimer(s);
    s.phase = 'answering';
    s.buzzedTeamId = teamId;
    s.pointsOnOffer = POINTS_FIRST;
    io.to(sessionId).emit('trivia:buzz-locked', {
        teamId,
        ...buildClientState(s),
    });
    startTimer(io, s, ANSWER_SECONDS, () => {
        // Buzzed team timed out — pass to other team
        s.phase = 'passing';
        s.passingToTeamId = teamId === s.teamAId ? s.teamBId : s.teamAId;
        s.pointsOnOffer = POINTS_SECOND;
        io.to(sessionId).emit('trivia:pass', {
            fromTeamId: teamId,
            toTeamId: s.passingToTeamId,
            pointsOnOffer: POINTS_SECOND,
            timeLeft: PASS_SECONDS,
        });
        startTimer(io, s, PASS_SECONDS, () => {
            // Both teams failed
            s.phase = 'reveal';
            revealAndAdvance(io, s, null);
        });
    });
}
function handleTriviaAnswer(io, sessionId, teamId, answer) {
    const s = exports.activeTrivaSessions.get(sessionId);
    if (!s)
        return;
    if (s.phase !== 'answering' && s.phase !== 'passing')
        return;
    // Validate who can answer
    if (s.phase === 'answering' && s.buzzedTeamId !== teamId) {
        io.to(sessionId).emit('trivia:invalid', { reason: 'not_your_buzz' });
        return;
    }
    if (s.phase === 'passing' && s.passingToTeamId !== teamId) {
        io.to(sessionId).emit('trivia:invalid', { reason: 'not_your_turn' });
        return;
    }
    const q = currentQuestion(s);
    const isCorrect = answer.toUpperCase() === q.answer;
    clearTimer(s);
    if (isCorrect) {
        const pts = s.pointsOnOffer;
        if (teamId === s.teamAId)
            s.teamAScore += pts;
        else
            s.teamBScore += pts;
        io.to(sessionId).emit('trivia:correct', {
            teamId,
            answer,
            points: pts,
            teamAScore: s.teamAScore,
            teamBScore: s.teamBScore,
        });
        io.to(sessionId).emit('game:score', { teamAScore: s.teamAScore, teamBScore: s.teamBScore });
        s.phase = 'reveal';
        revealAndAdvance(io, s, teamId);
    }
    else {
        io.to(sessionId).emit('trivia:wrong', { teamId, answer });
        if (s.phase === 'answering') {
            // Pass to other team
            s.phase = 'passing';
            s.passingToTeamId = teamId === s.teamAId ? s.teamBId : s.teamAId;
            s.pointsOnOffer = POINTS_SECOND;
            io.to(sessionId).emit('trivia:pass', {
                fromTeamId: teamId,
                toTeamId: s.passingToTeamId,
                pointsOnOffer: POINTS_SECOND,
                timeLeft: PASS_SECONDS,
            });
            startTimer(io, s, PASS_SECONDS, () => {
                s.phase = 'reveal';
                revealAndAdvance(io, s, null);
            });
        }
        else {
            // Passing team also wrong — reveal
            s.phase = 'reveal';
            revealAndAdvance(io, s, null);
        }
    }
}
function getTriviaState(sessionId) {
    const s = exports.activeTrivaSessions.get(sessionId);
    if (!s)
        return null;
    return buildClientState(s);
}
