'use client';

interface Props {
  wrongCount: number;
}

export default function HangmanFigure({ wrongCount }: Props) {
  return (
    <svg viewBox="0 0 200 250" width="160" height="200" className="select-none">
      {/* Gallows */}
      <line x1="20" y1="230" x2="180" y2="230" stroke="#6b7280" strokeWidth="3" strokeLinecap="round" />
      <line x1="60" y1="230" x2="60" y2="20" stroke="#6b7280" strokeWidth="3" strokeLinecap="round" />
      <line x1="60" y1="20" x2="130" y2="20" stroke="#6b7280" strokeWidth="3" strokeLinecap="round" />
      <line x1="130" y1="20" x2="130" y2="50" stroke="#6b7280" strokeWidth="3" strokeLinecap="round" />

      {/* Head */}
      {wrongCount >= 1 && (
        <circle cx="130" cy="70" r="20" stroke="#ef4444" strokeWidth="2.5" fill="none" />
      )}
      {/* Body */}
      {wrongCount >= 2 && (
        <line x1="130" y1="90" x2="130" y2="160" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
      )}
      {/* Left arm */}
      {wrongCount >= 3 && (
        <line x1="130" y1="110" x2="100" y2="140" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
      )}
      {/* Right arm */}
      {wrongCount >= 4 && (
        <line x1="130" y1="110" x2="160" y2="140" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
      )}
      {/* Left leg */}
      {wrongCount >= 5 && (
        <line x1="130" y1="160" x2="100" y2="200" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
      )}
      {/* Right leg */}
      {wrongCount >= 6 && (
        <line x1="130" y1="160" x2="160" y2="200" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
      )}
    </svg>
  );
}
