import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/utils';
import { prisma } from '@/lib/db/prismaClient';
import {
  HANGMAN_WORD_BANK,
  ITEMS_PER_SESSION,
  collectUsedContent,
  drawPools,
} from '@/lib/tournament/poolAssignment';

const PENDING = ['SCHEDULED', 'WAITING'] as const;

// POST /api/admin/fix-pools  { tournamentId }
// Regenerates 40-word poolAssignment for all pending WORD_SCRAMBLE sessions.
// New pools don't overlap each other, and avoid words already played in this
// tournament's started/finished Word Scramble sessions.
// Safe to run mid-tournament — only touches sessions that haven't started yet.
export async function POST(request: NextRequest) {
  try {
    await verifyAuth(request, ['ADMIN', 'SUPER_ADMIN']);
  } catch {
    return NextResponse.json({ error: 'Admin access required' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { tournamentId } = body as { tournamentId?: string };
  if (!tournamentId) {
    return NextResponse.json({ error: 'tournamentId required' }, { status: 400 });
  }

  const scrambleSessions = await prisma.gameSession.findMany({
    where: { tournamentId, gameType: 'WORD_SCRAMBLE' },
    select: { id: true, status: true, gameType: true, poolAssignment: true },
  });

  const isPending = (status: string) => (PENDING as readonly string[]).includes(status);
  const pending = scrambleSessions.filter(s => isPending(s.status));
  const pendingTestMode = pending.filter(
    s => (s.poolAssignment as { testMode?: boolean } | null)?.testMode === true
  );
  const toFix = pending.filter(s => !pendingTestMode.includes(s));

  if (toFix.length === 0) {
    return NextResponse.json({ message: 'No pending WORD_SCRAMBLE sessions found', updated: 0 });
  }

  // Words already played (or in play) must not come back
  const used = collectUsedContent(scrambleSessions.filter(s => !isPending(s.status)));
  const pools = drawPools(HANGMAN_WORD_BANK, used.WORD_SCRAMBLE, toFix.length, ITEMS_PER_SESSION.WORD_SCRAMBLE);

  await prisma.$transaction(
    toFix.map((session, i) =>
      prisma.gameSession.update({
        where: { id: session.id },
        data: { poolAssignment: { words: pools[i] } },
      })
    )
  );

  return NextResponse.json({
    message: `Updated ${toFix.length} WORD_SCRAMBLE session(s) with fresh 40-word pools`,
    updated: toFix.length,
  });
}
