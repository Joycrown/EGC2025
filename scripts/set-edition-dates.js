/**
 * Sets the start/end dates of a conference edition.
 *
 * The admin attendance page builds its day tabs (Day 1–3) from these dates,
 * so they must match the real conference days.
 *
 * Run:
 *   node scripts/set-edition-dates.js <year> <start YYYY-MM-DD> <end YYYY-MM-DD>
 *
 * Example (EGC 2026 moved to December):
 *   node scripts/set-edition-dates.js 2026 2026-12-11 2026-12-13
 *
 * Uses DATABASE_URL. To update production, run it with DATABASE_URL pointing
 * at the production database. Only the given edition's two date fields change.
 * Safe to re-run.
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

async function main() {
  const [yearArg, start, end] = process.argv.slice(2);
  const year = Number(yearArg);

  if (!Number.isInteger(year) || !DATE_RE.test(start ?? '') || !DATE_RE.test(end ?? '')) {
    console.error('Usage: node scripts/set-edition-dates.js <year> <start YYYY-MM-DD> <end YYYY-MM-DD>');
    process.exit(1);
  }
  if (end < start) {
    console.error('End date must be on or after the start date.');
    process.exit(1);
  }

  const edition = await prisma.conferenceEdition.findUnique({ where: { year } });
  if (!edition) {
    console.error(`No conference edition found for ${year}.`);
    process.exit(1);
  }

  const updated = await prisma.conferenceEdition.update({
    where: { year },
    data: {
      startDate: new Date(`${start}T00:00:00.000Z`),
      endDate: new Date(`${end}T23:59:59.000Z`),
    },
  });

  const fmt = d => d.toISOString().slice(0, 10);
  console.log(`${updated.name}: ${fmt(edition.startDate)} → ${fmt(edition.endDate)}  is now  ${fmt(updated.startDate)} → ${fmt(updated.endDate)}`);
}

main()
  .catch(err => { console.error(err); process.exit(1); })
  .finally(() => prisma.$disconnect());
