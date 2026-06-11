import { WORD_BANK } from './hangman';

const BIBLE_WORD_SET = new Set(WORD_BANK.map(e => e.word.toUpperCase()));

// Module-level cache — persists for the lifetime of the server process.
// Key: uppercased word. Value: whether the dictionary API accepted it.
const apiCache = new Map<string, boolean>();

export function isBibleWord(word: string): boolean {
  return BIBLE_WORD_SET.has(word.toUpperCase());
}

export async function validateWord(
  word: string
): Promise<{ valid: boolean; isBibleWord: boolean }> {
  const upper = word.toUpperCase();

  // 1. Bible bank — instant, no network
  if (BIBLE_WORD_SET.has(upper)) return { valid: true, isBibleWord: true };

  // 2. Previously validated non-Bible words
  if (apiCache.has(upper)) return { valid: apiCache.get(upper)!, isBibleWord: false };

  // 3. Free Dictionary API (no key needed)
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.toLowerCase())}`,
      { signal: controller.signal }
    );
    clearTimeout(timer);
    const valid = res.ok; // 200 = real word, 404 = not found
    apiCache.set(upper, valid);
    return { valid, isBibleWord: false };
  } catch {
    // Timeout or network failure — reject to be safe
    return { valid: false, isBibleWord: false };
  }
}
