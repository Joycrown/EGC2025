'use client';

import { useState, useEffect } from 'react';
import { ScrambleClientState, ScrambleResult } from '@/hooks/useGameSocket';
import ScrambledWord from './ScrambledWord';
import AnswerInput from './AnswerInput';

interface Props {
  scramble: ScrambleClientState;
  isParticipant: boolean;
  isMyTurn: boolean;
  currentTurnTeamId: string;
  onSubmit: (answer: string) => void;
  scrambleResult: ScrambleResult | null;
  teamAName: string;
  teamBName: string;
  teamAColor: string;
  teamBColor: string;
  teamAId: string;
}

type TileAnimation = 'idle' | 'correct' | 'wrong' | 'timeout';

export default function ScrambleBoard({
  scramble,
  isParticipant,
  isMyTurn,
  currentTurnTeamId,
  onSubmit,
  scrambleResult,
  teamAName,
  teamBName,
  teamAColor,
  teamBColor,
  teamAId,
}: Props) {
  const [animation, setAnimation] = useState<TileAnimation>('idle');

  useEffect(() => {
    if (!scrambleResult) return;
    setAnimation(scrambleResult.correct ? 'correct' : 'wrong');
    const t = setTimeout(() => setAnimation('idle'), 600);
    return () => clearTimeout(t);
  }, [scrambleResult]);

  useEffect(() => {
    setAnimation('idle');
  }, [scramble.scrambledWord]);

  const turnTeamName = currentTurnTeamId === teamAId ? teamAName : teamBName;
  const turnColor    = currentTurnTeamId === teamAId ? teamAColor : teamBColor;

  const resultTeamColor = scrambleResult
    ? scrambleResult.teamId === teamAId ? teamAColor : teamBColor
    : '';

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto gap-4 px-4 py-6">

      {/* Word counter */}
      <div className="text-gray-400 text-sm font-semibold tracking-wider uppercase">
        Word {scramble.wordNumber} / {scramble.totalWords}
      </div>

      {/* Turn banner */}
      <div
        className="px-5 py-2 rounded-full font-bold text-sm"
        style={{ backgroundColor: turnColor + '22', color: turnColor, border: `2px solid ${turnColor}44` }}
      >
        {isMyTurn ? '⚡ Your team\'s turn — unscramble it!' : `${turnTeamName}'s turn`}
      </div>

      {/* Category badge */}
      <div className="px-4 py-1 rounded-full bg-gray-800 border border-gray-700 text-gray-300 text-sm font-medium">
        {scramble.category}
      </div>

      {/* Hint */}
      {scramble.hint && (
        <p className="text-gray-400 text-sm text-center italic max-w-sm">
          Hint: {scramble.hint}
        </p>
      )}

      {/* Scrambled letters */}
      <ScrambledWord scrambledWord={scramble.scrambledWord} animation={animation} />

      {/* Active team input */}
      {isParticipant && isMyTurn && (
        <AnswerInput
          onSubmit={onSubmit}
          cooldownSeconds={0}
          disabled={scramble.wordSolved}
        />
      )}

      {/* Waiting label for non-active team participants */}
      {isParticipant && !isMyTurn && (
        <p className="text-gray-500 text-sm text-center">
          Waiting for <span style={{ color: turnColor }}>{turnTeamName}</span> to unscramble…
        </p>
      )}

      {/* Read-only label for spectators */}
      {!isParticipant && (
        <p className="text-gray-600 text-sm">Spectating — watch {turnTeamName} unscramble</p>
      )}

      {/* Result feedback */}
      {scrambleResult && (
        <div
          className={`mt-2 px-6 py-3 rounded-xl font-bold text-lg text-center transition-all ${
            scrambleResult.correct
              ? 'bg-green-800/80 text-green-200'
              : 'bg-red-900/80 text-red-300'
          }`}
          style={scrambleResult.correct ? { borderColor: resultTeamColor, borderWidth: 2 } : {}}
        >
          {scrambleResult.correct ? (
            <>
              <span style={{ color: resultTeamColor }}>{scrambleResult.teamName}</span>
              {' got it! '}<span className="text-yellow-400">+{scrambleResult.pointsAwarded} pts</span>
              {' — '}<span className="font-black">{scrambleResult.word}</span>
            </>
          ) : scrambleResult.word ? (
            // Timeout — word revealed
            <>
              <span className="text-gray-400 font-normal text-sm block mb-1">Time&apos;s up! The word was:</span>
              <span className="font-black text-white text-2xl">{scrambleResult.word}</span>
            </>
          ) : (
            // Wrong attempt
            <>
              <span style={{ color: resultTeamColor }}>{scrambleResult.teamName}</span>
              {' — wrong answer, keep going!'}
            </>
          )}
        </div>
      )}
    </div>
  );
}
