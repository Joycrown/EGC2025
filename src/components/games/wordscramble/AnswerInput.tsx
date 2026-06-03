'use client';

import { useState, useRef, useEffect } from 'react';

interface Props {
  onSubmit: (answer: string) => void;
  cooldownSeconds: number;
  disabled?: boolean;
}

export default function AnswerInput({ onSubmit, cooldownSeconds, disabled }: Props) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const isCooling = cooldownSeconds > 0;
  const isDisabled = disabled || isCooling;

  useEffect(() => {
    if (!isCooling && !disabled) {
      inputRef.current?.focus();
    }
  }, [isCooling, disabled]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim() || isDisabled) return;
    onSubmit(value.trim().toUpperCase());
    setValue('');
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 w-full max-w-md mx-auto">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={e => setValue(e.target.value.toUpperCase())}
        placeholder={isCooling ? `Wait ${cooldownSeconds}s…` : 'Type your answer…'}
        disabled={isDisabled}
        autoComplete="off"
        spellCheck={false}
        maxLength={40}
        className={`flex-1 px-4 py-3 rounded-xl text-lg font-bold tracking-widest text-center border-2 outline-none transition-colors
          ${isCooling
            ? 'bg-gray-800 border-red-700 text-red-400 cursor-not-allowed'
            : 'bg-gray-800 border-gray-600 text-white focus:border-yellow-500'
          }`}
      />
      <button
        type="submit"
        disabled={isDisabled || !value.trim()}
        className="px-6 py-3 rounded-xl font-bold text-lg bg-yellow-600 hover:bg-yellow-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {isCooling ? `${cooldownSeconds}s` : 'Submit'}
      </button>
    </form>
  );
}
