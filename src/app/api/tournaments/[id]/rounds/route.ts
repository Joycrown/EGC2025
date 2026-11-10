import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { prisma } from '@/lib/db/prismaClient';
import { verifyAuth } from '@/lib/auth/utils';
import {
  collectUsedContent,
  generateTournamentPools,
  getWeekPairings,
  isTournamentGameType,
  type SessionPool,
  type TournamentGameType,
} from '@/lib/tournament/poolAssignment';

const MAX_WEEKS_PER_REQUEST = 10;

interface NewWeek {
  gameType: TournamentGameType;
  matchDates: [Date, Date];
}

function parseWeeks(raw: unknown): NewWeek[] | string {
  if (!Array.isArray(raw) || raw.length === 0) return 'weeks must be a non-empty array';
  if (raw.length > MAX_WEEKS_PER_REQUEST) return `You can add at most ${MAX_WEEKS_PER_REQUEST} weeks at a time`;

  const weeks: NewWeek[] = [];
  for (let i = 0; i < raw.length; i++) {
    const item = raw[i] as { gameType?: unknown; matchDates?: unknown };
    if (!isTournamentGameType(item?.gameType)) return `Week ${i + 1}: unsupported game type`;
    if (!Array.isArray(item.matchDates) || item.matchDates.length !== 2) {
      return `Week ${i + 1}: matchDates must contain exactly 2 date-times (one per match)`;
    }
    const dates = item.matchDates.map(d => new Date(String(d)));
    if (dates.some(d => isNaN(d.getTime()))) return `Week ${i + 1}: invalid match date`;
    weeks.push({ gameType: item.gameType, matchDates: [dates[0], dates[1]] });
  }
  return weeks;
}

// POST — append more weeks to an existing tournament.
// Scores carry over automatically: new sessions belong to the same tournament,
// so the leaderboard keeps adding them up.
// Body: { weeks: [{ gameType: 'HANGMAN', matchDates: [isoString, isoString] }, ...] }
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await verifyAuth(request, ['ADMIN', 'SUPER_ADMIN']);

    const body = await request.json().catch(() => null);
    const weeks = parseWeeks(body?.weeks);
    if (typeof weeks === 'string') {
      return NextResponse.json({ error: weeks }, { status: 400 });
    }

    const tournament = await prisma.tournament.findUnique({
      where: { id: params.id },
      include: {
        rounds: { select: { weekNumber: true } },
        sessions: {
          select: {
            gameType: true,
            poolAssignment: true,
            teamAId: true,
            teamBId: true,
            roundNumber: true,
            editionId: true,
            tournamentRound: { select: { weekNumber: true } },
          },
        },
      },
    });
    if (!tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
    }

    // Recover the original team order from week 1 so the pairing rotation continues:
    // week 1 match 1 = teams 0 v 1, match 2 = teams 2 v 3.
    const week1 = tournament.sessions
      .filter(s => s.tournamentRound?.weekNumber === 1)
      .sort((a, b) => (a.roundNumber ?? 0) - (b.roundNumber ?? 0));
    const teamOrder = week1.length === 2
      ? [week1[0].teamAId, week1[0].teamBId, week1[1].teamAId, week1[1].teamBId]
      : [];
    if (new Set(teamOrder).size !== 4) {
      return NextResponse.json(
        { error: 'Cannot work out the team rotation: week 1 must have 2 matches between 4 different teams' },
        { status: 409 }
      );
    }

    const lastWeek = tournament.rounds.reduce((max, r) => Math.max(max, r.weekNumber), 0);

    // A test tournament stays a test tournament
    const testMode = tournament.sessions.length > 0 && tournament.sessions.every(
      s => (s.poolAssignment as { testMode?: boolean } | null)?.testMode === true
    );

    // New pools skip everything already assigned in this tournament
    const sessionCountPerGameType: Record<string, number> = {};
    for (const w of weeks) {
      sessionCountPerGameType[w.gameType] = (sessionCountPerGameType[w.gameType] ?? 0) + 2;
    }
    const pools: Record<string, SessionPool[]> = testMode
      ? {}
      : generateTournamentPools(sessionCountPerGameType, collectUsedContent(tournament.sessions));
    const poolIndex: Record<string, number> = {};

    const editionId = week1[0].editionId ?? undefined;
    const writes = [];
    const addedWeeks: number[] = [];

    for (let i = 0; i < weeks.length; i++) {
      const { gameType, matchDates } = weeks[i];
      const weekNumber = lastWeek + i + 1;
      const roundId = randomUUID();
      addedWeeks.push(weekNumber);

      writes.push(prisma.tournamentRound.create({
        data: {
          id: roundId,
          tournamentId: tournament.id,
          weekNumber,
          gameType,
          scheduledDate: matchDates[0],
        },
      }));

      getWeekPairings(weekNumber).forEach(([idxA, idxB], matchIdx) => {
        const idx = poolIndex[gameType] ?? 0;
        poolIndex[gameType] = idx + 1;
        const pool = pools[gameType]?.[idx];

        writes.push(prisma.gameSession.create({
          data: {
            id: randomUUID(),
            gameType,
            teamAId: teamOrder[idxA],
            teamBId: teamOrder[idxB],
            scheduledAt: matchDates[matchIdx],
            tournamentId: tournament.id,
            tournamentRoundId: roundId,
            roundNumber: matchIdx + 1,
            editionId,
            poolAssignment: testMode ? { testMode: true } : (pool ? { ...pool } : undefined),
          },
        }));
      });
    }

    // All or nothing — never leave a half-added week behind
    await prisma.$transaction(writes);

    return NextResponse.json(
      { addedWeeks, sessionsCreated: weeks.length * 2 },
      { status: 201 }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Server error';
    if (msg.includes('Unauthorized') || msg.includes('Forbidden')) {
      return NextResponse.json({ error: msg }, { status: 403 });
    }
    console.error('Extend tournament error:', err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
