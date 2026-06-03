'use client';

interface Props {
  scrambledWord: string;
  animation: 'idle' | 'correct' | 'wrong' | 'timeout';
}

const TILE_COLORS = [
  'bg-red-700',
  'bg-orange-600',
  'bg-yellow-600',
  'bg-green-700',
  'bg-teal-700',
  'bg-blue-700',
  'bg-indigo-700',
  'bg-purple-700',
];

export default function ScrambledWord({ scrambledWord, animation }: Props) {
  const letters = scrambledWord.split('');

  const tileBase = 'flex items-center justify-center rounded-lg font-black text-white select-none transition-all duration-300';
  const tileSize = letters.length > 10
    ? 'w-8 h-10 text-base'
    : letters.length > 7
    ? 'w-10 h-12 text-lg'
    : 'w-12 h-14 text-xl';

  const animClass =
    animation === 'correct' ? 'scale-110 brightness-125' :
    animation === 'wrong' ? 'animate-bounce brightness-75' :
    animation === 'timeout' ? 'opacity-40 grayscale' :
    '';

  return (
    <div className="flex flex-wrap justify-center gap-2 my-6" aria-label="Scrambled word">
      {letters.map((letter, i) => (
        <div
          key={i}
          className={`${tileBase} ${tileSize} ${TILE_COLORS[i % TILE_COLORS.length]} ${animClass}`}
        >
          {letter}
        </div>
      ))}
    </div>
  );
}
