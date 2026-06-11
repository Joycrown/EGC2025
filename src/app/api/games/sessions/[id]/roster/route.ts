import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/utils';
import { prisma } from '@/lib/db/prismaClient';
import { randomUUID } from 'crypto';

const MAX_PLAYERS_PER_TEAM = 5;

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await verifyAuth(request, ['ADMIN', 'SUPER_ADMIN']);

    const { userId, teamId: overrideTeamId } = await request.json();
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    const session = await prisma.gameSession.findUnique({
      where: { id: params.id },
      include: { roster: true },
    });

    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    if (session.status === 'IN_PROGRESS' || session.status === 'COMPLETED') {
      return NextResponse.json({ error: 'Cannot modify roster after game starts' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, teamId: true, fullName: true },
    });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // overrideTeamId is only allowed for users with no team assigned yet
    if (overrideTeamId && user.teamId && user.teamId !== overrideTeamId) {
      return NextResponse.json({ error: 'Cannot override team for a user already assigned to a team' }, { status: 400 });
    }

    const resolvedTeamId = overrideTeamId ?? user.teamId;
    if (!resolvedTeamId) return NextResponse.json({ error: 'Specify which team to add this player to' }, { status: 400 });

    // Verify the resolved team is one of the two competing teams
    if (resolvedTeamId !== session.teamAId && resolvedTeamId !== session.teamBId) {
      return NextResponse.json(
        { error: 'User\'s team is not participating in this session' },
        { status: 400 }
      );
    }

    // Check max players per team
    const teamCount = session.roster.filter(r => r.teamId === resolvedTeamId).length;
    if (teamCount >= MAX_PLAYERS_PER_TEAM) {
      return NextResponse.json(
        { error: `Maximum ${MAX_PLAYERS_PER_TEAM} players per team` },
        { status: 400 }
      );
    }

    const entry = await prisma.gameRoster.create({
      data: {
        id: randomUUID(),
        gameSessionId: params.id,
        userId,
        teamId: resolvedTeamId,
      },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        team: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ entry }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    if (msg.includes('Unique constraint')) {
      return NextResponse.json({ error: 'User is already on the roster' }, { status: 409 });
    }
    if (msg.includes('Unauthorized') || msg.includes('Forbidden')) {
      return NextResponse.json({ error: msg }, { status: 403 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await verifyAuth(request, ['ADMIN', 'SUPER_ADMIN']);

    const { userId } = await request.json();
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    await prisma.gameRoster.deleteMany({
      where: { gameSessionId: params.id, userId },
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    if (msg.includes('Unauthorized') || msg.includes('Forbidden')) {
      return NextResponse.json({ error: msg }, { status: 403 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
