import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prismaClient';
import { verifyAuth } from '@/lib/auth/utils';
import { randomUUID } from 'crypto';
import {
  generateTournamentPools,
  getRoundRobinSchedule,
  TOURNAMENT_GAME_SEQUENCE as GAME_SEQUENCE,
} from '@/lib/tournament/poolAssignment';

// GET — list all tournaments (public)
export async function GET() {
  const tournaments = await prisma.tournament.findMany({
    orderBy: { startDate: 'desc' },
    include: {
      rounds: { orderBy: { weekNumber: 'asc' } },
      _count: { select: { sessions: true } },
    },
  });
  return NextResponse.json({ tournaments });
}

// POST — create tournament with admin-specified per-round schedule
export async function POST(request: NextRequest) {
  try {
    await verifyAuth(request, ['ADMIN', 'SUPER_ADMIN']);

    const body = await request.json();
    const { name, roundDates, teamIds, testMode = false } = body;

    if (!name || !Array.isArray(teamIds) || teamIds.length !== 4) {
      return NextResponse.json(
        { error: 'name and exactly 4 teamIds are required' },
        { status: 400 }
      );
    }

    if (
      !Array.isArray(roundDates) ||
      roundDates.length !== 5 ||
      roundDates.some((matchDates: unknown) =>
        !Array.isArray(matchDates) ||
        (matchDates as unknown[]).length !== 2 ||
        (matchDates as unknown[]).some(d => !d)
      )
    ) {
      return NextResponse.json(
        { error: 'roundDates must be a 5×2 array: one pair of datetime strings per round (one per match)' },
        { status: 400 }
      );
    }

    // Verify all teams exist
    const teams = await prisma.team.findMany({
      where: { id: { in: teamIds } },
      select: { id: true, name: true },
    });
    if (teams.length !== 4) {
      return NextResponse.json({ error: 'One or more teams not found' }, { status: 404 });
    }

    const schedule = getRoundRobinSchedule(); // 5 rounds, each with 2 matches

    // 2 sessions per game type: one per match pair
    const sessionCountPerGameType: Record<string, number> = {};
    for (const game of GAME_SEQUENCE) sessionCountPerGameType[game] = 2;

    // Generate word/category pools upfront — one pool per session
    const pools = generateTournamentPools(sessionCountPerGameType);
    const poolIndex: Record<string, number> = {};
    for (const game of GAME_SEQUENCE) poolIndex[game] = 0;

    const tournamentStart = new Date(roundDates[0][0]);

    const tournament = await prisma.tournament.create({
      data: { id: randomUUID(), name, startDate: tournamentStart },
    });

    // 5 weeks × 2 matches = 10 sessions total
    for (let w = 0; w < 5; w++) {
      const gameType = GAME_SEQUENCE[w];

      const round = await prisma.tournamentRound.create({
        data: {
          id: randomUUID(),
          tournamentId: tournament.id,
          weekNumber: w + 1,
          gameType,
          scheduledDate: new Date(roundDates[w][0]),
        },
      });

      const matchPairs = schedule[w]; // [[0,1],[2,3]]
      for (let matchIdx = 0; matchIdx < matchPairs.length; matchIdx++) {
        const [idxA, idxB] = matchPairs[matchIdx];
        const pool = pools[gameType]?.[poolIndex[gameType]] ?? null;
        poolIndex[gameType]++;

        await prisma.gameSession.create({
          data: {
            id: randomUUID(),
            gameType,
            teamAId: teamIds[idxA],
            teamBId: teamIds[idxB],
            scheduledAt: new Date(roundDates[w][matchIdx]),
            tournamentId: tournament.id,
            tournamentRoundId: round.id,
            roundNumber: matchIdx + 1,
            poolAssignment: testMode
              ? { testMode: true }
              : (pool ? (pool as object) : undefined),
          },
        });
      }
    }

    const created = await prisma.tournament.findUnique({
      where: { id: tournament.id },
      include: {
        rounds: {
          orderBy: { weekNumber: 'asc' },
          include: { sessions: { include: { teamA: true, teamB: true } } },
        },
        _count: { select: { sessions: true } },
      },
    });

    return NextResponse.json({ tournament: created }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Server error';
    if (msg.includes('Unauthorized') || msg.includes('Forbidden')) {
      return NextResponse.json({ error: msg }, { status: 403 });
    }
    console.error('Create tournament error:', err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
