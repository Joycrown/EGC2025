'use client';

import { useState, useRef, useEffect } from 'react';

interface Props {
  requiredLetter: string;
  onSubmit: (word: string) => void;
  disabled?: boolean;
  invalidReason: string | null;
  disabledWords?: string[];  // already-tried words shown in red prefix
}

export default function ChainInput({ requiredLetter, onSubmit, disabled, invalidReason, disabledWords = [] }: Props) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const upper = value.toUpperCase();
  const isWrongLetter = upper.length > 0 && upper[0] !== requiredLetter;
  const isAlreadyTried = disabledWords.includes(upper);
  const hasError = isWrongLetter || isAlreadyTried;

  useEffect(() => {
    if (!disabled) inputRef.current?.focus();
  }, [disabled]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!upper.trim() || disabled || hasError) return;
    onSubmit(upper.trim());
    setValue('');
  }

  const borderColor = isWrongLetter
    ? 'border-red-600'
    : isAlreadyTried
    ? 'border-orange-600'
    : 'border-gray-600 focus-within:border-yellow-500';

  const errorMsg = isWrongLetter
    ? `Must start with ${requiredLetter}`
    : isAlreadyTried
    ? `Already tried "${upper}" this turn`
    : invalidReason ?? null;

  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-2">
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={e => setValue(e.target.value.toUpperCase())}
          placeholder={`Type a ${requiredLetter}… word`}
          disabled={disabled}
          autoComplete="off"
          spellCheck={false}
          maxLength={30}
          className={`flex-1 px-4 py-3 rounded-xl text-lg font-bold tracking-widest text-center border-2 outline-none transition-colors bg-gray-800 text-white ${borderColor} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        />
        <button
          type="submit"
          disabled={disabled || !upper.trim() || hasError}
          className="px-6 py-3 rounded-xl font-bold text-lg bg-yellow-600 hover:bg-yellow-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Guess
        </button>
      </form>

      {errorMsg ? (
        <p className="text-red-400 text-xs text-center animate-pulse">{errorMsg}</p>
      ) : (
        <p className="text-gray-600 text-xs text-center">
          Guess the biblical word starting with <strong className="text-yellow-600">{requiredLetter}</strong>
        </p>
      )}
    </div>
  );
}
