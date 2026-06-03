'use client';

import { useEffect, useRef } from 'react';

interface Props {
  chain: string[];
  requiredLetter: string;
  teamAColor: string;
  teamBColor: string;
  teamAId: string;
  currentTurnTeamId: string;
}

const TILE_COLORS = ['#b45309', '#0369a1', '#15803d', '#7e22ce', '#b91c1c', '#0891b2', '#a16207', '#1d4ed8'];

export default function ChainDisplay({ chain, requiredLetter }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to end when chain grows
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [chain.length]);

  return (
    <div className="w-full flex flex-col items-center gap-4">
      {/* Chain scroll area */}
      {chain.length > 0 ? (
        <div
          ref={scrollRef}
          className="w-full overflow-x-auto flex items-center gap-1 py-3 px-2 scrollbar-hide"
          style={{ scrollBehavior: 'smooth' }}
        >
          {chain.map((word, i) => (
            <div key={i} className="flex items-center gap-1 shrink-0">
              <div
                className="px-3 py-2 rounded-lg font-bold text-white text-sm tracking-wider"
                style={{ backgroundColor: TILE_COLORS[i % TILE_COLORS.length] }}
              >
                {word}
              </div>
              {i < chain.length - 1 && (
                <span className="text-gray-500 font-bold text-lg">→</span>
              )}
            </div>
          ))}
          {/* Arrow to next word */}
          {chain.length > 0 && (
            <span className="text-gray-600 font-bold text-lg ml-1">→</span>
          )}
        </div>
      ) : (
        <div className="text-gray-600 text-sm italic">Chain starts with the first accepted word…</div>
      )}

      {/* Required letter — the focal point */}
      <div className="flex flex-col items-center gap-2">
        <p className="text-gray-500 text-xs uppercase tracking-widest">Next word must start with</p>
        <div
          className="w-24 h-24 rounded-2xl flex items-center justify-center text-5xl font-black text-white shadow-2xl animate-pulse"
          style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
        >
          {requiredLetter}
        </div>
      </div>
    </div>
  );
}
