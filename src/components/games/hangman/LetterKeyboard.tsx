'use client';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

interface Props {
  guessedLetters: string[];
  wrongLetters: string[];
  isInteractive: boolean;
  onGuess: (letter: string) => void;
}

export default function LetterKeyboard({ guessedLetters, wrongLetters, isInteractive, onGuess }: Props) {
  function getState(letter: string): 'correct' | 'wrong' | 'unused' {
    if (wrongLetters.includes(letter)) return 'wrong';
    if (guessedLetters.includes(letter) && !wrongLetters.includes(letter)) return 'correct';
    return 'unused';
  }

  const stateClasses = {
    correct: 'bg-green-700 text-white border-green-600 cursor-not-allowed opacity-80',
    wrong: 'bg-red-900 text-red-400 border-red-800 cursor-not-allowed opacity-60 line-through',
    unused: isInteractive
      ? 'bg-gray-700 hover:bg-gray-600 text-white border-gray-600 cursor-pointer hover:scale-105 active:scale-95'
      : 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed opacity-50',
  };

  return (
    <div className="w-full max-w-md">
      {!isInteractive && (
        <p className="text-center text-gray-500 text-sm mb-3 italic">
          Waiting for your team&apos;s turn…
        </p>
      )}
      <div className="flex flex-wrap justify-center gap-1.5">
        {ALPHABET.map(letter => {
          const state = getState(letter);
          return (
            <button
              key={letter}
              onClick={() => isInteractive && state === 'unused' && onGuess(letter)}
              disabled={state !== 'unused' || !isInteractive}
              className={`w-9 h-10 rounded-lg border text-sm font-bold transition-all duration-100 select-none ${stateClasses[state]}`}
              aria-label={`Guess letter ${letter}`}
            >
              {letter}
            </button>
          );
        })}
      </div>
    </div>
  );
}
