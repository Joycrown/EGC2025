'use client';

import { ChainClientState, ChainResult } from '@/hooks/useGameSocket';
import ChainDisplay from './ChainDisplay';
import ChainInput from './ChainInput';

interface Props {
  chain: ChainClientState;
  isMyTurn: boolean;
  isParticipant: boolean;
  onSubmit: (word: string) => void;
  chainResult: ChainResult | null;
  chainInvalidReason: string | null;
  currentTurnTeamId: string;
  teamAId: string;
  teamBId: string;
  teamAName: string;
  teamBName: string;
  teamAColor: string;
  teamBColor: string;
}

export default function ChainBoard({
  chain,
  isMyTurn,
  isParticipant,
  onSubmit,
  chainResult,
  chainInvalidReason,
  currentTurnTeamId,
  teamAId,
  teamBId: _teamBId,
  teamAName,
  teamBName,
  teamAColor,
  teamBColor,
}: Props) {
  const turnTeamName = currentTurnTeamId === teamAId ? teamAName : teamBName;
  const turnColor    = currentTurnTeamId === teamAId ? teamAColor : teamBColor;

  const showTimeout      = chainResult?.reason === 'timeout';
  const showWrongAttempt = chainResult && !chainResult.correct && chainResult.reason !== 'timeout';

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto gap-5 px-4 py-6">

      {/* Turn counter */}
      <div className="text-gray-400 text-sm font-semibold tracking-wider uppercase">
        Turn {chain.turnNumber} / {chain.totalTurns}
      </div>

      {/* Active team indicator */}
      <div
        className="px-5 py-2 rounded-full font-bold text-sm"
        style={{ backgroundColor: turnColor + '22', color: turnColor, border: `2px solid ${turnColor}44` }}
      >
        {isMyTurn ? "⚡ Your team's turn!" : `${turnTeamName}'s turn`}
      </div>

      {/* Chain history + required letter */}
      <ChainDisplay
        chain={chain.chain}
        requiredLetter={chain.requiredLetter}
        teamAColor={teamAColor}
        teamBColor={teamBColor}
        teamAId={teamAId}
        currentTurnTeamId={currentTurnTeamId}
      />

      {/* What teams can submit — shown to everyone */}
      <div className="w-full bg-gray-900 border border-gray-700 rounded-2xl p-4 text-center text-sm text-gray-400">
        Submit any valid word starting with{' '}
        <span
          className="inline-flex items-center justify-center w-8 h-8 rounded-lg font-black text-white text-base mx-1"
          style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
        >
          {chain.requiredLetter}
        </span>
        {' '}— Bible words earn <span className="text-yellow-400 font-bold">+3 pts</span>,
        {' '}other words <span className="text-gray-300 font-bold">+1 pt</span>
      </div>

      {/* Wrong attempts log */}
      {chain.wrongAttempts.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2">
          {chain.wrongAttempts.map((w, i) => (
            <span key={i} className="px-3 py-1 rounded-full bg-red-950 border border-red-800 text-red-400 text-xs font-mono line-through">
              {w}
            </span>
          ))}
        </div>
      )}

      {/* Input — only active team */}
      {isParticipant && isMyTurn && (
        <ChainInput
          requiredLetter={chain.requiredLetter}
          onSubmit={onSubmit}
          invalidReason={chainInvalidReason}
          disabledWords={chain.wrongAttempts}
        />
      )}

      {isParticipant && !isMyTurn && (
        <p className="text-gray-500 text-sm text-center">
          Waiting for <span style={{ color: turnColor }}>{turnTeamName}</span> to submit a word…
        </p>
      )}

      {!isParticipant && (
        <p className="text-gray-600 text-sm">Spectating — watch the chain grow</p>
      )}

      {/* ── Result overlays ── */}

      {chainResult?.correct && (
        <div className="w-full max-w-sm mx-auto px-6 py-4 rounded-xl bg-green-800/80 text-green-200 font-bold text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-2xl font-black">{chainResult.word}</span>
            {chainResult.isBibleWord && (
              <span className="text-xs bg-yellow-600 text-white px-2 py-0.5 rounded-full font-semibold">✝ Bible</span>
            )}
          </div>
          <div className="text-sm">
            <span style={{ color: chainResult.teamId === teamAId ? teamAColor : teamBColor }}>
              {chainResult.teamName}
            </span>
            {' '}<span className="text-yellow-400">+{chainResult.pointsAwarded} pts</span>
            {chainResult.nextLetter && (
              <span className="text-gray-400 ml-2">→ next: <strong className="text-white">{chainResult.nextLetter}</strong></span>
            )}
          </div>
        </div>
      )}

      {showTimeout && (
        <div className="w-full max-w-sm mx-auto px-6 py-4 rounded-xl bg-gray-800 border border-gray-600 text-center">
          <p className="text-gray-400 text-sm mb-1">
            Time&apos;s up —{' '}
            <span style={{ color: chainResult!.teamId === teamAId ? teamAColor : teamBColor }}>
              {chainResult!.teamName}
            </span>
          </p>
          <p className="text-white text-sm">
            Letter <strong className="text-yellow-400">{chain.requiredLetter}</strong> carries over to the other team
          </p>
        </div>
      )}

      {showWrongAttempt && (
        <div className="w-full max-w-sm mx-auto px-4 py-2 rounded-xl bg-red-900/50 text-red-400 text-sm text-center">
          <span style={{ color: chainResult!.teamId === teamAId ? teamAColor : teamBColor }}>
            {chainResult!.teamName}
          </span>
          {' tried '}<strong>{chainResult!.word}</strong> — not valid, keep going!
        </div>
      )}
    </div>
  );
}
