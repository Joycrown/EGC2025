/**
 * Pool Assignment Utility
 *
 * When a tournament is created (or extended with more weeks), each GameSession
 * receives a pre-assigned pool of words/questions. Pools never overlap with
 * other sessions of the same game type in the tournament, including sessions
 * that were created earlier, so content does not repeat across the competition.
 *
 * Pool structure stored in GameSession.poolAssignment (Json):
 *   { words: string[] }          — Hangman, Word Scramble, Word Chain
 *   { questionIds: string[] }    — Bible Trivia
 *   { categoryIds: string[] }    — Bible Categories
 *
 * The content banks are imported straight from the socket server, which is what
 * actually plays the games. A pool can therefore only ever contain words and IDs
 * the game engine knows about. (These used to be hand-copied lists that drifted
 * out of sync.)
 *
 * Deploy note: the socket server must be deployed with the same banks before
 * pools generated here are played, otherwise it won't recognise new entries.
 */

import { WORD_BANK, TEST_WORD_BANK_WORDS } from '../../../socket-server/src/games/hangman';
import { TRIVIA_QUESTIONS } from '../../../socket-server/src/games/bibleTrivia';
import { BIBLE_CATEGORIES } from '../../../socket-server/src/games/bibleCategories';
import { TOURNAMENT_GAME_SEQUENCE, type TournamentGameType } from './schedule';

export {
  TOURNAMENT_GAME_SEQUENCE,
  isTournamentGameType,
  getWeekPairings,
  getRoundRobinSchedule,
} from './schedule';
export type { TournamentGameType } from './schedule';

// How much content one match consumes. Kept identical for every week so that
// matches stay comparable on the leaderboard.
export const ITEMS_PER_SESSION: Record<TournamentGameType, number> = {
  HANGMAN: 40,
  WORD_SCRAMBLE: 40,
  WORD_CHAIN: 10,
  BIBLE_TRIVIA: 10,
  BIBLE_CATEGORIES: 5,
};

// Tournament word bank: every socket-server word of 4+ letters, minus the test
// words (ADAM, BOAZ, DAVID, …) so test sessions and real sessions never share words.
const MIN_TOURNAMENT_WORD_LENGTH = 4;
export const HANGMAN_WORD_BANK: string[] = Array.from(
  new Set(
    WORD_BANK.map(e => e.word).filter(
      w => w.length >= MIN_TOURNAMENT_WORD_LENGTH && !TEST_WORD_BANK_WORDS.includes(w)
    )
  )
);

export const TRIVIA_QUESTION_IDS: string[] = TRIVIA_QUESTIONS.map(q => q.id);

export const CATEGORY_IDS: string[] = BIBLE_CATEGORIES.map(c => c.id);

function bankFor(gameType: TournamentGameType): string[] {
  switch (gameType) {
    case 'BIBLE_TRIVIA': return TRIVIA_QUESTION_IDS;
    case 'BIBLE_CATEGORIES': return CATEGORY_IDS;
    default: return HANGMAN_WORD_BANK;
  }
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export interface SessionPool {
  words?: string[];       // Hangman, Scramble, Chain
  questionIds?: string[]; // Trivia
  categoryIds?: string[]; // Categories
}

/** Content already assigned in a tournament, keyed by game type. */
export type UsedContent = Partial<Record<string, Set<string>>>;

/**
 * Collects every word / question / category already assigned to sessions in a
 * tournament, per game type. Test-mode sessions are ignored.
 */
export function collectUsedContent(
  sessions: { gameType: string; poolAssignment: unknown }[]
): UsedContent {
  const used: UsedContent = {};
  for (const s of sessions) {
    const pool = s.poolAssignment as (SessionPool & { testMode?: boolean }) | null;
    if (!pool || pool.testMode) continue;
    const items = pool.words ?? pool.questionIds ?? pool.categoryIds ?? [];
    const set = used[s.gameType] ?? new Set<string>();
    items.forEach(item => set.add(item));
    used[s.gameType] = set;
  }
  return used;
}

/**
 * Draws `count` pools of `perSession` items from `bank`.
 * Order of preference: items never used in this tournament, then previously
 * used items (oldest repeat is better than a repeat inside the same batch).
 * Only if the whole bank is smaller than what's needed do items repeat across
 * the new sessions.
 */
export function drawPools(
  bank: string[],
  used: Set<string> | undefined,
  count: number,
  perSession: number
): string[][] {
  const fresh = shuffle(bank.filter(item => !used?.has(item)));
  const reused = shuffle(bank.filter(item => used?.has(item)));
  let sequence = fresh.concat(reused);
  while (sequence.length < count * perSession && bank.length > 0) {
    sequence = sequence.concat(shuffle(bank));
  }
  return Array.from({ length: count }, (_, i) =>
    sequence.slice(i * perSession, (i + 1) * perSession)
  );
}

/**
 * Generates pools for new sessions of each game type in a tournament.
 *
 * sessionCountPerGameType: how many new sessions need a pool for each game type
 *   e.g. { HANGMAN: 2, WORD_SCRAMBLE: 2 }
 * used: content already assigned to existing sessions (see collectUsedContent),
 *   so new pools avoid repeating it.
 *
 * Returns a map of gameType → array of pools (one per session, in order)
 */
export function generateTournamentPools(
  sessionCountPerGameType: Record<string, number>,
  used: UsedContent = {}
): Record<string, SessionPool[]> {
  const result: Record<string, SessionPool[]> = {};

  for (const gameType of TOURNAMENT_GAME_SEQUENCE) {
    const count = sessionCountPerGameType[gameType] ?? 0;
    if (count === 0) continue;

    const pools = drawPools(bankFor(gameType), used[gameType], count, ITEMS_PER_SESSION[gameType]);
    result[gameType] = pools.map(items =>
      gameType === 'BIBLE_TRIVIA' ? { questionIds: items }
        : gameType === 'BIBLE_CATEGORIES' ? { categoryIds: items }
          : { words: items }
    );
  }

  return result;
}
