'use client';

import Link from 'next/link';
import { GAME_LABELS, GAME_ICONS } from '@/lib/games/constants';

interface Props {
  gameType: string;
  teamAName: string;
  teamBName: string;
  teamAColor: string;
  teamBColor: string;
  teamAScore: number;
  teamBScore: number;
  status: string;
  sessionId: string;
}

export default function GameRoomHeader({
  gameType, teamAName, teamBName, teamAColor, teamBColor,
  teamAScore, teamBScore, status,
}: Props) {
  const icon = GAME_ICONS[gameType] ?? '🎮';
  const label = GAME_LABELS[gameType] ?? gameType;

  return (
    <header className="flex items-center justify-between px-5 py-3 bg-gray-900 border-b border-gray-800 shrink-0 gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <Link href="/games" className="text-gray-400 hover:text-white text-sm shrink-0">
          ← Games
        </Link>
        <span className="text-gray-700">|</span>
        <span className="text-lg shrink-0">{icon}</span>
        <h1 className="text-white font-bold text-sm sm:text-base truncate">
          {label}
        </h1>
        {status === 'IN_PROGRESS' && (
          <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse shrink-0">
            LIVE
          </span>
        )}
        {status === 'WAITING' && (
          <span className="bg-yellow-700/60 text-yellow-300 text-xs font-bold px-2 py-0.5 rounded-full shrink-0">
            WAITING
          </span>
        )}
      </div>

      {/* Score bar */}
      <div className="flex items-center gap-3 text-sm font-mono shrink-0">
        <span className="font-bold hidden sm:inline" style={{ color: teamAColor }}>{teamAName}</span>
        <span
          className="text-white font-bold text-lg px-3 py-0.5 rounded-lg bg-gray-800"
        >
          {teamAScore} <span className="text-gray-600 text-sm">:</span> {teamBScore}
        </span>
        <span className="font-bold hidden sm:inline" style={{ color: teamBColor }}>{teamBName}</span>
      </div>
    </header>
  );
}
