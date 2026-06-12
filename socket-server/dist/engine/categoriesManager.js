"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activeCategorySessions = void 0;
exports.startCategoriesGame = startCategoriesGame;
exports.handleCategoriesGuess = handleCategoriesGuess;
exports.getCategoriesState = getCategoriesState;
const prisma_1 = require("../db/prisma");
const bibleCategories_1 = require("../games/bibleCategories");
const scoreEngine_1 = require("./scoreEngine");
const MAX_STRIKES = 3;
const TURN_SECONDS = 25;
const ROUNDS = 5;
exports.activeCategorySessions = new Map();
function buildClientState(s) {
    return {
        roundNumber: s.currentRound + 1,
        totalRounds: s.totalRounds,
        category: {
            id: s.currentCategory.id,
            title: s.currentCategory.title,
            subtitle: s.currentCategory.subtitle,
            totalAnswers: s.currentCategory.answers.length,
        },
        foundAnswers: s.foundAnswers.map(f => {
            const a = s.currentCategory.answers.find(a => a.text === f);
            return { text: a.text, points: a.points };
        }),
        strikes: s.strikes,
        maxStrikes: MAX_STRIKES,
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
function startTurnTimer(io, s) {
    clearTimer(s);
    s.timeLeft = TURN_SECONDS;
    const tick = () => {
        s.timeLeft--;
        io.to(s.sessionId).emit('game:tick', { timeLeft: s.timeLeft });
        if (s.timeLeft <= 0) {
            handleTimeout(io, s);
        }
        else {
            s.timer = setTimeout(tick, 1000);
        }
    };
    s.timer = setTimeout(tick, 1000);
}
function switchTurn(s) {
    s.currentTurnTeamId = s.currentTurnTeamId === s.teamAId ? s.teamBId : s.teamAId;
}
async function advanceRound(io, s) {
    if (s.advancing)
        return; // prevent double-advance from timer + guess race
    s.advancing = true;
    clearTimer(s);
    // Reveal remaining answers
    const remaining = s.currentCategory.answers
        .filter(a => !s.foundAnswers.includes(a.text))
        .map(a => ({ text: a.text, points: a.points }));
    io.to(s.sessionId).emit('categories:round-end', {
        remaining,
        foundAnswers: s.foundAnswers.map(f => {
            const a = s.currentCategory.answers.find(a => a.text === f);
            return { text: a.text, points: a.points };
        }),
        teamAScore: s.teamAScore,
        teamBScore: s.teamBScore,
    });
    await (0, scoreEngine_1.persistScore)(s.sessionId, s.teamAScore, s.teamBScore);
    const nextRound = s.currentRound + 1;
    if (nextRound >= s.totalRounds) {
        // Game over
        const winnerId = s.teamAScore > s.teamBScore ? s.teamAId
            : s.teamBScore > s.teamAScore ? s.teamBId : null;
        await (0, scoreEngine_1.finalizeSession)(s.sessionId, winnerId, s.teamAScore, s.teamBScore);
        io.to(s.sessionId).emit('game:ended', {
            winnerId,
            winnerName: null,
            teamAScore: s.teamAScore,
            teamBScore: s.teamBScore,
        });
        exports.activeCategorySessions.delete(s.sessionId);
        return;
    }
    // Next round — 4 second delay to read the board.
    // Keep s.currentRound unchanged during the delay so reconnecting clients
    // see the completed round state (not a half-advanced inconsistent state).
    setTimeout(() => {
        s.currentRound = nextRound;
        s.currentCategory = s.categories[s.currentRound];
        s.foundAnswers = [];
        s.strikes = 0;
        s.lastStrikeTeam = null;
        s.advancing = false;
        io.to(s.sessionId).emit('categories:new-round', buildClientState(s));
        startTurnTimer(io, s);
    }, 4000);
}
async function handleTimeout(io, s) {
    s.strikes++;
    const wasTeam = s.currentTurnTeamId;
    switchTurn(s);
    io.to(s.sessionId).emit('categories:strike', {
        teamId: wasTeam,
        reason: 'timeout',
        strikes: s.strikes,
        maxStrikes: MAX_STRIKES,
    });
    if (s.strikes >= MAX_STRIKES) {
        await advanceRound(io, s);
    }
    else {
        io.to(s.sessionId).emit('categories:state', buildClientState(s));
        startTurnTimer(io, s);
    }
}
// ── Public API ────────────────────────────────────────────────────
async function startCategoriesGame(io, sessionId) {
    const dbSession = await prisma_1.prisma.gameSession.findUnique({
        where: { id: sessionId },
        select: { teamAId: true, teamBId: true, poolAssignment: true },
    });
    if (!dbSession)
        throw new Error('Session not found');
    const assignment = dbSession.poolAssignment;
    const testMode = assignment?.testMode === true;
    const categories = testMode
        ? bibleCategories_1.TEST_CATEGORIES.slice(0, ROUNDS)
        : (assignment?.categoryIds
            ? bibleCategories_1.BIBLE_CATEGORIES.filter(c => assignment.categoryIds.includes(c.id)).slice(0, ROUNDS)
            : (0, bibleCategories_1.pickCategories)(ROUNDS));
    const session = {
        sessionId,
        teamAId: dbSession.teamAId,
        teamBId: dbSession.teamBId,
        currentTurnTeamId: dbSession.teamAId,
        teamAScore: 0,
        teamBScore: 0,
        categories,
        currentRound: 0,
        totalRounds: categories.length, // use actual length — filter may return < ROUNDS items
        currentCategory: categories[0],
        foundAnswers: [],
        strikes: 0,
        lastStrikeTeam: null,
        advancing: false,
        timer: null,
        timeLeft: TURN_SECONDS,
    };
    exports.activeCategorySessions.set(sessionId, session);
    await prisma_1.prisma.gameSession.update({
        where: { id: sessionId },
        data: { status: 'IN_PROGRESS', startedAt: new Date(), currentTurnTeamId: dbSession.teamAId },
    });
    io.to(sessionId).emit('game:started', {
        sessionId,
        gameType: 'BIBLE_CATEGORIES',
        teamAId: session.teamAId,
        teamBId: session.teamBId,
        teamAScore: 0,
        teamBScore: 0,
        currentTurnTeamId: session.currentTurnTeamId,
        timeLeft: TURN_SECONDS,
        status: 'IN_PROGRESS',
        categories: buildClientState(session),
    });
    startTurnTimer(io, session);
}
function handleCategoriesGuess(io, sessionId, teamId, userId, answer) {
    const s = exports.activeCategorySessions.get(sessionId);
    if (!s)
        return;
    if (s.currentTurnTeamId !== teamId) {
        io.to(sessionId).emit('categories:invalid', { reason: 'not_your_turn' });
        return;
    }
    if (!answer.trim())
        return;
    const matched = (0, bibleCategories_1.matchAnswer)(answer, s.currentCategory, s.foundAnswers);
    if (matched) {
        // Correct!
        s.foundAnswers.push(matched.text);
        if (teamId === s.teamAId)
            s.teamAScore += matched.points;
        else
            s.teamBScore += matched.points;
        clearTimer(s);
        io.to(sessionId).emit('categories:correct', {
            teamId,
            answer: matched.text,
            points: matched.points,
            foundAnswers: s.foundAnswers.map(f => {
                const a = s.currentCategory.answers.find(a => a.text === f);
                return { text: a.text, points: a.points };
            }),
            teamAScore: s.teamAScore,
            teamBScore: s.teamBScore,
            remaining: s.currentCategory.answers.length - s.foundAnswers.length,
        });
        io.to(sessionId).emit('game:score', { teamAScore: s.teamAScore, teamBScore: s.teamBScore });
        if (s.foundAnswers.length >= s.currentCategory.answers.length) {
            // All found — advance round
            advanceRound(io, s);
        }
        else {
            // Same team goes again with fresh timer
            s.timeLeft = TURN_SECONDS;
            startTurnTimer(io, s);
        }
    }
    else {
        // Wrong
        s.strikes++;
        const wasTeam = s.currentTurnTeamId;
        switchTurn(s);
        io.to(sessionId).emit('categories:wrong', {
            teamId: wasTeam,
            answer: answer.trim(),
            strikes: s.strikes,
            maxStrikes: MAX_STRIKES,
        });
        if (s.strikes >= MAX_STRIKES) {
            advanceRound(io, s);
        }
        else {
            io.to(sessionId).emit('categories:state', buildClientState(s));
            startTurnTimer(io, s);
        }
    }
}
function getCategoriesState(sessionId) {
    const s = exports.activeCategorySessions.get(sessionId);
    if (!s)
        return null;
    return buildClientState(s);
}
