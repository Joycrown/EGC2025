/**
 * Tournament schedule rules shared by the API and the admin UI.
 * Kept free of heavy imports so it can be used in client components.
 */

// Game types that have a working engine on the socket server, in tournament order.
export const TOURNAMENT_GAME_SEQUENCE = [
  'HANGMAN',
  'WORD_SCRAMBLE',
  'WORD_CHAIN',
  'BIBLE_CATEGORIES',
  'BIBLE_TRIVIA',
] as const;
export type TournamentGameType = typeof TOURNAMENT_GAME_SEQUENCE[number];

export function isTournamentGameType(value: unknown): value is TournamentGameType {
  return typeof value === 'string' && (TOURNAMENT_GAME_SEQUENCE as readonly string[]).includes(value);
}

/** Game the sequence would naturally give a week (1-based): week 6 → Hangman again, etc. */
export function defaultGameForWeek(weekNumber: number): TournamentGameType {
  return TOURNAMENT_GAME_SEQUENCE[(weekNumber - 1) % TOURNAMENT_GAME_SEQUENCE.length];
}

/**
 * Team pairings for 4 teams. Indices 0-3 map to the order the teams were
 * chosen when the tournament was created (week 1: match 1 = 0 v 1, match 2 = 2 v 3).
 * The three pairings rotate, so every 3 weeks each team has played every other
 * team once: weeks 1-3, 4-6, 7-9, …
 */
const PAIRING_CYCLE: [number, number][][] = [
  [[0, 1], [2, 3]], // A vs B | C vs D
  [[0, 2], [1, 3]], // A vs C | B vs D
  [[0, 3], [1, 2]], // A vs D | B vs C
];

export function getWeekPairings(weekNumber: number): [number, number][] {
  return PAIRING_CYCLE[(weekNumber - 1) % PAIRING_CYCLE.length];
}

/** Pairings for weeks 1..weeks (default 5, the original tournament length). */
export function getRoundRobinSchedule(weeks = 5): [number, number][][] {
  return Array.from({ length: weeks }, (_, i) => getWeekPairings(i + 1));
}
