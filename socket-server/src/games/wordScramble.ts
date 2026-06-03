import { pickRandomWord, WordEntry } from './hangman';
import { ScrambleClientState } from '../types';

export { pickRandomWord };
export type { WordEntry };

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
