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
  roster: { userId: string; teamId: string }[];
}

interface Props {
  sessions: SessionCard[];
  currentUserId: string;
}

function formatDate(d: Date): string {
  return new Date(d).toLocaleString('en-GB', {
    day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit',
  });
}

function SessionCard({ s, currentUserId }: { s: SessionCard; currentUserId: string }) {
  const isRegistered = s.roster.some(r => r.userId === currentUserId);
  const myTeam = isRegistered
    ? (s.roster.find(r => r.userId === currentUserId)?.teamId === s.teamA.id ? s.teamA : s.teamB)
    : null;
  const isLive = s.status === 'IN_PROGRESS';
  const isWaiting = s.status === 'WAITING';
  const isScheduled = s.status === 'SCHEDULED';
  const isCompleted = s.status === 'COMPLETED';
  const icon = GAME_ICONS[s.gameType] ?? '🎮';
  const label = GAME_LABELS[s.gameType] ?? s.gameType;

  return (
    <div className={`rounded-2xl border transition-all ${isLive ? 'border-red-500/40 bg-red-950/10' : isCompleted ? 'border-gray-800 bg-gray-900/50' : 'border-gray-800 bg-gray-900'}`}>
      <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">

        {/* Icon + game info */}
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${isLive ? 'bg-red-900/60' : isCompleted ? 'bg-gray-800' : 'bg-gray-800'}`}>
            {icon}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-white font-bold text-base truncate">{label}</span>
              {isLive && (
                <span className="flex items-center gap-1 text-xs font-bold text-red-400 bg-red-900/40 border border-red-700/50 px-2 py-0.5 rounded-full animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
                  LIVE
                </span>
              )}
              {isWaiting && (
                <span className="text-xs font-semibold text-yellow-400 bg-yellow-900/30 border border-yellow-700/40 px-2 py-0.5 rounded-full">
                  Waiting
                </span>
              )}
              {isRegistered && myTeam && (
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full border"
                  style={{ color: myTeam.color, borderColor: myTeam.color + '60', backgroundColor: myTeam.color + '18' }}
                >
                  You play for {myTeam.name}
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
              <div className="flex items-center gap-3 mt-2">
                <span className="font-mono font-bold text-sm" style={{ color: s.teamA.color }}>
                  {s.teamAScore}
                </span>
                <span className="text-gray-500 text-xs">pts</span>
                <span className="text-gray-500">—</span>
                <span className="text-gray-500 text-xs">pts</span>
                <span className="font-mono font-bold text-sm" style={{ color: s.teamB.color }}>
                  {s.teamBScore}
                </span>
              </div>
            )}

            {/* Schedule time */}
            {(isScheduled || isWaiting) && (
              <p className="text-gray-500 text-xs mt-1.5">{formatDate(s.scheduledAt)}</p>
            )}

            {/* Roster count */}
            <p className="text-gray-600 text-xs mt-1">
              {s.roster.length} / 10 players registered
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="shrink-0 sm:ml-2">
          {(isLive || isWaiting) && (
            <Link
              href={`/games/${s.id}`}
              className="block bg-red-700 hover:bg-red-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors text-center whitespace-nowrap"
            >
              {isRegistered ? '▶ Play Now' : '▶ Watch Live'}
            </Link>
          )}
          {isScheduled && (
            <Link
              href={`/games/${s.id}`}
              className="block bg-gray-800 hover:bg-gray-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors text-center border border-gray-700 whitespace-nowrap"
            >
              Enter Room →
            </Link>
          )}
          {isCompleted && (
            <Link
              href={`/games/${s.id}`}
              className="block text-gray-500 hover:text-gray-300 font-medium px-5 py-2.5 rounded-xl text-sm border border-gray-800 hover:border-gray-600 transition-colors text-center whitespace-nowrap"
            >
              View Results
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, accent, sessions, currentUserId }: { title: string; accent: string; sessions: SessionCard[]; currentUserId: string }) {
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
        <p className="text-sm mt-1 text-gray-600">Check back soon — an admin will create game sessions before the competition begins.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <Section title="Live Now" accent="text-red-400" sessions={live} currentUserId={currentUserId} />
      <Section title="Upcoming" accent="text-blue-400" sessions={upcoming} currentUserId={currentUserId} />
      <Section title="Completed" accent="text-gray-500" sessions={completed} currentUserId={currentUserId} />
    </div>
  );
}
