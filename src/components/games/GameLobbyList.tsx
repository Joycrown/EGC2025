'use client';

import Link from 'next/link';
import { SessionStatus } from '@prisma/client';
import { GAME_LABELS, GAME_ICONS } from '@/lib/games/constants';

interface SessionTeam {
  id: string;
  name: string;
  color: string;
}

interface SessionCard {
  id: string;
  gameType: string;
  status: SessionStatus;
  scheduledAt: Date;
  teamAScore: number;
  teamBScore: number;
  teamA: SessionTeam;
  teamB: SessionTeam;
  winner: { id: string; name: string } | null;
  roster: { userId: string; teamId: string }[];
}

interface Props {
  sessions: SessionCard[];
  currentUserId: string;
}

const THIRTY_MINS_MS = 30 * 60 * 1000;

function formatDate(d: Date): string {
  return new Date(d).toLocaleString('en-GB', {
    day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatCountdown(ms: number): string {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function SessionCard({ s, currentUserId }: { s: SessionCard; currentUserId: string }) {
  const now = new Date();
  const msUntil = new Date(s.scheduledAt).getTime() - now.getTime();
  const isOpeningSoon = msUntil > 0 && msUntil <= THIRTY_MINS_MS;
  const roomOpen = msUntil <= THIRTY_MINS_MS; // within 30 min OR past scheduled time

  const isRegistered = s.roster.some(r => r.userId === currentUserId);
  const myRosterEntry = s.roster.find(r => r.userId === currentUserId);
  const myTeam = isRegistered
    ? (myRosterEntry?.teamId === s.teamA.id ? s.teamA : s.teamB)
    : null;
  const _opponentTeam = myTeam
    ? (myTeam.id === s.teamA.id ? s.teamB : s.teamA)
    : null;

  const isLive = s.status === 'IN_PROGRESS';
  const isWaiting = s.status === 'WAITING';
  const isScheduled = s.status === 'SCHEDULED';
  const isCompleted = s.status === 'COMPLETED';

  const icon = GAME_ICONS[s.gameType] ?? '🎮';
  const label = GAME_LABELS[s.gameType] ?? s.gameType;

  // Completed: derive effective winner from winnerId first, then score comparison
  const effectiveWinner: SessionTeam | null = (() => {
    if (!isCompleted) return null;
    if (s.winner?.id === s.teamA.id) return s.teamA;
    if (s.winner?.id === s.teamB.id) return s.teamB;
    // winnerId not set — fall back to score
    if (s.teamAScore > s.teamBScore) return s.teamA;
    if (s.teamBScore > s.teamAScore) return s.teamB;
    return null; // genuine draw
  })();

  let resultLabel: string | null = null;
  if (isCompleted && myTeam) {
    if (effectiveWinner === null) resultLabel = 'Draw';
    else if (effectiveWinner.id === myTeam.id) resultLabel = 'Won';
    else resultLabel = 'Lost';
  }

  return (
    <div className={`rounded-2xl border transition-all ${
      isLive    ? 'border-red-500/40 bg-red-950/10' :
      isCompleted ? 'border-gray-800 bg-gray-900/50' :
                  'border-gray-800 bg-gray-900'
    }`}>
      <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">

        {/* Icon + game info */}
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
            isLive ? 'bg-red-900/60' : isCompleted ? 'bg-gray-800' : 'bg-gray-800'
          }`}>
            {icon}
          </div>

          <div className="min-w-0 flex-1">
            {/* Title row */}
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-white font-bold text-base">{label}</span>
              {isLive && (
                <span className="flex items-center gap-1 text-xs font-bold text-red-400 bg-red-900/40 border border-red-700/50 px-2 py-0.5 rounded-full animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
                  LIVE
                </span>
              )}
              {isWaiting && (
                <span className="text-xs font-semibold text-yellow-400 bg-yellow-900/30 border border-yellow-700/40 px-2 py-0.5 rounded-full">
                  Starting soon
                </span>
              )}
              {isOpeningSoon && isScheduled && (
                <span className="text-xs font-semibold text-yellow-400 bg-yellow-900/20 border border-yellow-700/30 px-2 py-0.5 rounded-full">
                  Opens in {formatCountdown(msUntil)}
                </span>
              )}
              {/* Team badge */}
              {isRegistered && myTeam && (
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full border"
                  style={{ color: myTeam.color, borderColor: myTeam.color + '60', backgroundColor: myTeam.color + '18' }}
                >
                  {isCompleted ? `You played for ${myTeam.name}` : `You play for ${myTeam.name}`}
                </span>
              )}
            </div>

            {/* Teams */}
            <div className="flex items-center gap-2 mt-1">
              <span
                className="font-bold text-sm px-2 py-0.5 rounded-md"
                style={{ color: s.teamA.color, backgroundColor: s.teamA.color + '22' }}
              >
                {s.teamA.name}
              </span>
              <span className="text-gray-600 text-xs font-black">VS</span>
              <span
                className="font-bold text-sm px-2 py-0.5 rounded-md"
                style={{ color: s.teamB.color, backgroundColor: s.teamB.color + '22' }}
              >
                {s.teamB.name}
              </span>
            </div>

            {/* Live score */}
            {isLive && (
              <div className="flex items-center gap-2 mt-2">
                <span className="font-mono font-bold text-sm" style={{ color: s.teamA.color }}>{s.teamAScore}</span>
                <span className="text-gray-500 text-xs">pts — pts</span>
                <span className="font-mono font-bold text-sm" style={{ color: s.teamB.color }}>{s.teamBScore}</span>
              </div>
            )}

            {/* Final result — shown on completed cards */}
            {isCompleted && (
              <div className="mt-2 flex items-center gap-3 flex-wrap">
                {/* Score */}
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-base tabular-nums" style={{ color: s.teamA.color }}>{s.teamAScore}</span>
                  <span className="text-gray-600 text-sm">—</span>
                  <span className="font-black text-base tabular-nums" style={{ color: s.teamB.color }}>{s.teamBScore}</span>
                </div>
                {/* Winner badge (score-aware) */}
                {effectiveWinner ? (
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ color: effectiveWinner.color, backgroundColor: effectiveWinner.color + '20' }}
                  >
                    {effectiveWinner.name} wins
                  </span>
                ) : (
                  <span className="text-xs font-bold text-gray-500 px-2 py-0.5 rounded-full bg-gray-800">Draw</span>
                )}
                {/* My result pill */}
                {isRegistered && resultLabel && (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    resultLabel === 'Won'  ? 'bg-green-900/30 text-green-400 border border-green-700/40' :
                    resultLabel === 'Lost' ? 'bg-red-900/20 text-red-400 border border-red-800/30' :
                                            'bg-gray-800 text-gray-400'
                  }`}>
                    {resultLabel === 'Won' ? '🏆 You won' : resultLabel === 'Lost' ? 'You lost' : 'Draw'}
                  </span>
                )}
              </div>
            )}

            {/* Schedule time */}
            {(isScheduled || isWaiting) && (
              <p className="text-gray-500 text-xs mt-1.5">{formatDate(s.scheduledAt)}</p>
            )}

            {/* Roster count */}
            <p className="text-gray-600 text-xs mt-1">{s.roster.length} / 10 players registered</p>
          </div>
        </div>

        {/* CTA */}
        <div className="shrink-0 sm:ml-2">
          {/* Live / waiting — always active */}
          {(isLive || isWaiting) && (
            <Link
              href={`/games/${s.id}`}
              className="block bg-red-700 hover:bg-red-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors text-center whitespace-nowrap"
            >
              {isRegistered ? '▶ Play Now' : '▶ Watch Live'}
            </Link>
          )}

          {/* Upcoming — gated to 30 min before */}
          {isScheduled && (
            roomOpen ? (
              <Link
                href={`/games/${s.id}`}
                className="block bg-gray-800 hover:bg-gray-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors text-center border border-gray-700 whitespace-nowrap"
              >
                Enter Room →
              </Link>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <button
                  disabled
                  className="block bg-gray-800/50 text-gray-600 font-semibold px-5 py-2.5 rounded-xl text-sm text-center border border-gray-800 whitespace-nowrap cursor-not-allowed select-none"
                >
                  Enter Room →
                </button>
                <p className="text-[10px] text-gray-600 text-center">
                  Opens in {formatCountdown(msUntil - THIRTY_MINS_MS)}
                </p>
              </div>
            )
          )}

          {/* Completed — no CTA, result is shown on the card */}
        </div>
      </div>
    </div>
  );
}

function Section({ title, accent, sessions, currentUserId }: {
  title: string; accent: string; sessions: SessionCard[]; currentUserId: string;
}) {
  if (sessions.length === 0) return null;
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className={`text-xs font-black uppercase tracking-widest ${accent}`}>{title}</span>
        <div className="flex-1 h-px bg-gray-800" />
        <span className="text-xs text-gray-600">{sessions.length}</span>
      </div>
      {sessions.map(s => (
        <SessionCard key={s.id} s={s} currentUserId={currentUserId} />
      ))}
    </div>
  );
}

export default function GameLobbyList({ sessions, currentUserId }: Props) {
  const live = sessions.filter(s => s.status === 'IN_PROGRESS' || s.status === 'WAITING');
  const upcoming = sessions.filter(s => s.status === 'SCHEDULED');
  const completed = sessions.filter(s => s.status === 'COMPLETED');

  if (sessions.length === 0) {
    return (
      <div className="text-center py-24 text-gray-500">
        <div className="text-5xl mb-4">🎮</div>
        <p className="text-lg font-semibold">No games scheduled yet.</p>
        <p className="text-sm mt-1 text-gray-600">Check back soon — an admin will create game sessions.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <Section title="Live Now"  accent="text-red-400"  sessions={live}      currentUserId={currentUserId} />
      <Section title="Upcoming"  accent="text-blue-400" sessions={upcoming}  currentUserId={currentUserId} />
      <Section title="Completed" accent="text-gray-500" sessions={completed} currentUserId={currentUserId} />
    </div>
  );
}
