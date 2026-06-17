import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/utils';
import { prisma } from '@/lib/db/prisma';
import { HANGMAN_WORD_BANK } from '@/lib/tournament/poolAssignment';

const WORDS_PER_SESSION = 40;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// POST /api/admin/fix-pools  { tournamentId }
// Regenerates non-overlapping 40-word poolAssignment for all pending WORD_SCRAMBLE sessions.
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

  // Find all WORD_SCRAMBLE sessions for this tournament that haven't started
  const sessions = await prisma.gameSession.findMany({
    where: {
      tournamentId,
      gameType: 'WORD_SCRAMBLE',
      status: { in: ['SCHEDULED', 'PENDING'] },
    },
    select: { id: true },
  });

  if (sessions.length === 0) {
    return NextResponse.json({ message: 'No pending WORD_SCRAMBLE sessions found', updated: 0 });
  }

  // Generate non-overlapping pools — shuffle bank once then slice per session
  const needed = sessions.length * WORDS_PER_SESSION;
  const shuffled = shuffle([...HANGMAN_WORD_BANK]);

  // If bank is smaller than needed, extend by re-shuffling and appending (some overlap across late sessions)
  let wordPool = shuffled;
  while (wordPool.length < needed) {
    wordPool = [...wordPool, ...shuffle([...HANGMAN_WORD_BANK])];
  }

  // Update each session with its own slice
  await Promise.all(
    sessions.map((session, i) => {
      const words = wordPool.slice(i * WORDS_PER_SESSION, (i + 1) * WORDS_PER_SESSION);
      return prisma.gameSession.update({
        where: { id: session.id },
        data: { poolAssignment: { words } },
      });
    })
  );

  return NextResponse.json({ message: `Updated ${sessions.length} WORD_SCRAMBLE session(s) with fresh 40-word pools`, updated: sessions.length });
}
