/**
 * Test Tournament Setup Script
 *
 * Creates a complete test tournament with:
 *   - All 4 teams
 *   - 5 weeks × 2 matches × 2 sessions = 20 sessions
 *   - Small, easy test-specific question pools (different from competition pool)
 *   - All sessions scheduled starting TODAY for immediate testing
 *
 * Run:  node scripts/setup-test-tournament.js
 *
 * IMPORTANT: These question pools are for testing ONLY.
 * They are intentionally separate from the competition pool.
 */

const { PrismaClient } = require('@prisma/client');
const { randomUUID } = require('crypto');

const prisma = new PrismaClient();

// ── Team IDs (auto-detected from DB) ─────────────────────────────────────────

// ── TEST word pool — Hangman / Word Scramble / Word Chain ─────────────────────
// Using short, familiar biblical words. 5 words per session × 4 sessions = 20.
// Drawn from the game's WORD_BANK (engine needs to find them there).

const TEST_WORDS = {
  HANGMAN: [
    // Session 1 (Match A, Round 1)
    ['AMOS', 'RUTH', 'JOEL', 'CANA', 'TITUS'],
    // Session 2 (Match A, Round 2)
    ['LYDIA', 'SILAS', 'BARAK', 'JUDE', 'NAOMI'],
    // Session 3 (Match B, Round 1)
    ['MICAH', 'HOSEA', 'EZRA', 'ESTHER', 'ELISHA'],
    // Session 4 (Match B, Round 2)
    ['MALACHI', 'HAGGAI', 'NAHUM', 'OBADIAH', 'ELIEZER'],
  ],
  WORD_SCRAMBLE: [
    ['AMOS', 'RUTH', 'JOEL', 'CANA', 'TITUS'],
    ['LYDIA', 'SILAS', 'BARAK', 'JUDE', 'NAOMI'],
    ['MICAH', 'HOSEA', 'EZRA', 'ESTHER', 'ELISHA'],
    ['MALACHI', 'HAGGAI', 'NAHUM', 'OBADIAH', 'ELIEZER'],
  ],
  WORD_CHAIN: [
    ['AMOS', 'SILAS', 'HOSEA', 'EZRA', 'NAOMI'],
    ['RUTH', 'HOSEA', 'ABANA', 'NAOMI', 'ISAIAH'],
    ['JOEL', 'LYDIA', 'ADAM', 'DANIEL', 'LEVI'],
    ['CANA', 'ABANA', 'NAOMI', 'ISAIAH', 'AMOS'],
  ],
};

// ── TEST trivia questions ─────────────────────────────────────────────────────
// These are EASY questions for testing only — different subset from competition.
// Using the last questions in the bank (competition uses first ones when randomly drawn).

const TEST_TRIVIA_POOLS = [
  // Session 1 (Match A, Round 1) — 10 easy questions
  ['gn-01', 'gn-02', 'gn-03', 'gn-04', 'gn-05', 'gn-06', 'gn-07', 'gn-08', 'ot-01', 'ot-02'],
  // Session 2 (Match A, Round 2)
  ['ot-03', 'ot-04', 'ot-05', 'ot-06', 'nt-01', 'nt-02', 'nt-03', 'nt-04', 'lj-01', 'lj-02'],
  // Session 3 (Match B, Round 1)
  ['lj-03', 'lj-04', 'lj-05', 'ps-01', 'ps-02', 'ps-03', 'ps-04', 'pr-01', 'pr-02', 'pr-03'],
  // Session 4 (Match B, Round 2)
  ['pr-04', 'bb-01', 'bb-02', 'bb-03', 'bb-04', 'bb-05', 'nt-05', 'nt-06', 'nt-07', 'nt-08'],
];

// ── TEST categories ───────────────────────────────────────────────────────────
// Using 5 specific categories per session (5 rounds). Competition pool uses the other 17.

const TEST_CATEGORY_POOLS = [
  // Session 1 (Match A, Round 1)
  ['fruits-of-spirit', 'armour-of-god', 'beatitudes', 'last-words-of-jesus', 'books-of-moses'],
  // Session 2 (Match A, Round 2)
  ['gifts-of-spirit', 'ten-commandments', 'major-prophets', 'beatitudes', 'rivers-in-bible'],
  // Session 3 (Match B, Round 1)
  ['judges-of-israel', 'mountains-of-bible', 'occupations-in-bible', 'tabernacle-items', 'kings-of-israel'],
  // Session 4 (Match B, Round 2)
  ['twelve-disciples', 'plagues-of-egypt', 'sons-of-jacob', 'women-of-faith', 'parables-of-jesus'],
];

// ── Round-robin schedule ──────────────────────────────────────────────────────
const SCHEDULE = [
  [[0, 1], [2, 3]], // Week 1
  [[0, 2], [1, 3]], // Week 2
  [[0, 3], [1, 2]], // Week 3
  [[0, 1], [2, 3]], // Week 4
  [[0, 2], [1, 3]], // Week 5
];

const GAME_SEQUENCE = [
  'HANGMAN', 'WORD_SCRAMBLE', 'WORD_CHAIN', 'BIBLE_CATEGORIES', 'BIBLE_TRIVIA',
];

async function main() {
  console.log('Setting up test tournament...\n');

  // ── 1. Get all 4 teams ────────────────────────────────────────────────────
  const teams = await prisma.team.findMany({
    select: { id: true, name: true, color: true },
    orderBy: { name: 'asc' },
  });

  if (teams.length < 4) {
    throw new Error(`Need exactly 4 teams, found ${teams.length}. Create the teams first.`);
  }

  const teamIds = teams.slice(0, 4).map(t => t.id);
  console.log('Teams:');
  teams.slice(0, 4).forEach((t, i) => console.log(`  ${i + 1}. ${t.name} (${t.id})`));
  console.log();

  // ── 2. Delete existing test tournament if present ─────────────────────────
  const existing = await prisma.tournament.findFirst({ where: { name: { contains: '[TEST]' } } });
  if (existing) {
    console.log(`Removing existing test tournament: ${existing.id}`);
    await prisma.gameSession.deleteMany({ where: { tournamentId: existing.id } });
    await prisma.tournamentRound.deleteMany({ where: { tournamentId: existing.id } });
    await prisma.tournament.delete({ where: { id: existing.id } });
  }

  // ── 3. Create tournament ──────────────────────────────────────────────────
  const today = new Date();
  today.setHours(10, 0, 0, 0);

  const tournament = await prisma.tournament.create({
    data: {
      id: randomUUID(),
      name: '[TEST] EGC 2026 Tournament — Test Run',
      startDate: today,
    },
  });
  console.log(`✓ Tournament created: ${tournament.id}`);
  console.log(`  Name: ${tournament.name}\n`);

  // ── 4. Create rounds and sessions ─────────────────────────────────────────
  let totalSessions = 0;

  for (let w = 0; w < 5; w++) {
    const gameType = GAME_SEQUENCE[w];
    const weekDate = new Date(today);
    weekDate.setDate(weekDate.getDate() + w * 7);

    const round = await prisma.tournamentRound.create({
      data: {
        id: randomUUID(),
        tournamentId: tournament.id,
        weekNumber: w + 1,
        gameType,
        scheduledDate: weekDate,
      },
    });

    console.log(`Week ${w + 1} — ${gameType}`);
    console.log(`  Scheduled: ${weekDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}`);

    const matchPairs = SCHEDULE[w];
    let poolIdx = 0; // pool index within this game type (0-3)

    for (const [idxA, idxB] of matchPairs) {
      const teamA = teams[idxA];
      const teamB = teams[idxB];
      console.log(`  Match: ${teamA.name} vs ${teamB.name}`);

      for (let roundNum = 1; roundNum <= 2; roundNum++) {
        // Build pool for this session
        let pool = null;
        if (gameType === 'HANGMAN' || gameType === 'WORD_SCRAMBLE' || gameType === 'WORD_CHAIN') {
          pool = { words: TEST_WORDS[gameType][poolIdx] ?? TEST_WORDS[gameType][0] };
        } else if (gameType === 'BIBLE_TRIVIA') {
          pool = { questionIds: TEST_TRIVIA_POOLS[poolIdx] ?? TEST_TRIVIA_POOLS[0] };
        } else if (gameType === 'BIBLE_CATEGORIES') {
          pool = { categoryIds: TEST_CATEGORY_POOLS[poolIdx] ?? TEST_CATEGORY_POOLS[0] };
        }

        const sessionDate = new Date(weekDate);
        sessionDate.setHours(sessionDate.getHours() + (roundNum - 1) * 2);

        await prisma.gameSession.create({
          data: {
            id: randomUUID(),
            gameType,
            teamAId: teamA.id,
            teamBId: teamB.id,
            scheduledAt: sessionDate,
            tournamentId: tournament.id,
            tournamentRoundId: round.id,
            roundNumber: roundNum,
            poolAssignment: pool,
          },
        });

        console.log(`    Round ${roundNum} session created. Pool: ${JSON.stringify(pool)}`);
        totalSessions++;
        poolIdx++;
      }
    }
    console.log();
  }

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log('════════════════════════════════════════');
  console.log('✓ Test tournament ready!');
  console.log(`  Tournament ID: ${tournament.id}`);
  console.log(`  ${totalSessions} sessions created`);
  console.log();
  console.log('Next steps:');
  console.log('  1. Go to /admin/games to see all 20 test sessions');
  console.log('  2. Add players to each session\'s roster');
  console.log('  3. Click "Manage →" on any session, then "Start Game"');
  console.log('  4. Play through rounds to test point accumulation');
  console.log('  5. Go to /leaderboard to see live scores update');
  console.log('════════════════════════════════════════\n');
}

main()
  .catch(err => { console.error('Setup failed:', err); process.exit(1); })
  .finally(() => prisma.$disconnect());
