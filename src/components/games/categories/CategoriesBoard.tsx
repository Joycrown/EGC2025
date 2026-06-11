'use client';

import { useState, useRef, useEffect } from 'react';
import { CategoriesClientState, CategoriesResult, CategoriesFoundAnswer } from '@/hooks/useGameSocket';

interface Props {
  categories: CategoriesClientState;
  isMyTurn: boolean;
  isParticipant: boolean;
  onSubmit: (answer: string) => void;
  categoriesResult: CategoriesResult | null;
  categoriesRoundEnd: { remaining: CategoriesFoundAnswer[]; foundAnswers: CategoriesFoundAnswer[]; teamAScore: number; teamBScore: number } | null;
  currentTurnTeamId: string;
  teamAId: string;
  teamBId: string;
  teamAName: string;
  teamBName: string;
  teamAColor: string;
  teamBColor: string;
}

export default function CategoriesBoard({
  categories,
  isMyTurn,
  isParticipant,
  onSubmit,
  categoriesResult,
  categoriesRoundEnd,
  currentTurnTeamId,
  teamAId,
  teamBId: _teamBId,
  teamAName,
  teamBName,
  teamAColor,
  teamBColor,
}: Props) {
  const [answer, setAnswer] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const turnTeamName = currentTurnTeamId === teamAId ? teamAName : teamBName;
  const turnColor = currentTurnTeamId === teamAId ? teamAColor : teamBColor;
  const totalSlots = categories.category.totalAnswers;

  useEffect(() => {
    if (isMyTurn && isParticipant) inputRef.current?.focus();
  }, [isMyTurn, isParticipant]);

  // Clear input after a correct answer (foundAnswers length increases)
  useEffect(() => {
    if (categoriesResult?.correct) setAnswer('');
  }, [categoriesResult]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!answer.trim() || !isMyTurn) return;
    onSubmit(answer.trim());
    setAnswer('');
  }

  const strikeArray = Array.from({ length: categories.maxStrikes }, (_, i) => i < categories.strikes);

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto gap-4 px-4 py-5">

      {/* Round indicator */}
      <div className="text-gray-400 text-xs font-bold tracking-widest uppercase">
        Round {categories.roundNumber} / {categories.totalRounds}
      </div>

      {/* Active team */}
      <div
        className="px-5 py-2 rounded-full font-bold text-sm"
        style={{ backgroundColor: turnColor + '22', color: turnColor, border: `2px solid ${turnColor}44` }}
      >
        {isMyTurn ? '⚡ Your team — answer now!' : `${turnTeamName}'s turn`}
      </div>

      {/* Category card */}
      <div className="w-full bg-gray-900 border border-gray-700 rounded-2xl p-5 text-center">
        <p className="text-gray-500 text-xs font-semibold uppercase tracking-widest mb-2">
          {categories.category.subtitle}
        </p>
        <h2 className="text-white font-black text-xl sm:text-2xl leading-tight">
          {categories.category.title}
        </h2>
        <p className="text-gray-500 text-xs mt-2">
          {totalSlots} answer{totalSlots !== 1 ? 's' : ''} · {categories.foundAnswers.length} found
        </p>
      </div>

      {/* Answer board — slots */}
      <div className="w-full grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(totalSlots, 4)}, 1fr)` }}>
        {Array.from({ length: totalSlots }, (_, i) => {
          const found = categories.foundAnswers[i];
          return (
            <div
              key={i}
              className={`rounded-xl px-3 py-3 text-center text-sm font-bold transition-all ${
                found
                  ? 'bg-green-800/60 border border-green-600/50 text-green-200'
                  : 'bg-gray-800/60 border border-gray-700 text-gray-600'
              }`}
            >
              {found ? (
                <div>
                  <div className="text-xs text-green-400 mb-0.5">+{found.points} pt{found.points !== 1 ? 's' : ''}</div>
                  <div className="truncate">{found.text}</div>
                </div>
              ) : (
                <div className="text-lg">?</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Strikes */}
      <div className="flex items-center gap-3">
        <span className="text-gray-500 text-xs font-semibold uppercase tracking-wide">Strikes</span>
        <div className="flex gap-2">
          {strikeArray.map((hit, i) => (
            <div
              key={i}
              className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-base transition-all ${
                hit ? 'bg-red-700 text-white scale-110' : 'bg-gray-800 border border-gray-700 text-gray-600'
              }`}
            >
              {hit ? '✗' : '○'}
            </div>
          ))}
        </div>
      </div>

      {/* Input — active team only */}
      {isParticipant && isMyTurn && !categoriesRoundEnd && (
        <form onSubmit={handleSubmit} className="w-full flex gap-3 mt-1">
          <input
            ref={inputRef}
            type="text"
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            placeholder="Type your answer…"
            maxLength={60}
            autoComplete="off"
            className="flex-1 bg-gray-800 border-2 border-yellow-500/50 rounded-xl px-4 py-3 text-white font-semibold text-base focus:outline-none focus:border-yellow-400 placeholder-gray-600"
          />
          <button
            type="submit"
            disabled={!answer.trim()}
            className="px-6 py-3 rounded-xl font-bold bg-yellow-600 hover:bg-yellow-500 disabled:opacity-40 text-black transition-colors"
          >
            Answer
          </button>
        </form>
      )}

      {isParticipant && !isMyTurn && !categoriesRoundEnd && (
        <p className="text-gray-500 text-sm text-center">
          Waiting for <span style={{ color: turnColor }}>{turnTeamName}</span> to answer…
        </p>
      )}

      {!isParticipant && !categoriesRoundEnd && (
        <p className="text-gray-600 text-sm">Spectating — watch the answers reveal</p>
      )}

      {/* Result flash */}
      {categoriesResult?.correct && (
        <div className="w-full max-w-sm mx-auto px-5 py-3 rounded-xl bg-green-800/70 text-center">
          <div className="text-green-200 font-black text-lg">{categoriesResult.answer}</div>
          <div className="text-yellow-400 text-sm mt-0.5">+{categoriesResult.points} pts</div>
          <div className="text-gray-400 text-xs mt-1">{categoriesResult.remaining} answer{categoriesResult.remaining !== 1 ? 's' : ''} left</div>
        </div>
      )}

      {(categoriesResult?.reason === 'wrong' || categoriesResult?.reason === 'timeout') && (
        <div className="w-full max-w-sm mx-auto px-5 py-3 rounded-xl bg-red-900/50 border border-red-800/40 text-center">
          <div className="text-red-400 font-bold text-sm">
            {categoriesResult.reason === 'timeout' ? '⏱ Time\'s up!' : `✗ Not on the board`}
          </div>
          {categoriesResult.answer && categoriesResult.reason === 'wrong' && (
            <div className="text-gray-400 text-xs mt-1">&ldquo;{categoriesResult.answer}&rdquo; — keep going!</div>
          )}
          <div className="text-red-500/70 text-xs mt-1">Strike {categoriesResult.strikes}/{categories.maxStrikes}</div>
        </div>
      )}

      {/* Round end — reveal remaining */}
      {categoriesRoundEnd && (
        <div className="w-full bg-gray-900 border border-gray-700 rounded-2xl p-5">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3 text-center">
            Round over — answers revealed
          </p>
          {categoriesRoundEnd.remaining.length > 0 ? (
            <div className="flex flex-wrap gap-2 justify-center mb-3">
              {categoriesRoundEnd.remaining.map((a, i) => (
                <span key={i} className="px-3 py-1.5 rounded-lg bg-gray-700 border border-gray-600 text-gray-300 text-sm font-semibold">
                  {a.text}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-green-400 text-sm text-center font-bold mb-3">All answers found! 🎉</p>
          )}
          <div className="flex justify-center gap-8 mt-2 text-sm">
            <div className="text-center">
              <div className="font-black text-lg" style={{ color: teamAColor }}>{categoriesRoundEnd.teamAScore}</div>
              <div className="text-gray-500 text-xs">{teamAName}</div>
            </div>
            <div className="text-gray-600 text-lg self-center">—</div>
            <div className="text-center">
              <div className="font-black text-lg" style={{ color: teamBColor }}>{categoriesRoundEnd.teamBScore}</div>
              <div className="text-gray-500 text-xs">{teamBName}</div>
            </div>
          </div>
          <p className="text-gray-600 text-xs text-center mt-3">Next round starting…</p>
        </div>
      )}
    </div>
  );
}
