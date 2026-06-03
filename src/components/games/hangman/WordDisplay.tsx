'use client';

interface Props {
  maskedWord: string;
  category: string;
  hint?: string;
}

export default function WordDisplay({ maskedWord, category, hint }: Props) {
  // maskedWord is space-separated: "_ A _ _ _"
  const letters = maskedWord.split(' ');

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Category & hint */}
      <div className="text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-gray-500 bg-gray-800 px-3 py-1 rounded-full">
          {category}
        </span>
        {hint && (
          <p className="text-gray-400 text-sm mt-2 italic">&ldquo;{hint}&rdquo;</p>
        )}
      </div>

      {/* Letter slots */}
      <div className="flex flex-wrap justify-center gap-2 max-w-xl">
        {letters.map((ch, i) => (
          <div
            key={i}
            className={`w-9 h-12 flex items-end justify-center pb-1 border-b-2 ${
              ch === '_'
                ? 'border-gray-500 text-transparent'
                : 'border-green-500 text-green-300'
            }`}
          >
            <span className="text-2xl font-bold font-mono tracking-widest">
              {ch === '_' ? '' : ch}
            </span>
          </div>
        ))}
      </div>

      <p className="text-gray-600 text-sm">
        {letters.length} letters
      </p>
    </div>
  );
}
