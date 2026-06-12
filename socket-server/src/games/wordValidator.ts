import { WORD_BANK } from './hangman';

// Bible proper-nouns and key terms — awards bonus points in Word Chain
const BIBLE_WORD_SET = new Set(WORD_BANK.map(e => e.word.toUpperCase()));

// ~275,000 common English words, loaded once at startup — no API needed
import englishWords from 'an-array-of-english-words';
const ENGLISH_WORD_SET = new Set(englishWords.map(w => w.toUpperCase()));

export function isBibleWord(word: string): boolean {
  return BIBLE_WORD_SET.has(word.toUpperCase());
}

export async function validateWord(
  word: string
): Promise<{ valid: boolean; isBibleWord: boolean }> {
  const upper = word.toUpperCase();

  // 1. Bible bank — instant, awards Bible bonus points
  if (BIBLE_WORD_SET.has(upper)) return { valid: true, isBibleWord: true };

  // 2. Local English dictionary — instant, no network, survives server restarts
  if (ENGLISH_WORD_SET.has(upper)) return { valid: true, isBibleWord: false };

  return { valid: false, isBibleWord: false };
}
