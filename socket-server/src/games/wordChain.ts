import { WORD_BANK } from './hangman';

// Index Bible words by first letter — used only to pick a safe STARTING letter
const WORD_INDEX = new Map<string, true>();
WORD_BANK.forEach(e => WORD_INDEX.set(e.word[0].toUpperCase(), true));

// Pick a random letter that has at least one Bible word starting with it.
// Used once at game start so the first required letter is always achievable.
export function pickSafeLetter(): string {
  const letters = Array.from(WORD_INDEX.keys());
  return letters[Math.floor(Math.random() * letters.length)];
}

// After a word is accepted the next required letter is simply the last letter
// of that word — no bank check needed because any valid English word is accepted.
export function nextRequiredLetter(word: string): string {
  return word[word.length - 1].toUpperCase();
}
