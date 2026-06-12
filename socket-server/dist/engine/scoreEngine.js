"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.persistScore = persistScore;
exports.logTurn = logTurn;
exports.finalizeSession = finalizeSession;
const crypto_1 = require("crypto");
const prisma_1 = require("../db/prisma");
async function persistScore(sessionId, teamAScore, teamBScore) {
    await prisma_1.prisma.gameSession.update({
        where: { id: sessionId },
        data: { teamAScore, teamBScore },
    });
}
async function logTurn(sessionId, teamId, userId, moveData, isCorrect, pointsAwarded) {
    await prisma_1.prisma.turnLog.create({
        data: {
            id: (0, crypto_1.randomUUID)(),
            gameSessionId: sessionId,
            teamId,
            userId,
            moveData,
            isCorrect,
            pointsAwarded,
        },
    });
}
async function finalizeSession(sessionId, winnerId, teamAScore, teamBScore) {
    const session = await prisma_1.prisma.gameSession.update({
        where: { id: sessionId },
        data: {
            status: 'COMPLETED',
            endedAt: new Date(),
            winnerId,
            teamAScore,
            teamBScore,
        },
        select: { teamAId: true, teamBId: true },
    });
    const isDraw = !winnerId;
    const loserId = winnerId
        ? winnerId === session.teamAId ? session.teamBId : session.teamAId
        : null;
    if (isDraw) {
        await prisma_1.prisma.team.updateMany({
            where: { id: { in: [session.teamAId, session.teamBId] } },
            data: { draws: { increment: 1 }, points: { increment: 3 } },
        });
    }
    else {
        await prisma_1.prisma.team.update({
            where: { id: winnerId },
            data: { wins: { increment: 1 }, points: { increment: 10 } },
        });
        await prisma_1.prisma.team.update({
            where: { id: loserId },
            data: { losses: { increment: 1 } },
        });
    }
}
