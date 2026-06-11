import { prisma } from '@/lib/db/prismaClient';
import { getServerSession } from '@/lib/auth/utils';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import AutoRefresh from '@/components/games/AutoRefresh';
import { GAME_LABELS, GAME_ICONS } from '@/lib/games/constants';

export const revalidate = 30;

const MEDAL = ['🥇', '🥈', '🥉', ''];

async function getLeaderboardData() {
  const tournaments = await prisma.tournament.findMany({
    orderBy: { startDate: 'desc' },
    take: 1,
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

  if (!tournaments.length) return null;

  const tournament = tournaments[0];
  const allSessions = tournament.rounds.flatMap(r => r.sessions);

  // Collect teams
  const teamMap = new Map<string, { id: string; name: string; color: string }>();
  for (const s of allSessions) {
    teamMap.set(s.teamA.id, s.teamA);
    teamMap.set(s.teamB.id, s.teamB);
  }

  // Aggregate points
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
    .map(t => ({ team: t, totalPoints: points[t.id] ?? 0, wins: wins[t.id] ?? 0, played: played[t.id] ?? 0 }))
    .sort((a, b) => b.totalPoints - a.totalPoints || b.wins - a.wins);

  return { tournament, leaderboard, allSessions };
}

export default async function LeaderboardPage() {
  const session = await getServerSession();
  if (!session) redirect('/login');

  const data = await getLeaderboardData();

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <AutoRefresh intervalMs={30_000} />

      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/60">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-400/70 text-xs font-bold tracking-widest uppercase mb-1">EGC 2026 Tournament</p>
              <h1 className="text-3xl font-black text-white">🏆 Leaderboard</h1>
              <p className="text-gray-500 text-sm mt-1">Live standings · updated every 30 seconds</p>
            </div>
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-400 text-sm transition-colors">
              ← Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">

        {!data ? (
          <div className="text-center py-20 text-gray-600">
            <div className="text-5xl mb-4">🏆</div>
            <p className="text-lg font-semibold text-gray-500">No tournament created yet.</p>
            <p className="text-sm text-gray-600 mt-1">The admin will set up the tournament schedule.</p>
          </div>
        ) : (
          <>
            {/* Standings table */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800">
                <h2 className="text-lg font-bold text-white">Team Standings</h2>
                <p className="text-gray-500 text-xs mt-0.5">{data.tournament.name}</p>
              </div>

              <div className="divide-y divide-gray-800">
                {data.leaderboard.map((entry, i) => (
                  <div key={entry.team.id} className={`px-6 py-4 flex items-center gap-4 ${i === 0 ? 'bg-yellow-500/5' : ''}`}>
                    {/* Position */}
                    <div className="w-10 text-center text-2xl shrink-0">
                      {MEDAL[i] || <span className="text-gray-600 font-bold text-base">{i + 1}</span>}
                    </div>

                    {/* Team */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-4 h-10 rounded-sm shrink-0" style={{ backgroundColor: entry.team.color }} />
                      <div>
                        <p className="font-black text-white text-lg">{entry.team.name}</p>
                        <p className="text-gray-500 text-xs">{entry.played} games played · {entry.wins} wins</p>
                      </div>
                    </div>

                    {/* Points */}
                    <div className="text-right shrink-0">
                      <p className="text-3xl font-black tabular-nums" style={{ color: entry.team.color }}>
                        {entry.totalPoints}
                      </p>
                      <p className="text-gray-600 text-xs">points</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Round-by-round breakdown */}
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-white px-1">Weekly Results</h2>
              {data.tournament.rounds.map(round => {
                const sessions = round.sessions;
                const hasAnyCompleted = sessions.some(s => s.status === 'COMPLETED');
                return (
                  <div key={round.id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                    <div className="px-5 py-3 border-b border-gray-800 flex items-center gap-3">
                      <span className="text-xl">{GAME_ICONS[round.gameType] ?? '🎮'}</span>
                      <div>
                        <p className="font-bold text-white text-sm">Week {round.weekNumber} — {GAME_LABELS[round.gameType] ?? round.gameType}</p>
                        <p className="text-gray-600 text-xs">{new Date(round.scheduledDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      </div>
                      {!hasAnyCompleted && (
                        <span className="ml-auto text-xs text-gray-600 border border-gray-800 px-2 py-0.5 rounded-full">Upcoming</span>
                      )}
                    </div>

                    {/* Group sessions by matchup (teamA+teamB pair) */}
                    {(() => {
                      const matchups: Record<string, typeof sessions> = {};
                      for (const s of sessions) {
                        const key = [s.teamAId, s.teamBId].sort().join('-');
                        if (!matchups[key]) matchups[key] = [];
                        matchups[key].push(s);
                      }
                      return Object.values(matchups).map((matchSessions, mi) => {
                        const s1 = matchSessions[0];
                        const s2 = matchSessions[1];
                        const totalA = matchSessions.reduce((sum, s) => sum + s.teamAScore, 0);
                        const totalB = matchSessions.reduce((sum, s) => sum + s.teamBScore, 0);
                        const anyCompleted = matchSessions.some(s => s.status === 'COMPLETED');
                        return (
                          <div key={mi} className="px-5 py-4 border-b border-gray-800/50 last:border-0">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm" style={{ color: s1.teamA.color }}>{s1.teamA.name}</span>
                                <span className="text-gray-600 text-xs">vs</span>
                                <span className="font-bold text-sm" style={{ color: s1.teamB.color }}>{s1.teamB.name}</span>
                              </div>
                              {anyCompleted ? (
                                <div className="flex items-center gap-2 text-sm font-black tabular-nums">
                                  <span style={{ color: s1.teamA.color }}>{totalA}</span>
                                  <span className="text-gray-600">—</span>
                                  <span style={{ color: s1.teamB.color }}>{totalB}</span>
                                </div>
                              ) : (
                                <span className="text-xs text-gray-700">Scheduled</span>
                              )}
                            </div>
                            {anyCompleted && (
                              <div className="mt-2 flex gap-3">
                                {[s1, s2].filter(Boolean).map((s, ri) => s && (
                                  <div key={ri} className="text-xs text-gray-600">
                                    Round {ri + 1}: <span style={{ color: s.teamA.color }}>{s.teamAScore}</span>
                                    {' – '}
                                    <span style={{ color: s.teamB.color }}>{s.teamBScore}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
