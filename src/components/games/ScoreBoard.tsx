'use client';

interface Props {
  teamAName: string;
  teamBName: string;
  teamAColor: string;
  teamBColor: string;
  teamAScore: number;
  teamBScore: number;
}

export default function ScoreBoard({ teamAName, teamBName, teamAColor, teamBColor, teamAScore, teamBScore }: Props) {
  return (
    <div className="bg-gray-800 rounded-xl p-3 text-center">
      <p className="text-gray-400 text-xs mb-3 uppercase tracking-wider font-semibold">Score</p>
      <div className="space-y-2">
        {[
          { name: teamAName, score: teamAScore, color: teamAColor },
          { name: teamBName, score: teamBScore, color: teamBColor },
        ].map(t => (
          <div key={t.name} className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold truncate" style={{ color: t.color }}>{t.name}</span>
            <span className="text-white font-mono font-bold text-lg">{t.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
