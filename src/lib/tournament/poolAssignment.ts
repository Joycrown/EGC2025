/**
 * Pool Assignment Utility
 *
 * When a tournament is created, each GameSession receives a pre-assigned,
 * non-overlapping pool of words/questions. This guarantees zero repeats
 * across all sessions of the same game type in the tournament.
 *
 * Pool structure stored in GameSession.poolAssignment (Json):
 *   { words: string[] }          — Hangman, Word Scramble, Word Chain
 *   { questionIds: string[] }    — Bible Trivia
 *   { categoryIds: string[] }    — Bible Categories
 */

// ── Hangman / Word Scramble word bank (imported here via fetch at build time) ─
// The actual word list lives in the socket-server. We store word strings directly.

export const HANGMAN_WORD_BANK = [
  // Prophets
  'ISAIAH','JEREMIAH','EZEKIEL','DANIEL','ELIJAH','ELISHA','AMOS','HOSEA','MICAH','MALACHI',
  'NAHUM','HABAKKUK','ZEPHANIAH','HAGGAI','ZECHARIAH','OBADIAH','JONAH','JOEL',
  // Places
  'JERUSALEM','BETHLEHEM','NAZARETH','JERICHO','GALILEE','GETHSEMANE','CALVARY','SINAI',
  'BETHANY','CAPERNAUM','ANTIOCH','CORINTH','EPHESUS','BABYLON','NINEVEH','EGYPT',
  'SAMARIA','CAESAREA','DAMASCUS','CANA','BETHSAIDA','EMMAUS',
  // People
  'MOSES','ABRAHAM','SOLOMON','JOSEPH','JOSHUA','NEHEMIAH','ESTHER','RUTH','DEBORAH','GIDEON',
  'SAMSON','PETER','PAUL','JOHN','JAMES','ANDREW','MARY','MARTHA','LAZARUS','ZACCHAEUS',
  'BARTHOLOMEW','MATTHEW','THOMAS','CORNELIUS','LYDIA','PRISCILLA','AQUILA','BARNABAS',
  'TIMOTHY','TITUS','PHILEMON','STEPHEN','PHILIP','SILAS',
  // Concepts
  'SALVATION','REDEMPTION','COVENANT','BAPTISM','RESURRECTION','SANCTIFICATION','COMMUNION',
  'ATONEMENT','RECONCILIATION','JUSTIFICATION','PROPITIATION','INTERCESSION','CONSECRATION',
  'REPENTANCE','FORGIVENESS','RIGHTEOUSNESS','HOLINESS','FAITHFULNESS',
  // Events
  'EXODUS','CRUCIFIXION','PENTECOST','TRANSFIGURATION','ASCENSION','ANNUNCIATION',
  'CREATION','FLOOD','PASSOVER','RAPTURE','TRIBULATION',
  // Books
  'GENESIS','LEVITICUS','DEUTERONOMY','PROVERBS','ECCLESIASTES','REVELATION','PHILIPPIANS',
  'COLOSSIANS','THESSALONIANS','PHILEMON','HEBREWS','GALATIANS','EPHESIANS',
  // Additional
  'KORAH','KETURAH','YAHWEH','WISDOM','AHAB','JEZEBEL','ELIEZER','REBEKAH',
];

export const TRIVIA_QUESTION_IDS = [
  'ot-01','ot-02','ot-03','ot-04','ot-05','ot-06','ot-07','ot-08','ot-09','ot-10',
  'nt-01','nt-02','nt-03','nt-04','nt-05','nt-06','nt-07','nt-08','nt-09','nt-10',
  'bb-01','bb-02','bb-03','bb-04','bb-05',
  'lj-01','lj-02','lj-03','lj-04','lj-05',
  'ps-01','ps-02','ps-03','ps-04',
  'pr-01','pr-02','pr-03','pr-04',
  'gn-01','gn-02','gn-03','gn-04','gn-05','gn-06','gn-07','gn-08',
];

export const CATEGORY_IDS = [
  'fruits-of-spirit','armour-of-god','twelve-disciples','plagues-of-egypt',
  'books-of-paul','miracles-of-jesus','sons-of-jacob','women-of-faith',
  'names-of-god','parables-of-jesus','ten-commandments','gifts-of-spirit',
  'judges-of-israel','mountains-of-bible','beatitudes','occupations-in-bible',
  'rivers-in-bible','last-words-of-jesus','major-prophets','books-of-moses',
  'kings-of-israel','tabernacle-items',
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function splitIntoChunks<T>(arr: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    chunks.push(arr.slice(i, i + chunkSize));
  }
  return chunks;
}

export interface SessionPool {
  words?: string[];       // Hangman, Scramble, Chain
  questionIds?: string[]; // Trivia
  categoryIds?: string[]; // Categories
}

/**
 * Generates non-overlapping pools for all sessions of each game type in a tournament.
 *
 * sessionCountPerGameType: how many sessions need a pool for each game type
 *   e.g. { HANGMAN: 4, WORD_SCRAMBLE: 4, WORD_CHAIN: 4, BIBLE_CATEGORIES: 4, BIBLE_TRIVIA: 4 }
 *
 * Returns a map of gameType → array of pools (one per session, in order)
 */
export function generateTournamentPools(sessionCountPerGameType: Record<string, number>): Record<string, SessionPool[]> {
  const result: Record<string, SessionPool[]> = {};

  // Word-based games: Hangman, Word Scramble, Word Chain
  for (const gameType of ['HANGMAN', 'WORD_SCRAMBLE', 'WORD_CHAIN']) {
    const count = sessionCountPerGameType[gameType] ?? 0;
    if (count === 0) continue;

    const WORDS_PER_SESSION = gameType === 'WORD_CHAIN' ? 10 : 8; // words per session
    const needed = count * WORDS_PER_SESSION;
    const shuffled = shuffle(HANGMAN_WORD_BANK).slice(0, Math.min(needed, HANGMAN_WORD_BANK.length));
    const chunks = splitIntoChunks(shuffled, WORDS_PER_SESSION);

    // Pad if bank ran short
    while (chunks.length < count) chunks.push(shuffle(HANGMAN_WORD_BANK).slice(0, WORDS_PER_SESSION));

    result[gameType] = chunks.slice(0, count).map(words => ({ words }));
  }

  // Bible Trivia
  const triviaCount = sessionCountPerGameType['BIBLE_TRIVIA'] ?? 0;
  if (triviaCount > 0) {
    const QUESTIONS_PER_SESSION = 10;
    const shuffled = shuffle(TRIVIA_QUESTION_IDS);
    const chunks = splitIntoChunks(shuffled, QUESTIONS_PER_SESSION);
    while (chunks.length < triviaCount) chunks.push(shuffle(TRIVIA_QUESTION_IDS).slice(0, QUESTIONS_PER_SESSION));
    result['BIBLE_TRIVIA'] = chunks.slice(0, triviaCount).map(ids => ({ questionIds: ids }));
  }

  // Bible Categories
  const catCount = sessionCountPerGameType['BIBLE_CATEGORIES'] ?? 0;
  if (catCount > 0) {
    const CATS_PER_SESSION = 5;
    const shuffled = shuffle(CATEGORY_IDS);
    const chunks = splitIntoChunks(shuffled, CATS_PER_SESSION);
    while (chunks.length < catCount) chunks.push(shuffle(CATEGORY_IDS).slice(0, CATS_PER_SESSION));
    result['BIBLE_CATEGORIES'] = chunks.slice(0, catCount).map(ids => ({ categoryIds: ids }));
  }

  return result;
}

/**
 * Returns the round-robin match schedule for 4 teams across 5 rounds.
 * Returns pairs of [teamIndex_A, teamIndex_B] for each round.
 * Teams indices 0-3 map to the teams array passed in.
 */
export function getRoundRobinSchedule(): [number, number][][] {
  // Rounds 1-3: all unique matchups. Rounds 4-5: rematches (different games).
  return [
    [[0, 1], [2, 3]], // Round 1: A vs B | C vs D
    [[0, 2], [1, 3]], // Round 2: A vs C | B vs D
    [[0, 3], [1, 2]], // Round 3: A vs D | B vs C
    [[0, 1], [2, 3]], // Round 4: A vs B | C vs D  (rematch, different game)
    [[0, 2], [1, 3]], // Round 5: A vs C | B vs D  (rematch, different game)
  ];
}
