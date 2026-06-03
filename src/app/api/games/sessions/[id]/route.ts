import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/utils';
import { prisma } from '@/lib/db/prismaClient';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await verifyAuth(request);

    const session = await prisma.gameSession.findUnique({
      where: { id: params.id },
      include: {
        teamA: { select: { id: true, name: true, color: true } },
        teamB: { select: { id: true, name: true, color: true } },
        winner: { select: { id: true, name: true } },
        roster: {
          include: {
            user: { select: { id: true, fullName: true, email: true } },
            team: { select: { id: true, name: true, color: true } },
          },
        },
        chat: {
          orderBy: { createdAt: 'asc' },
          take: 50,
          include: { User: { select: { id: true, fullName: true } } },
        },
      },
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({ session });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    if (msg.includes('Unauthorized')) return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
