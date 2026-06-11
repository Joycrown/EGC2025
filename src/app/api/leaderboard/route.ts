import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prismaClient';
import { verifyAuth } from '@/lib/auth/utils';

export const revalidate = 30;

export async function GET(request: NextRequest) {
  try {
    await verifyAuth(request);

    // Most recent tournament
    const tournament = await prisma.tournament.findFirst({
      orderBy: { startDate: 'desc' },
      include: {
        rounds: {
          orderBy: { weekNumber: 'asc' },
          include: {
            sessions: {
              include: {
                teamA: { select: { id: true, name: true, color: true } },
                teamB: { select: { id: true, name: true, color: true } },
              },
              orderBy: { roundNumber: 'asc' },
            },
          },
        },
      },
    });

    if (!tournament) {
      return NextResponse.json({ leaderboard: [], upcomingSessions: [], tournamentName: null });
    }

    const allSessions = tournament.rounds.flatMap(r => r.sessions);

    // Build team map
    const teamMap = new Map<string, { id: string; name: string; color: string }>();
    for (const s of allSessions) {
      teamMap.set(s.teamA.id, s.teamA);
      teamMap.set(s.teamB.id, s.teamB);
    }

    // Aggregate standings from completed sessions
    const points: Record<string, number> = {};
    const wins: Record<string, number> = {};
    const played: Record<string, number> = {};

    for (const s of allSessions) {
      if (s.status !== 'COMPLETED') continue;
      points[s.teamAId] = (points[s.teamAId] ?? 0) + s.teamAScore;
      points[s.teamBId] = (points[s.teamBId] ?? 0) + s.teamBScore;
      played[s.teamAId] = (played[s.teamAId] ?? 0) + 1;
      played[s.teamBId] = (played[s.teamBId] ?? 0) + 1;
      if (s.teamAScore > s.teamBScore) wins[s.teamAId] = (wins[s.teamAId] ?? 0) + 1;
      else if (s.teamBScore > s.teamAScore) wins[s.teamBId] = (wins[s.teamBId] ?? 0) + 1;
    }

    const leaderboard = Array.from(teamMap.values())
      .map(t => ({
        team: t,
        totalPoints: points[t.id] ?? 0,
        wins: wins[t.id] ?? 0,
        played: played[t.id] ?? 0,
      }))
      .sort((a, b) => b.totalPoints - a.totalPoints || b.wins - a.wins);

    // Upcoming sessions — next 6 scheduled, sorted by time
    const now = new Date();
    const upcomingSessions = allSessions
      .filter(s => s.status === 'SCHEDULED' && new Date(s.scheduledAt) > now)
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
      .slice(0, 6)
      .map(s => ({
        id: s.id,
        gameType: s.gameType,
        scheduledAt: s.scheduledAt,
        teamA: s.teamA,
        teamB: s.teamB,
        roundNumber: s.roundNumber,
      }));

    return NextResponse.json({
      tournamentName: tournament.name,
      leaderboard,
      upcomingSessions,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    if (msg.includes('Unauthorized')) return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
