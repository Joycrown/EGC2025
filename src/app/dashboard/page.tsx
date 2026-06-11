'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { GAME_LABELS, GAME_ICONS } from '@/lib/games/constants';

interface CountdownValues { days: number; hours: number; minutes: number; seconds: number; }
interface TeamStanding {
  team: { id: string; name: string; color: string };
  totalPoints: number;
  wins: number;
  played: number;
}
interface UpcomingSession {
  id: string;
  gameType: string;
  scheduledAt: string;
  roundNumber: number | null;
  teamA: { id: string; name: string; color: string };
  teamB: { id: string; name: string; color: string };
}
interface LeaderboardData {
  tournamentName: string | null;
  leaderboard: TeamStanding[];
  upcomingSessions: UpcomingSession[];
}

const MEDAL = ['🥇', '🥈', '🥉', '4️⃣'];

function formatSessionTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const tomorrow = new Date(now); tomorrow.setDate(now.getDate() + 1);
  const isTomorrow = d.toDateString() === tomorrow.toDateString();
  const timeStr = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  if (isToday) return `Today · ${timeStr}`;
  if (isTomorrow) return `Tomorrow · ${timeStr}`;
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) + ` · ${timeStr}`;
}

export default function DashboardPage() {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lbData, setLbData] = useState<LeaderboardData | null>(null);
  const [countdown, setCountdown] = useState<CountdownValues>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const conferenceDate = useMemo(() => new Date('2026-07-10T00:00:00'), []);

  useEffect(() => {
    let mounted = true;
    fetch('/api/auth/me', { headers: { 'Cache-Control': 'no-cache' } })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!mounted) return;
        if (!d?.user) { router.push('/login'); return; }
        const teamName = d.user.teamName && !d.user.teamName.startsWith('Team ')
          ? `Team ${d.user.teamName}` : d.user.teamName;
        setUser({ ...d.user, teamName });
        setLoading(false);
      })
      .catch(() => { if (mounted) router.push('/login'); });
    return () => { mounted = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch real leaderboard data
  useEffect(() => {
    fetch('/api/leaderboard')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d && !d.error) setLbData(d); })
      .catch(() => {});
  }, []);

  // Countdown timer
  useEffect(() => {
    const tick = () => {
      const diff = conferenceDate.getTime() - Date.now();
      if (diff <= 0) { setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 }); return; }
      setCountdown({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [conferenceDate]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const teamColorMap: Record<string, string> = {
    'Team Bethel': '#eab308',
    'Team Judah':  '#ef4444',
    'Team Salem':  '#3b82f6',
    'Team Shiloh': '#a855f7',
  };
  const userTeamColor = teamColorMap[user?.teamName] ?? '#6b7280';

  const isLive = countdown.days === 0 && countdown.hours === 0 && countdown.minutes === 0;

  return (
    <div className="space-y-6">

      {/* ── Welcome + Countdown banner ─────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 55%, #0f3460 100%)' }}
      >
        <div className="px-6 py-6 sm:px-8 sm:py-7 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <p className="text-red-400 text-xs font-bold uppercase tracking-widest mb-1">EGC Conference 2026</p>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Welcome, {user?.fullName?.split(' ')[0] || 'Participant'}!
            </h2>
            <p className="text-blue-200/60 text-sm mt-1">July 10–12 · Akure, Nigeria</p>
          </div>

          <div className="text-center sm:text-right shrink-0">
            <p className="text-blue-300/50 text-xs font-semibold uppercase tracking-wider mb-3">
              {isLive ? '🔴 Conference is Live!' : 'Starts In'}
            </p>
            <div className="flex items-end gap-2">
              {[
                { v: countdown.days,    l: 'Days' },
                { v: countdown.hours,   l: 'Hrs' },
                { v: countdown.minutes, l: 'Min' },
                { v: countdown.seconds, l: 'Sec' },
              ].map(({ v, l }, i) => (
                <React.Fragment key={l}>
                  <div className="flex flex-col items-center">
                    <div className="bg-white/10 border border-white/10 rounded-xl px-3 py-2 min-w-[52px]">
                      <span className="text-2xl sm:text-3xl font-black text-white tabular-nums">
                        {String(v).padStart(2, '0')}
                      </span>
                    </div>
                    <span className="text-[10px] text-blue-300/40 font-semibold mt-1 uppercase">{l}</span>
                  </div>
                  {i < 3 && <span className="text-white/20 text-xl font-bold mb-5">:</span>}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Team card ─────────────────────────────────────────────── */}
      {user?.teamName && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div>
            <h3 className="text-lg font-bold" style={{ color: userTeamColor }}>
              Your Team: {user.teamName}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Connect with your fellow {user.teamName} members and stay updated!
            </p>
          </div>
          {user?.whatsappLink ? (
            <a
              href={user.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-semibold text-sm shadow-sm transition-opacity hover:opacity-90"
              style={{ backgroundColor: userTeamColor }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.886-.001 2.267.651 4.383 1.803 6.166l-1.225 4.485 4.574-1.196z"/>
              </svg>
              Join Team Chat
            </a>
          ) : (
            <p className="text-sm text-gray-400 shrink-0">WhatsApp link not available</p>
          )}
        </motion.div>
      )}

      {/* ── Standings + Upcoming Games ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Team Standings */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden flex flex-col"
        >
          <div className="px-5 py-4 border-b border-gray-800 flex items-center gap-2">
            <span className="text-lg">🏆</span>
            <div className="flex-1">
              <h3 className="font-bold text-white text-base">Team Standings</h3>
              {lbData?.tournamentName && (
                <p className="text-gray-600 text-xs truncate">{lbData.tournamentName}</p>
              )}
            </div>
          </div>

          <div className="flex-1 divide-y divide-gray-800/60">
            {lbData && lbData.leaderboard.length > 0 ? (
              lbData.leaderboard.map((entry, i) => {
                const isMyTeam = user?.teamName === entry.team.name;
                return (
                  <div key={entry.team.id}
                    className={`px-5 py-3.5 flex items-center gap-3 transition-colors ${
                      i === 0 ? 'bg-yellow-500/5' : ''
                    } ${isMyTeam ? 'ring-1 ring-inset ring-white/10' : ''}`}>
                    <div className="text-xl w-8 text-center shrink-0">{MEDAL[i]}</div>
                    <div className="w-3 h-9 rounded-sm shrink-0" style={{ backgroundColor: entry.team.color }} />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white text-sm leading-tight">
                        {entry.team.name}
                        {isMyTeam && <span className="ml-1.5 text-[10px] text-white/40 font-normal">you</span>}
                      </p>
                      <p className="text-gray-600 text-xs">{entry.played} played · {entry.wins} wins</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-2xl font-black tabular-nums leading-tight" style={{ color: entry.team.color }}>
                        {entry.totalPoints}
                      </p>
                      <p className="text-gray-600 text-[10px]">pts</p>
                    </div>
                  </div>
                );
              })
            ) : (
              /* Skeleton placeholder when no tournament data yet */
              [1, 2, 3, 4].map(i => (
                <div key={i} className="px-5 py-3.5 flex items-center gap-3">
                  <div className="text-xl w-8 text-center text-gray-700">{i}</div>
                  <div className="w-3 h-9 rounded-sm bg-gray-800" />
                  <div className="flex-1">
                    <div className="h-3 w-28 bg-gray-800 rounded animate-pulse mb-1.5" />
                    <div className="h-2 w-20 bg-gray-800/60 rounded animate-pulse" />
                  </div>
                  <div className="h-7 w-12 bg-gray-800 rounded animate-pulse" />
                </div>
              ))
            )}
          </div>

          <div className="px-5 py-3 border-t border-gray-800">
            <Link href="/leaderboard"
              className="flex items-center justify-center gap-1 text-sm font-semibold text-sky-400 hover:text-sky-300 transition-colors">
              View Detailed Stats →
            </Link>
          </div>
        </motion.div>

        {/* Upcoming Games */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden flex flex-col"
        >
          <div className="px-5 py-4 border-b border-gray-800 flex items-center gap-2">
            <span className="text-lg">🎮</span>
            <div>
              <h3 className="font-bold text-white text-base">Upcoming Games</h3>
              <p className="text-gray-600 text-xs">Next scheduled sessions</p>
            </div>
          </div>

          <div className="flex-1 divide-y divide-gray-800/60">
            {lbData && lbData.upcomingSessions.length > 0 ? (
              lbData.upcomingSessions.slice(0, 5).map(s => {
                const isMyGame =
                  user?.teamName === s.teamA.name || user?.teamName === s.teamB.name;
                return (
                  <Link key={s.id} href={`/games/${s.id}`}
                    className={`px-5 py-3.5 flex items-center gap-3 hover:bg-gray-800/50 transition-colors group ${
                      isMyGame ? 'bg-white/[0.02]' : ''
                    }`}>
                    <span className="text-xl shrink-0">{GAME_ICONS[s.gameType] ?? '🎮'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-sm leading-tight">
                        {GAME_LABELS[s.gameType] ?? s.gameType}
                        {isMyGame && (
                          <span className="ml-1.5 text-[10px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded-full font-bold">Your game</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        <span style={{ color: s.teamA.color }}>{s.teamA.name}</span>
                        <span className="text-gray-700"> vs </span>
                        <span style={{ color: s.teamB.color }}>{s.teamB.name}</span>
                        {s.roundNumber && <span className="text-gray-700"> · Round {s.roundNumber}</span>}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-semibold text-gray-400 whitespace-nowrap">
                        {formatSessionTime(s.scheduledAt)}
                      </p>
                    </div>
                  </Link>
                );
              })
            ) : lbData && lbData.upcomingSessions.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <p className="text-gray-600 text-sm">No upcoming sessions scheduled yet.</p>
                <p className="text-gray-700 text-xs mt-1">Check back after the admin publishes the schedule.</p>
              </div>
            ) : (
              [1, 2, 3, 4].map(i => (
                <div key={i} className="px-5 py-3.5 flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-gray-800 animate-pulse shrink-0" />
                  <div className="flex-1">
                    <div className="h-3 w-32 bg-gray-800 rounded animate-pulse mb-1.5" />
                    <div className="h-2 w-40 bg-gray-800/60 rounded animate-pulse" />
                  </div>
                  <div className="h-3 w-20 bg-gray-800/60 rounded animate-pulse" />
                </div>
              ))
            )}
          </div>

          <div className="px-5 py-3 border-t border-gray-800">
            <Link href="/games"
              className="flex items-center justify-center gap-1 text-sm font-semibold text-sky-400 hover:text-sky-300 transition-colors">
              See All Games →
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
