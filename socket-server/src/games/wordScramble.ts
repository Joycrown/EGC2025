import { pickRandomWord, WordEntry, WORD_BANK } from './hangman';
import { ScrambleClientState } from '../types';

export { pickRandomWord };
export type { WordEntry };

// 70 % hard (9+ letters), 30 % medium (6–8 letters) — easy words never shown
export function pickWordWithDifficulty(usedWords: string[] = []): WordEntry {
  const available = WORD_BANK.filter(w => !usedWords.includes(w.word));
  const pool = available.length > 0 ? available : WORD_BANK;

  const hard   = pool.filter(w => w.word.length >= 9);
  const medium = pool.filter(w => w.word.length >= 6 && w.word.length < 9);

  let tier: WordEntry[];
  if (Math.random() < 0.7 && hard.length > 0) {
    tier = hard;
  } else if (medium.length > 0) {
    tier = medium;
  } else {
    tier = hard.length > 0 ? hard : pool; // fallback if medium pool exhausted
  }

  return tier[Math.floor(Math.random() * tier.length)];
}

// Fisher-Yates shuffle, ensures result !== original
export function scrambleWord(word: string): string {
  const letters = word.split('');
  let result = word;
  let attempts = 0;

  while (result === word && attempts < 20) {
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    result = letters.join('');
    attempts++;
  }

  // For very short words (2 letters) where shuffle always = original, reverse instead
  if (result === word && word.length > 1) {
    result = word.split('').reverse().join('');
  }

  return result;
}

export function toScrambleClientState(
  scrambledWord: string,
  category: string,
  hint: string,
  wordNumber: number,
  totalWords: number,
  wordSolved: boolean,
): ScrambleClientState {
  return { scrambledWord, category, hint, wordNumber, totalWords, wordSolved };
}

export function isCorrectAnswer(answer: string, word: string): boolean {
  return answer.trim().toUpperCase() === word.toUpperCase();
}
