'use client';

import { TriviaClientState, TriviaReveal } from '@/hooks/useGameSocket';

const OPTION_LABELS = ['A', 'B', 'C', 'D'] as const;

interface Props {
  trivia: TriviaClientState;
  isParticipant: boolean;
  myTeamId: string | null;
  onBuzz: () => void;
  onAnswer: (answer: string) => void;
  triviaReveal: TriviaReveal | null;
  triviaWrong: { teamId: string; answer: string } | null;
  teamAId: string;
  teamBId: string;
  teamAName: string;
  teamBName: string;
  teamAColor: string;
  teamBColor: string;
}

export default function TriviaBoard({
  trivia,
  isParticipant,
  myTeamId,
  onBuzz,
  onAnswer,
  triviaReveal,
  triviaWrong,
  teamAId,
  teamBId: _teamBId,
  teamAName,
  teamBName,
  teamAColor,
  teamBColor,
}: Props) {
  const { phase, question, buzzedTeamId, passingToTeamId, pointsOnOffer, timeLeft } = trivia;

  const buzzedTeamName = buzzedTeamId === teamAId ? teamAName : teamBName;
  const buzzedTeamColor = buzzedTeamId === teamAId ? teamAColor : teamBColor;
  const passingTeamName = passingToTeamId === teamAId ? teamAName : teamBName;
  const passingTeamColor = passingToTeamId === teamAId ? teamAColor : teamBColor;

  const canBuzz = isParticipant && phase === 'buzzing';
  const canAnswer = isParticipant && (
    (phase === 'answering' && buzzedTeamId === myTeamId) ||
    (phase === 'passing' && passingToTeamId === myTeamId)
  );

  const timerPercent = (() => {
    const max = phase === 'buzzing' ? 20 : phase === 'answering' ? 12 : 8;
    return Math.max(0, (timeLeft / max) * 100);
  })();

  const timerColor = timerPercent > 50 ? '#22c55e' : timerPercent > 25 ? '#f59e0b' : '#ef4444';

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto gap-5 px-4 py-5">

      {/* Progress */}
      <div className="flex items-center gap-3 w-full">
        <span className="text-gray-500 text-xs font-bold tracking-widest uppercase whitespace-nowrap">
          Q {trivia.questionNumber} / {trivia.totalQuestions}
        </span>
        <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-yellow-500 rounded-full transition-all"
            style={{ width: `${(trivia.questionNumber / trivia.totalQuestions) * 100}%` }}
          />
        </div>
        <span className="text-xs font-semibold text-yellow-500/70 bg-gray-800 px-2 py-0.5 rounded-full">
          {question.category}
        </span>
      </div>

      {/* Timer bar */}
      <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${timerPercent}%`, backgroundColor: timerColor }}
        />
      </div>

      {/* Phase status */}
      <div className="text-center">
        {phase === 'buzzing' && (
          <p className="text-yellow-400/80 text-sm font-bold animate-pulse">
            ⚡ First to buzz in wins the right to answer!
          </p>
        )}
        {phase === 'answering' && buzzedTeamId && (
          <p className="font-bold text-sm" style={{ color: buzzedTeamColor }}>
            🎯 {buzzedTeamName} buzzed in — {timeLeft}s to answer
          </p>
        )}
        {phase === 'passing' && passingToTeamId && (
          <p className="font-bold text-sm" style={{ color: passingTeamColor }}>
            ↩ Passed to {passingTeamName} — {timeLeft}s
          </p>
        )}
        {phase === 'reveal' && (
          <p className="text-gray-400 text-sm font-bold">Revealing answer…</p>
        )}
      </div>

      {/* Question card */}
      <div className="w-full bg-gray-900 border border-gray-700 rounded-2xl px-6 py-5 text-center">
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-600 text-xs font-semibold uppercase tracking-wider">{question.category}</span>
          <span className="text-yellow-500 text-xs font-bold bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded-full">
            +{pointsOnOffer} pts
          </span>
        </div>
        <p className="text-white font-bold text-lg sm:text-xl leading-snug">{question.question}</p>
      </div>

      {/* Answer options */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
        {question.options.map((opt, i) => {
          const letter = OPTION_LABELS[i];
          const isCorrect = triviaReveal?.correctAnswer === letter;
          const isWrong = triviaWrong?.answer?.toUpperCase() === letter;

          let optClass = 'bg-gray-800 border-gray-700 text-white hover:border-yellow-500/40';
          if (triviaReveal) {
            optClass = isCorrect
              ? 'bg-green-800/70 border-green-500/60 text-green-200'
              : 'bg-gray-900 border-gray-800 text-gray-600';
          } else if (isWrong) {
            optClass = 'bg-red-900/50 border-red-700/50 text-red-300';
          }

          return (
            <button
              key={letter}
              onClick={() => canAnswer && onAnswer(letter)}
              disabled={!canAnswer || !!triviaReveal}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 text-left transition-all ${optClass} ${canAnswer && !triviaReveal ? 'cursor-pointer hover:scale-[1.02]' : 'cursor-default'}`}
            >
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black shrink-0 ${
                triviaReveal && isCorrect ? 'bg-green-500 text-white' :
                triviaReveal ? 'bg-gray-700 text-gray-500' :
                isWrong ? 'bg-red-700 text-white' :
                canAnswer ? 'bg-yellow-600 text-black' : 'bg-gray-700 text-gray-400'
              }`}>
                {triviaReveal && isCorrect ? '✓' : triviaReveal && !isCorrect ? '' : letter}
              </span>
              <span className="font-medium text-sm sm:text-base">{opt}</span>
            </button>
          );
        })}
      </div>

      {/* Buzz-in button */}
      {canBuzz && !triviaReveal && (
        <button
          onClick={onBuzz}
          className="w-full py-5 rounded-2xl font-black text-xl text-black transition-all hover:scale-105 active:scale-95 shadow-2xl"
          style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 8px 32px rgba(245,158,11,0.5)' }}
        >
          ⚡ BUZZ IN
        </button>
      )}

      {isParticipant && phase === 'buzzing' && !canBuzz && (
        <p className="text-gray-600 text-sm text-center">Waiting for someone to buzz in…</p>
      )}

      {isParticipant && phase === 'answering' && buzzedTeamId !== myTeamId && (
        <p className="text-gray-500 text-sm text-center" style={{ color: buzzedTeamColor }}>
          {buzzedTeamName} is answering…
        </p>
      )}

      {isParticipant && phase === 'passing' && passingToTeamId !== myTeamId && (
        <p className="text-gray-500 text-sm text-center">
          Waiting for <span style={{ color: passingTeamColor }}>{passingTeamName}</span> to answer…
        </p>
      )}

      {!isParticipant && (
        <p className="text-gray-600 text-sm">Spectating</p>
      )}

      {/* Reveal overlay */}
      {triviaReveal && (
        <div className={`w-full max-w-sm mx-auto px-5 py-4 rounded-2xl text-center border ${
          triviaReveal.correctTeamId
            ? 'bg-green-800/60 border-green-600/50'
            : 'bg-gray-800 border-gray-700'
        }`}>
          {triviaReveal.correctTeamId ? (
            <>
              <div className="text-green-300 font-black text-base mb-1">
                ✓ {triviaReveal.correctTeamId === teamAId ? teamAName : teamBName} got it!
              </div>
              <div className="text-white font-bold">{triviaReveal.correctOption}</div>
            </>
          ) : (
            <>
              <div className="text-gray-400 font-bold text-sm mb-1">No one answered correctly</div>
              <div className="text-white font-bold">{triviaReveal.correctOption}</div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
