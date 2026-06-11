import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prismaClient';

// GET — tournament detail + live leaderboard
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const tournament = await prisma.tournament.findUnique({
    where: { id: params.id },
    include: {
      rounds: {
        orderBy: { weekNumber: 'asc' },
        include: {
          sessions: {
            include: {
              teamA: { select: { id: true, name: true, color: true, logo: true } },
              teamB: { select: { id: true, name: true, color: true, logo: true } },
            },
            orderBy: { roundNumber: 'asc' },
          },
        },
      },
    },
  });

  if (!tournament) return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });

  // ── Leaderboard: sum all session scores per team ──────────────────────────
  const allSessions = tournament.rounds.flatMap(r => r.sessions);

  // Collect all unique team IDs involved
  const teamIdSet = new Set(allSessions.flatMap(s => [s.teamAId, s.teamBId]));
  const teamIds = Array.from(teamIdSet);
  const teams = await prisma.team.findMany({
    where: { id: { in: teamIds } },
    select: { id: true, name: true, color: true, logo: true },
  });

  const points: Record<string, number> = {};
  const wins: Record<string, number> = {};
  const gamesPlayed: Record<string, number> = {};

  for (const s of allSessions) {
    if (s.status !== 'COMPLETED') continue;

    points[s.teamAId] = (points[s.teamAId] ?? 0) + s.teamAScore;
    points[s.teamBId] = (points[s.teamBId] ?? 0) + s.teamBScore;
    gamesPlayed[s.teamAId] = (gamesPlayed[s.teamAId] ?? 0) + 1;
    gamesPlayed[s.teamBId] = (gamesPlayed[s.teamBId] ?? 0) + 1;

    if (s.teamAScore > s.teamBScore) wins[s.teamAId] = (wins[s.teamAId] ?? 0) + 1;
    else if (s.teamBScore > s.teamAScore) wins[s.teamBId] = (wins[s.teamBId] ?? 0) + 1;
  }

  const leaderboard = teams
    .map(t => ({
      team: t,
      totalPoints: points[t.id] ?? 0,
      wins: wins[t.id] ?? 0,
      gamesPlayed: gamesPlayed[t.id] ?? 0,
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints || b.wins - a.wins);

  // Assign positions (handle ties)
  let pos = 1;
  const ranked = leaderboard.map((entry, i) => {
    if (i > 0 && entry.totalPoints === leaderboard[i - 1].totalPoints) {
      return { ...entry, position: pos };
    }
    pos = i + 1;
    return { ...entry, position: pos };
  });

  return NextResponse.json({ tournament, leaderboard: ranked });
}
