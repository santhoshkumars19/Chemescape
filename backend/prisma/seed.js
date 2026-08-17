const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('[SEED] Seeding ChemEscape database with Game Engine Infrastructure...');

  // ── 1. USERS ─────────────────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash('Password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@chemescape.com' },
    update: {},
    create: {
      name: 'System Admin',
      email: 'admin@chemescape.com',
      password: hashedPassword,
      role: 'ADMIN',
      avatar: '⚡',
    },
  });

  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@chemescape.com' },
    update: {},
    create: {
      name: 'Prof. Marie Curie',
      email: 'teacher@chemescape.com',
      password: hashedPassword,
      role: 'TEACHER',
      avatar: '🔬',
    },
  });

  const student = await prisma.user.upsert({
    where: { email: 'student@chemescape.com' },
    update: {},
    create: {
      name: 'Alex Vance',
      email: 'student@chemescape.com',
      password: hashedPassword,
      role: 'STUDENT',
      avatar: '🧪',
    },
  });
  console.log(' ✔ Users seeded: Admin, Teacher, Student');

  // Initialize UserStats for Student
  await prisma.userStats.upsert({
    where: { userId: student.id },
    update: {},
    create: {
      userId: student.id,
      totalXP: 0,
      totalCoins: 0,
      currentLevel: 1,
      currentStreak: 1,
    },
  });

  // ── 2. STANDARDS ──────────────────────────────────────────────────────────
  const std11 = await prisma.standard.upsert({
    where: { name: '11' },
    update: {},
    create: { name: '11', displayName: '11th Standard' },
  });

  const std12 = await prisma.standard.upsert({
    where: { name: '12' },
    update: {},
    create: { name: '12', displayName: '12th Standard' },
  });
  console.log(' ✔ Standards seeded: 11th Standard, 12th Standard');

  // ── 3. SUBJECTS ───────────────────────────────────────────────────────────
  const chemSubject = await prisma.subject.upsert({
    where: { code: 'CHEM' },
    update: {},
    create: {
      name: 'Chemistry',
      code: 'CHEM',
      description: 'Higher secondary Chemistry learning content and escape rooms',
      icon: '🧪',
    },
  });
  console.log(' ✔ Subject seeded: Chemistry (CHEM)');

  // ── 4. STANDARD-SUBJECT RELATIONS ───────────────────────────────────────
  await prisma.standardSubject.upsert({
    where: {
      standardId_subjectId: {
        standardId: std11.id,
        subjectId: chemSubject.id,
      },
    },
    update: {},
    create: {
      standardId: std11.id,
      subjectId: chemSubject.id,
    },
  });

  await prisma.standardSubject.upsert({
    where: {
      standardId_subjectId: {
        standardId: std12.id,
        subjectId: chemSubject.id,
      },
    },
    update: {},
    create: {
      standardId: std12.id,
      subjectId: chemSubject.id,
    },
  });

  // ── 5. CHAPTER: PERIODIC TABLE (11th Chemistry) ───────────────────────────
  const periodicChapter = await prisma.chapter.upsert({
    where: {
      standardId_subjectId_chapterNumber: {
        standardId: std11.id,
        subjectId: chemSubject.id,
        chapterNumber: 3,
      },
    },
    update: {},
    create: {
      standardId: std11.id,
      subjectId: chemSubject.id,
      chapterNumber: 3,
      title: 'Periodic Table',
      description: 'Explore periodic classification, groups, periods, and atomic structure.',
      difficulty: 'MEDIUM',
      estimatedMinutes: 25,
      xpReward: 500,
      coinReward: 100,
      badgeName: 'Periodic Master',
      isLocked: false,
    },
  });
  console.log(' ✔ Chapter seeded: Periodic Table (Chapter 3)');

  // ── 6. TOPICS FOR PERIODIC TABLE CHAPTER ─────────────────────────────────
  const topicsData = [
    { title: 'Modern Periodic Law', description: 'Properties of elements are periodic functions of their atomic numbers.', orderNumber: 1 },
    { title: 'Groups and Periods', description: 'Vertical columns (groups) and horizontal rows (periods) in the table.', orderNumber: 2 },
    { title: 'Periodic Trends', description: 'Atomic size, ionization enthalpy, and electronegativity variations.', orderNumber: 3 },
    { title: 'Atomic Radius', description: 'Distance from the nucleus to the outermost electron shell.', orderNumber: 4 },
    { title: 'Ionization Energy', description: 'Energy required to remove an electron from an isolated gaseous atom.', orderNumber: 5 },
    { title: 'Electron Configuration', description: 'Distribution of electrons in shells and subshells (s, p, d, f).', orderNumber: 6 },
  ];

  const topicsMap = {};
  for (const t of topicsData) {
    const topic = await prisma.topic.upsert({
      where: {
        chapterId_orderNumber: {
          chapterId: periodicChapter.id,
          orderNumber: t.orderNumber,
        },
      },
      update: { title: t.title, description: t.description },
      create: {
        chapterId: periodicChapter.id,
        title: t.title,
        description: t.description,
        orderNumber: t.orderNumber,
      },
    });
    topicsMap[t.orderNumber] = topic;
  }

  // ── 7. ROOMS & GAME ENGINE CONFIGURATIONS ────────────────────────────────
  const room1 = await prisma.room.upsert({
    where: { chapterId_roomNumber: { chapterId: periodicChapter.id, roomNumber: 1 } },
    update: {
      gameType: 'GRID_RECONSTRUCTION',
      gameConfig: {
        timeLimit: 300,
        maxLives: 3,
        mechanics: ['atomic_number', 'group_matching', 'period_matching'],
      },
    },
    create: {
      chapterId: periodicChapter.id,
      roomNumber: 1,
      name: 'Find the Missing Element',
      description: 'Identify the element using its atomic number and periodic position.',
      roomType: 'PUZZLE',
      gameType: 'GRID_RECONSTRUCTION',
      gameConfig: {
        timeLimit: 300,
        maxLives: 3,
        mechanics: ['atomic_number', 'group_matching', 'period_matching'],
      },
      orderNumber: 1,
    },
  });

  const room2 = await prisma.room.upsert({
    where: { chapterId_roomNumber: { chapterId: periodicChapter.id, roomNumber: 2 } },
    update: {
      gameType: 'GRID_RECONSTRUCTION',
      gameConfig: {
        timeLimit: 360,
        maxLives: 3,
        mechanics: ['trend_comparison', 'block_categorization'],
      },
    },
    create: {
      chapterId: periodicChapter.id,
      roomNumber: 2,
      name: 'Restore the Periodic Wall',
      description: 'Match elements with their correct groups and categories.',
      roomType: 'PUZZLE',
      gameType: 'GRID_RECONSTRUCTION',
      gameConfig: {
        timeLimit: 360,
        maxLives: 3,
        mechanics: ['trend_comparison', 'block_categorization'],
      },
      orderNumber: 2,
    },
  });

  const room3 = await prisma.room.upsert({
    where: { chapterId_roomNumber: { chapterId: periodicChapter.id, roomNumber: 3 } },
    update: {
      gameType: 'QUANTUM_ARCHITECT',
      gameConfig: {
        timeLimit: 420,
        maxLives: 3,
        mechanics: ['electron_configuration', 'orbital_filling'],
      },
    },
    create: {
      chapterId: periodicChapter.id,
      roomNumber: 3,
      name: 'Repair the Laboratory Computer',
      description: 'Solve electron configuration and orbital filling puzzles.',
      roomType: 'CHALLENGE',
      gameType: 'QUANTUM_ARCHITECT',
      gameConfig: {
        timeLimit: 420,
        maxLives: 3,
        mechanics: ['electron_configuration', 'orbital_filling'],
      },
      orderNumber: 3,
    },
  });

  const room4 = await prisma.room.upsert({
    where: { chapterId_roomNumber: { chapterId: periodicChapter.id, roomNumber: 4 } },
    update: {
      gameType: 'CALCULATION_HEIST',
      gameConfig: {
        timeLimit: 300,
        maxLives: 3,
        mechanics: ['boss_battle', 'mixed_challenge'],
      },
    },
    create: {
      chapterId: periodicChapter.id,
      roomNumber: 4,
      name: 'Final Security Challenge',
      description: 'Complete mixed Chemistry challenges before the security timer expires.',
      roomType: 'BOSS',
      gameType: 'CALCULATION_HEIST',
      gameConfig: {
        timeLimit: 300,
        maxLives: 3,
        mechanics: ['boss_battle', 'mixed_challenge'],
      },
      orderNumber: 4,
    },
  });

  // ── 8. GAME REWARDS SEEDING ──────────────────────────────────────────────
  await prisma.gameReward.upsert({
    where: { roomId: room1.id },
    update: {},
    create: {
      roomId: room1.id,
      xp: 500,
      coins: 100,
      badgeName: 'Periodic Pioneer',
      badgeDescription: 'Discovered missing elements in Room 1',
      badgeIcon: '🧩',
    },
  });

  await prisma.gameReward.upsert({
    where: { roomId: room2.id },
    update: {},
    create: {
      roomId: room2.id,
      xp: 600,
      coins: 120,
      badgeName: 'Wall Restorer',
      badgeDescription: 'Restored the Periodic Wall in Room 2',
      badgeIcon: '🧱',
    },
  });

  await prisma.gameReward.upsert({
    where: { roomId: room3.id },
    update: {},
    create: {
      roomId: room3.id,
      xp: 750,
      coins: 150,
      badgeName: 'Quantum Engineer',
      badgeDescription: 'Repaired the Lab Computer in Room 3',
      badgeIcon: '💻',
    },
  });

  await prisma.gameReward.upsert({
    where: { roomId: room4.id },
    update: {},
    create: {
      roomId: room4.id,
      xp: 1000,
      coins: 200,
      badgeName: 'Periodic Master',
      badgeDescription: 'Mastered the Periodic Table Escape Chapter',
      badgeIcon: '👑',
    },
  });

  // ── 9. CHAPTER 6: GASEOUS STATE & GAS SIMULATOR ROOM ─────────────────────
  const gasChapter = await prisma.chapter.upsert({
    where: {
      standardId_subjectId_chapterNumber: {
        standardId: std11.id,
        subjectId: chemSubject.id,
        chapterNumber: 6,
      },
    },
    update: {},
    create: {
      standardId: std11.id,
      subjectId: chemSubject.id,
      chapterNumber: 6,
      title: 'Gaseous State',
      description: 'Master kinetic molecular theory, gas laws, and ideal gas chamber equilibrium.',
      difficulty: 'HARD',
      estimatedMinutes: 30,
      xpReward: 950,
      coinReward: 250,
      badgeName: 'Gas Controller',
      isLocked: false,
    },
  });

  const gasRoom = await prisma.room.upsert({
    where: { chapterId_roomNumber: { chapterId: gasChapter.id, roomNumber: 1 } },
    update: {
      gameType: 'GAS_SIMULATOR',
      gameConfig: {
        timeLimit: 480,
        maxLives: 3,
        mechanics: ['kinetic_theory', 'boyles_law', 'charles_law', 'combined_gas_law', 'ideal_gas'],
      },
    },
    create: {
      chapterId: gasChapter.id,
      roomNumber: 1,
      name: 'Gas Research Chamber',
      description: 'Stabilize gas kinetic state, pressure, volume, and temperature equilibrium.',
      roomType: 'CHALLENGE',
      gameType: 'GAS_SIMULATOR',
      gameConfig: {
        timeLimit: 480,
        maxLives: 3,
        mechanics: ['kinetic_theory', 'boyles_law', 'charles_law', 'combined_gas_law', 'ideal_gas'],
      },
      orderNumber: 1,
    },
  });

  await prisma.gameReward.upsert({
    where: { roomId: gasRoom.id },
    update: {},
    create: {
      roomId: gasRoom.id,
      xp: 950,
      coins: 250,
      badgeName: 'Gas Controller',
      badgeDescription: 'Stabilized the Gas Chamber in Unit 6',
      badgeIcon: '💨',
    },
  });
  console.log(' ✔ Game Engine & Reward configurations seeded for Rooms 1-4 & Gas Simulator');

  console.log('\n[SEED] Game Engine Infrastructure Seeding Complete!');
}

main()
  .catch((e) => {
    console.error('[SEED] Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
