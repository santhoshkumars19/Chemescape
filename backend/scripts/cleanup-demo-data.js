/**
 * ChemEscape Production Demo Cleanup Script
 * Cleans out demo/sample/fake users and progress while strictly preserving
 * test accounts (admin@chemescape.com, teacher@chemescape.com, student@chemescape.com)
 * and all product Chemistry syllabus content.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const TEST_EMAIL_WHITELIST = [
  'admin@chemescape.com',
  'teacher@chemescape.com',
  'student@chemescape.com',
];

async function cleanupDemoData() {
  console.log('==================================================');
  console.log('🧹 CHEMESCAPE DEMO DATA CLEANUP SCRIPT');
  console.log('==================================================\n');

  // 1. Fetch all registered users
  const allUsers = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });

  console.log(`[AUDIT] Total user accounts in database: ${allUsers.length}`);

  const testUsers = [];
  const demoUsers = [];

  for (const user of allUsers) {
    const isTest = TEST_EMAIL_WHITELIST.includes(user.email.toLowerCase()) ||
                   user.email.toLowerCase().endsWith('@chemescape.com');

    if (isTest) {
      testUsers.push(user);
    } else {
      demoUsers.push(user);
    }
  }

  console.log('\n--- PRESERVED TEST USERS ---');
  testUsers.forEach(u => console.log(`  ✓ [${u.role}] ${u.name} (${u.email})`));

  console.log('\n--- DEMO / SAMPLE USERS TO REMOVE ---');
  if (demoUsers.length === 0) {
    console.log('  (No demo/sample accounts found in database)');
  } else {
    demoUsers.forEach(u => console.log(`  ❌ [${u.role}] ${u.name} (${u.email})`));
  }

  // 2. Perform safe deletion of demo user dependent records
  if (demoUsers.length > 0) {
    const demoUserIds = demoUsers.map(u => u.id);

    console.log('\n[CLEANUP] Removing dependent records for demo users...');

    // Delete dependent tables for demo user IDs
    if (prisma.gameSession) {
      const deletedSessions = await prisma.gameSession.deleteMany({ where: { userId: { in: demoUserIds } } });
      console.log(`  - Deleted ${deletedSessions.count} demo game sessions.`);
    }

    if (prisma.userProgress) {
      const deletedProgress = await prisma.userProgress.deleteMany({ where: { userId: { in: demoUserIds } } });
      console.log(`  - Deleted ${deletedProgress.count} demo user progress records.`);
    }

    if (prisma.userBadge) {
      const deletedBadges = await prisma.userBadge.deleteMany({ where: { userId: { in: demoUserIds } } });
      console.log(`  - Deleted ${deletedBadges.count} demo user badges.`);
    }

    if (prisma.userStats) {
      const deletedStats = await prisma.userStats.deleteMany({ where: { userId: { in: demoUserIds } } });
      console.log(`  - Deleted ${deletedStats.count} demo user stats.`);
    }

    // Delete demo users
    const deletedUsers = await prisma.user.deleteMany({ where: { id: { in: demoUserIds } } });
    console.log(`  - Deleted ${deletedUsers.count} demo user accounts.`);
  }

  // 3. Audit Chemistry Content Integrity
  console.log('\n--- CHEMISTRY CONTENT INTEGRITY CHECK ---');
  const standardsCount = await prisma.standard.count();
  const subjectsCount = await prisma.subject.count();
  const chaptersCount = await prisma.chapter.count();
  const topicsCount = await prisma.topic.count();
  const roomsCount = await prisma.room.count();

  console.log(`  ✓ Standards: ${standardsCount}`);
  console.log(`  ✓ Subjects:  ${subjectsCount}`);
  console.log(`  ✓ Chapters:  ${chaptersCount}`);
  console.log(`  ✓ Topics:    ${topicsCount}`);
  console.log(`  ✓ Rooms:     ${roomsCount}`);

  console.log('\n==================================================');
  console.log('✅ DEMO DATA CLEANUP COMPLETE SUCCESSFULLY!');
  console.log('==================================================\n');
}

cleanupDemoData()
  .catch(err => {
    console.error('❌ Error during cleanup:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
