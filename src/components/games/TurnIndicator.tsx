'use client';

interface Props {
  currentTurnTeamId: string;
  teamAId: string;
  teamBId: string;
  teamAName: string;
  teamBName: string;
  teamAColor: string;
  teamBColor: string;
  timeLeft: number;
  isMyTurn: boolean;
  wordNumber: number;
  totalWords: number;
}

export default function TurnIndicator({
  currentTurnTeamId, teamAId, teamAName, teamBName, teamAColor, teamBColor,
  timeLeft, isMyTurn, wordNumber, totalWords,
}: Props) {
  const isTeamA = currentTurnTeamId === teamAId;
  const name = isTeamA ? teamAName : teamBName;
  const color = isTeamA ? teamAColor : teamBColor;
  const urgent = timeLeft <= 10;

  return (
    <div
      className="flex items-center justify-between px-5 py-2 text-sm font-semibold shrink-0"
      style={{ backgroundColor: color + '18', borderBottom: `2px solid ${color}44` }}
    >
      <div className="flex items-center gap-2">
        <span
          className="w-3 h-3 rounded-full animate-pulse"
          style={{ backgroundColor: color }}
        />
        <span style={{ color }}>
          {isMyTurn ? '⚡ Your Team\'s Word!' : `${name}'s Word`}
        </span>
        <span className="text-gray-500 font-normal text-xs">
          ({wordNumber}/{totalWords})
        </span>
      </div>
      <span className={`font-mono font-bold text-lg ${urgent ? 'text-red-400 animate-pulse' : 'text-gray-300'}`}>
        {timeLeft}s
      </span>
    </div>
  );
}
