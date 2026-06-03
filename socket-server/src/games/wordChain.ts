import { WORD_BANK, WordEntry } from './hangman';

// Index words by their first letter for O(1) lookup
const WORD_INDEX = new Map<string, WordEntry[]>();
WORD_BANK.forEach(entry => {
  const letter = entry.word[0];
  if (!WORD_INDEX.has(letter)) WORD_INDEX.set(letter, []);
  WORD_INDEX.get(letter)!.push(entry);
});

// Pick a random unused word that starts with the given letter.
// Returns null if none available.
export function pickWordForLetter(letter: string, usedWords: string[]): WordEntry | null {
  const words = WORD_INDEX.get(letter.toUpperCase()) ?? [];
  const available = words.filter(w => !usedWords.includes(w.word));
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}

// Pick a random starting letter that has at least one unused word available.
export function pickSafeLetter(usedWords: string[], excludeLetter?: string): string {
  const candidates = Array.from(WORD_INDEX.entries())
    .filter(([letter, words]) =>
      letter !== excludeLetter &&
      words.some(w => !usedWords.includes(w.word))
    )
    .map(([letter]) => letter);

  if (candidates.length === 0) return 'A';
  return candidates[Math.floor(Math.random() * candidates.length)];
}

// After a word is solved, determine the next required letter.
// Uses the last letter of the solved word; falls back to a safe letter if none available.
export function nextRequiredLetter(word: string, usedWords: string[]): string {
  const lastLetter = word[word.length - 1].toUpperCase();
  const available = pickWordForLetter(lastLetter, usedWords);
  if (available) return lastLetter;
  return pickSafeLetter(usedWords, lastLetter);
}
