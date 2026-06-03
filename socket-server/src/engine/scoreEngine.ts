import { randomUUID } from 'crypto';
import { prisma } from '../db/prisma';

export async function persistScore(
  sessionId: string,
  teamAScore: number,
  teamBScore: number
): Promise<void> {
  await prisma.gameSession.update({
    where: { id: sessionId },
    data: { teamAScore, teamBScore },
  });
}

export async function logTurn(
  sessionId: string,
  teamId: string,
  userId: string | null,
  moveData: object,
  isCorrect: boolean,
  pointsAwarded: number
): Promise<void> {
  await prisma.turnLog.create({
    data: {
      id: randomUUID(),
      gameSessionId: sessionId,
      teamId,
      userId,
      moveData,
      isCorrect,
      pointsAwarded,
    },
  });
}

export async function finalizeSession(
  sessionId: string,
  winnerId: string | null,
  teamAScore: number,
  teamBScore: number
): Promise<void> {
  const session = await prisma.gameSession.update({
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
    await prisma.team.updateMany({
      where: { id: { in: [session.teamAId, session.teamBId] } },
      data: { draws: { increment: 1 }, points: { increment: 3 } },
    });
  } else {
    await prisma.team.update({
      where: { id: winnerId! },
      data: { wins: { increment: 1 }, points: { increment: 10 } },
    });
    await prisma.team.update({
      where: { id: loserId! },
      data: { losses: { increment: 1 } },
    });
  }
}
