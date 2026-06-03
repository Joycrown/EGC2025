import { getServerSession } from '@/lib/auth/utils';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/prismaClient';
import GameLobbyList from '@/components/games/GameLobbyList';
import AutoRefresh from '@/components/games/AutoRefresh';
import Link from 'next/link';

export const revalidate = 15;

export default async function GamesPage() {
  const session = await getServerSession();
  if (!session) redirect('/login');

  const sessions = await prisma.gameSession.findMany({
    orderBy: [{ status: 'asc' }, { scheduledAt: 'asc' }],
    include: {
      teamA: { select: { id: true, name: true, color: true } },
      teamB: { select: { id: true, name: true, color: true } },
      roster: { select: { userId: true, teamId: true } },
    },
  });

  const liveCount = sessions.filter(s => s.status === 'IN_PROGRESS' || s.status === 'WAITING').length;
  const isPlayer = sessions.some(s => s.roster.some(r => r.userId === session.user.id));

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <AutoRefresh intervalMs={15_000} />

      {/* Hero */}
      <div className="relative overflow-hidden border-b border-gray-800">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-red-700/10 blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-12 sm:py-16">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl">🏆</span>
                {liveCount > 0 && (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-red-400 bg-red-900/40 border border-red-700/40 px-3 py-1 rounded-full animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
                    {liveCount} LIVE {liveCount === 1 ? 'GAME' : 'GAMES'}
                  </span>
                )}
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                EGC Games <span className="text-red-500">2025</span>
              </h1>
              <p className="text-gray-400 mt-2 text-base">
                Team competition • Biblical knowledge • Live scoring
              </p>
            </div>

            <div className="flex flex-col gap-2 text-right shrink-0">
              {isPlayer ? (
                <div className="text-sm text-green-400 font-semibold">
                  ✓ You are registered as a player
                </div>
              ) : (
                <div className="text-sm text-gray-500">
                  Spectator mode — watch all games live
                </div>
              )}
              <div className="text-xs text-gray-600">Auto-refreshes every 15 seconds</div>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex gap-6 mt-8 pt-6 border-t border-gray-800/60">
            <div>
              <p className="text-2xl font-black text-white">{sessions.filter(s => s.status === 'IN_PROGRESS' || s.status === 'WAITING').length}</p>
              <p className="text-xs text-gray-500 mt-0.5">Live</p>
            </div>
            <div className="w-px bg-gray-800" />
            <div>
              <p className="text-2xl font-black text-white">{sessions.filter(s => s.status === 'SCHEDULED').length}</p>
              <p className="text-xs text-gray-500 mt-0.5">Upcoming</p>
            </div>
            <div className="w-px bg-gray-800" />
            <div>
              <p className="text-2xl font-black text-white">{sessions.filter(s => s.status === 'COMPLETED').length}</p>
              <p className="text-xs text-gray-500 mt-0.5">Completed</p>
            </div>
            <div className="w-px bg-gray-800" />
            <div>
              <p className="text-2xl font-black text-white">{sessions.length}</p>
              <p className="text-xs text-gray-500 mt-0.5">Total</p>
            </div>
          </div>
        </div>
      </div>

      {/* Session list */}
      <div className="max-w-5xl mx-auto px-4 py-10">
        <GameLobbyList sessions={sessions} currentUserId={session.user.id} />
      </div>

      {/* Back link */}
      <div className="max-w-5xl mx-auto px-4 pb-10 text-center">
        <Link href="/dashboard" className="text-gray-600 hover:text-gray-400 text-sm transition-colors">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
