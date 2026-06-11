// One-shot script: delete all tournaments and their sessions/rounds
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Delete in dependency order (sessions → rounds → tournaments)
  const sessions = await prisma.gameSession.deleteMany({});
  console.log(`Deleted ${sessions.count} game sessions`);

  const rounds = await prisma.tournamentRound.deleteMany({});
  console.log(`Deleted ${rounds.count} tournament rounds`);

  const tournaments = await prisma.tournament.deleteMany({});
  console.log(`Deleted ${tournaments.count} tournaments`);

  console.log('Done — DB is clean.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
