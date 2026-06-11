/**
 * Test seed script — creates teams + test accounts for local game testing.
 * Run: node scripts/seed-test.js
 */

const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');

const prisma = new PrismaClient();

const TEAMS = [
  { name: 'Bethel', color: '#eab308' },
  { name: 'Judah',  color: '#e53e3e' },
  { name: 'Salem',  color: '#3b82f6' },
  { name: 'Shiloh', color: '#8b5cf6' },
];

// Test accounts — password is "Test1234!" for all
const TEST_PASSWORD = 'Test1234!';

async function main() {
  const passwordHash = await hash(TEST_PASSWORD, 10);

  // 1. Upsert teams
  console.log('Seeding teams...');
  const teams = {};
  for (const t of TEAMS) {
    const team = await prisma.team.upsert({
      where: { name: t.name },
      update: { color: t.color },
      create: { name: t.name, color: t.color },
    });
    teams[t.name] = team;
    console.log(`  Team ${team.name}: ${team.id}`);
  }

  // Base user fields (required by schema)
  const baseUser = (id, email, fullName, phone, birthMonth, userType, role, teamId) => ({
    id,
    email,
    password: passwordHash,
    fullName,
    phoneNumber: phone,
    birthMonth,
    gender: 'Male',
    userType,
    role,
    isVerified: true,
    teamId,
    updatedAt: new Date(),
  });

  // 2. Upsert super-admin
  console.log('\nSeeding admin account...');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@egc.test' },
    update: { userType: 'SUPER_ADMIN', role: 'ADMIN', isVerified: true },
    create: baseUser('TEST-ADMIN-001', 'admin@egc.test', 'Test Admin', '08000000001', 1, 'SUPER_ADMIN', 'ADMIN', teams['Bethel'].id),
  });
  console.log(`  Admin: ${admin.email}`);

  // 3. Create 5 participants for Team Bethel
  console.log('\nSeeding Team Bethel players...');
  for (let i = 1; i <= 5; i++) {
    const u = await prisma.user.upsert({
      where: { email: `bethel${i}@egc.test` },
      update: {},
      create: baseUser(`TEST-BETHEL-00${i}`, `bethel${i}@egc.test`, `Bethel Player ${i}`, `0800000010${i}`, 1, 'USER', 'PARTICIPANT', teams['Bethel'].id),
    });
    console.log(`  ${u.fullName}: ${u.email}`);
  }

  // 4. Create 5 participants for Team Judah
  console.log('\nSeeding Team Judah players...');
  for (let i = 1; i <= 5; i++) {
    const u = await prisma.user.upsert({
      where: { email: `judah${i}@egc.test` },
      update: {},
      create: baseUser(`TEST-JUDAH-00${i}`, `judah${i}@egc.test`, `Judah Player ${i}`, `0800000020${i}`, 5, 'USER', 'PARTICIPANT', teams['Judah'].id),
    });
    console.log(`  ${u.fullName}: ${u.email}`);
  }

  // 5. Create 5 participants for Team Shiloh
  console.log('\nSeeding Team Shiloh players...');
  for (let i = 1; i <= 5; i++) {
    const u = await prisma.user.upsert({
      where: { email: `shiloh${i}@egc.test` },
      update: {},
      create: baseUser(`TEST-SHILOH-00${i}`, `shiloh${i}@egc.test`, `Shiloh Player ${i}`, `0800000030${i}`, 8, 'USER', 'PARTICIPANT', teams['Shiloh'].id),
    });
    console.log(`  ${u.fullName}: ${u.email}`);
  }

  console.log('\n✅ Seed complete!');
  console.log('\nTest accounts (password: Test1234!):');
  console.log('  admin@egc.test       — SUPER_ADMIN');
  console.log('  bethel1@egc.test     — Bethel Player 1');
  console.log('  bethel2@egc.test     — Bethel Player 2 (etc. up to bethel5)');
  console.log('  judah1@egc.test      — Judah Player 1');
  console.log('  judah2@egc.test      — Judah Player 2 (etc. up to judah5)');
  console.log('  shiloh1@egc.test     — Shiloh Player 1');
  console.log('  shiloh2@egc.test     — Shiloh Player 2 (etc. up to shiloh5)');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
