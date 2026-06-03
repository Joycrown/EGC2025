/**
 * Backfill script — run ONCE against production after deploying the ConferenceEdition migration.
 *
 * What it does:
 *  1. Creates the EGC 2025 edition (the historical data)
 *  2. Creates the EGC 2026 edition (this year, set as active)
 *  3. Assigns all existing Attendance / GameSession / ConferenceEvent rows to 2025
 *  4. Creates ConferenceRegistration records for every 2025 participant
 *
 * Run:
 *   node scripts/backfill-editions.js
 *
 * Safe to re-run — all upserts, no destructive operations.
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting EGC conference edition backfill...\n');

  // ── 1. Create editions ─────────────────────────────────────────────────

  const edition2025 = await prisma.conferenceEdition.upsert({
    where: { year: 2025 },
    update: { isActive: false },
    create: {
      year: 2025,
      name: 'EGC 2025',
      startDate: new Date('2025-07-11T00:00:00.000Z'),
      endDate: new Date('2025-07-13T23:59:59.000Z'),
      isActive: false,
    },
  });
  console.log(`✓ EGC 2025 edition: ${edition2025.id}`);

  const edition2026 = await prisma.conferenceEdition.upsert({
    where: { year: 2026 },
    update: { isActive: true },
    create: {
      year: 2026,
      name: 'EGC 2026',
      startDate: new Date('2026-07-11T00:00:00.000Z'),
      endDate: new Date('2026-07-13T23:59:59.000Z'),
      isActive: true,
    },
  });
  console.log(`✓ EGC 2026 edition (active): ${edition2026.id}\n`);

  // Ensure only 2026 is active
  await prisma.conferenceEdition.updateMany({
    where: { year: { not: 2026 } },
    data: { isActive: false },
  });

  // ── 2. Backfill Attendance ─────────────────────────────────────────────

  const attendanceResult = await prisma.attendance.updateMany({
    where: { editionId: null },
    data: { editionId: edition2025.id },
  });
  console.log(`✓ Backfilled ${attendanceResult.count} attendance records → EGC 2025`);

  // ── 3. Backfill GameSessions ───────────────────────────────────────────

  const sessionResult = await prisma.gameSession.updateMany({
    where: { editionId: null },
    data: { editionId: edition2025.id },
  });
  console.log(`✓ Backfilled ${sessionResult.count} game sessions → EGC 2025`);

  // ── 4. Backfill ConferenceEvents ───────────────────────────────────────

  const eventResult = await prisma.conferenceEvent.updateMany({
    where: { editionId: null },
    data: { editionId: edition2025.id },
  });
  console.log(`✓ Backfilled ${eventResult.count} conference events → EGC 2025\n`);

  // ── 5. Create ConferenceRegistration for 2025 participants ─────────────
  //
  // A "2025 participant" is any user who has:
  //   - An attendance record (was physically registered/marked present), OR
  //   - A teamId (was assigned to a team for the competition)

  const users2025 = await prisma.user.findMany({
    where: {
      OR: [
        { attendances: { some: { editionId: edition2025.id } } },
        { teamId: { not: null } },
      ],
    },
    select: { id: true, teamId: true },
  });

  console.log(`Found ${users2025.length} participants from EGC 2025. Creating registrations...`);

  // Find which users already have a registration to skip them
  const existing = await prisma.conferenceRegistration.findMany({
    where: { editionId: edition2025.id },
    select: { userId: true },
  });
  const existingUserIds = new Set(existing.map(r => r.userId));

  const toCreate = users2025.filter(u => !existingUserIds.has(u.id));
  const skipped = users2025.length - toCreate.length;

  // Batch insert using createMany (skipDuplicates for safety)
  const { count: created } = await prisma.conferenceRegistration.createMany({
    data: toCreate.map(u => ({
      userId: u.id,
      editionId: edition2025.id,
      teamId: u.teamId ?? null,
    })),
    skipDuplicates: true,
  });

  console.log(`✓ Created ${created} ConferenceRegistration records for EGC 2025`);
  if (skipped > 0) console.log(`  (${skipped} already existed — skipped)`);

  // ── Summary ────────────────────────────────────────────────────────────

  console.log('\n─────────────────────────────────────────');
  console.log('Backfill complete!');
  console.log('');
  console.log('Next steps:');
  console.log('  1. Stop dev server');
  console.log('  2. npx prisma generate   (regenerate Prisma client)');
  console.log('  3. npx prisma db push    (apply schema to DB)');
  console.log('  4. node scripts/backfill-editions.js  (this script — prod only)');
  console.log('  5. Restart dev server');
  console.log('─────────────────────────────────────────\n');
}

main()
  .catch(err => {
    console.error('Backfill failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
