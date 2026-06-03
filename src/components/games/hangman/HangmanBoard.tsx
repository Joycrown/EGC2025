'use client';

import { HangmanClientState } from '@/hooks/useGameSocket';
import HangmanFigure from './HangmanFigure';
import WordDisplay from './WordDisplay';
import LetterKeyboard from './LetterKeyboard';

interface Props {
  hangman: HangmanClientState;
  isInteractive: boolean;
  onGuess: (letter: string) => void;
}

export default function HangmanBoard({ hangman, isInteractive, onGuess }: Props) {
  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl">
      {/* Round indicator */}
      <div className="flex items-center gap-2">
        {Array.from({ length: hangman.totalRounds }, (_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full ${
              i < hangman.roundNumber - 1
                ? 'bg-gray-600'
                : i === hangman.roundNumber - 1
                ? 'bg-white'
                : 'bg-gray-800 border border-gray-700'
            }`}
          />
        ))}
        <span className="text-gray-400 text-xs ml-1">Round {hangman.roundNumber}/{hangman.totalRounds}</span>
      </div>

      {/* Figure + word side by side on larger screens */}
      <div className="flex flex-col sm:flex-row items-center gap-8 w-full justify-center">
        {/* Gallows & figure */}
        <div className="shrink-0">
          <HangmanFigure wrongCount={hangman.wrongCount} />
          <p className="text-center text-xs text-gray-500 mt-1">
            {hangman.wrongCount}/{hangman.maxWrong} wrong
          </p>
        </div>

        {/* Word display */}
        <div className="flex-1 flex justify-center">
          <WordDisplay
            maskedWord={hangman.maskedWord}
            category={hangman.category}
            hint={hangman.hint}
          />
        </div>
      </div>

      {/* Wrong letters */}
      {hangman.wrongLetters.length > 0 && (
        <div className="flex flex-wrap gap-1.5 justify-center">
          <span className="text-gray-500 text-xs mr-1">Wrong:</span>
          {hangman.wrongLetters.map(l => (
            <span key={l} className="text-red-400 font-mono font-bold text-sm line-through">
              {l}
            </span>
          ))}
        </div>
      )}

      {/* Letter keyboard */}
      <LetterKeyboard
        guessedLetters={hangman.guessedLetters}
        wrongLetters={hangman.wrongLetters}
        isInteractive={isInteractive}
        onGuess={onGuess}
      />
    </div>
  );
}
