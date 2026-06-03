import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/utils';
import { prisma } from '@/lib/db/prismaClient';
import { EgcGameType } from '@prisma/client';
import { randomUUID } from 'crypto';

export async function GET(request: NextRequest) {
  try {
    await verifyAuth(request);

    const sessions = await prisma.gameSession.findMany({
      orderBy: { scheduledAt: 'asc' },
      include: {
        teamA: { select: { id: true, name: true, color: true } },
        teamB: { select: { id: true, name: true, color: true } },
        winner: { select: { id: true, name: true } },
        roster: { select: { userId: true, teamId: true } },
      },
    });

    return NextResponse.json({ sessions });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    if (msg.includes('Unauthorized')) return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await verifyAuth(request, ['ADMIN', 'SUPER_ADMIN']);

    const body = await request.json();
    const { gameType, teamAId, teamBId, scheduledAt } = body;

    if (!gameType || !teamAId || !teamBId || !scheduledAt) {
      return NextResponse.json({ error: 'gameType, teamAId, teamBId, scheduledAt are required' }, { status: 400 });
    }

    if (teamAId === teamBId) {
      return NextResponse.json({ error: 'Teams must be different' }, { status: 400 });
    }

    const validGameTypes = new Set([
      ...Object.values(EgcGameType),
      'WORD_SCRAMBLE', // included in schema even if Prisma client hasn't been regenerated yet
    ]);
    if (!validGameTypes.has(gameType)) {
      return NextResponse.json({ error: 'Invalid game type' }, { status: 400 });
    }

    const now = new Date();
    const session = await prisma.gameSession.create({
      data: {
        id: randomUUID(),
        gameType,
        teamAId,
        teamBId,
        scheduledAt: new Date(scheduledAt),
        updatedAt: now,
      },
      include: {
        teamA: { select: { id: true, name: true, color: true } },
        teamB: { select: { id: true, name: true, color: true } },
      },
    });

    return NextResponse.json({ session }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    if (msg.includes('Unauthorized') || msg.includes('Forbidden')) {
      return NextResponse.json({ error: msg }, { status: 403 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
