import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/utils';
import { prisma } from '@/lib/db/prismaClient';
import { generateRtcToken } from '@/lib/agora/tokenGenerator';

export async function POST(request: NextRequest) {
  try {
    const { user } = await verifyAuth(request);
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId required' }, { status: 400 });
    }

    // Check if user is a participant in this session
    const rosterEntry = await prisma.gameRoster.findUnique({
      where: { gameSessionId_userId: { gameSessionId: sessionId, userId: user.id } },
    });

    // Participants and admins both publish (admins are always-on MC mic).
    // Spectators only subscribe (listen only).
    const isAdminUser = user.userType === 'ADMIN' || user.userType === 'SUPER_ADMIN';
    const role = (rosterEntry || isAdminUser) ? 'publisher' : 'subscriber';
    const result = generateRtcToken(sessionId, user.id, role);

    return NextResponse.json({ ...result, role });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    if (msg.includes('Unauthorized')) return NextResponse.json({ error: msg }, { status: 401 });
    if (msg.includes('not configured')) return NextResponse.json({ error: msg }, { status: 503 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
