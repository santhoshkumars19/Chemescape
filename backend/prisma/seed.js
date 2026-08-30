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

  // ── 2. STANDARDS (4th to 12th) ──────────────────────────────────────────
  const standardsData = [
    { grade: 4, name: '4', displayName: '4th Standard', description: 'Primary School 4th Standard Curriculum', displayOrder: 1 },
    { grade: 5, name: '5', displayName: '5th Standard', description: 'Primary School 5th Standard Curriculum', displayOrder: 2 },
    { grade: 6, name: '6', displayName: '6th Standard', description: 'Middle School 6th Standard Curriculum', displayOrder: 3 },
    { grade: 7, name: '7', displayName: '7th Standard', description: 'Middle School 7th Standard Curriculum', displayOrder: 4 },
    { grade: 8, name: '8', displayName: '8th Standard', description: 'Middle School 8th Standard Curriculum', displayOrder: 5 },
    { grade: 9, name: '9', displayName: '9th Standard', description: 'Secondary School 9th Standard Curriculum', displayOrder: 6 },
    { grade: 10, name: '10', displayName: '10th Standard', description: 'Secondary School 10th Standard Curriculum', displayOrder: 7 },
    { grade: 11, name: '11', displayName: '11th Standard', description: 'Higher Secondary 11th Standard Curriculum', displayOrder: 8 },
    { grade: 12, name: '12', displayName: '12th Standard', description: 'Higher Secondary 12th Standard Curriculum', displayOrder: 9 },
  ];

  const seededStandards = {};
  for (const std of standardsData) {
    const record = await prisma.standard.upsert({
      where: { name: std.name },
      update: {
        grade: std.grade,
        displayName: std.displayName,
        description: std.description,
        displayOrder: std.displayOrder,
        isActive: true,
      },
      create: {
        grade: std.grade,
        name: std.name,
        displayName: std.displayName,
        description: std.description,
        displayOrder: std.displayOrder,
        isActive: true,
      },
    });
    seededStandards[std.name] = record;
  }

  const std11 = seededStandards['11'];
  const std12 = seededStandards['12'];
  console.log(' ✔ Standards seeded: 4th through 12th Standards (9 standards total)');

  // ── 3. SUBJECTS ───────────────────────────────────────────────────────────
  const subjectsData = [
    { name: 'Tamil', code: 'TAMIL', description: 'Tamil Language and Literature', icon: '📚', displayOrder: 1 },
    { name: 'English', code: 'ENG', description: 'English Language and Grammar', icon: '📖', displayOrder: 2 },
    { name: 'Mathematics', code: 'MATH', description: 'Mathematics and Problem Solving', icon: '📐', displayOrder: 3 },
    { name: 'Science', code: 'SCI', description: 'General Science, Physics, Chemistry, Biology', icon: '🔬', displayOrder: 4 },
    { name: 'Social Science', code: 'SOCIAL', description: 'History, Geography, Civics, Economics', icon: '🌍', displayOrder: 5 },
    { name: 'Physics', code: 'PHY', description: 'Higher Secondary Mechanics, Electromagnetism, Optics', icon: '⚡', displayOrder: 1 },
    { name: 'Chemistry', code: 'CHEM', description: 'Higher Secondary Chemistry, Stoichiometry, Organic, Inorganic', icon: '🧪', displayOrder: 2 },
    { name: 'Biology', code: 'BIO', description: 'Higher Secondary Botany and Zoology', icon: '🧬', displayOrder: 4 },
    { name: 'Computer Science', code: 'CS', description: 'Higher Secondary Programming, Data Structures, Python', icon: '💻', displayOrder: 5 },
  ];

  const seededSubjects = {};
  for (const s of subjectsData) {
    const record = await prisma.subject.upsert({
      where: { code: s.code },
      update: {
        name: s.name,
        description: s.description,
        icon: s.icon,
        displayOrder: s.displayOrder,
        isActive: true,
      },
      create: {
        name: s.name,
        code: s.code,
        description: s.description,
        icon: s.icon,
        displayOrder: s.displayOrder,
        isActive: true,
      },
    });
    seededSubjects[s.code] = record;
  }
  const chemSubject = seededSubjects['CHEM'];
  console.log(' ✔ Subjects seeded: 9 core subjects (Tamil, English, Math, Science, Social, Physics, Chem, Bio, CS)');

  // ── 4. STANDARD-SUBJECT RELATIONS ───────────────────────────────────────
  const standardSubjectMap = {
    '4': ['TAMIL', 'ENG', 'MATH', 'SCI', 'SOCIAL'],
    '5': ['TAMIL', 'ENG', 'MATH', 'SCI', 'SOCIAL'],
    '6': ['TAMIL', 'ENG', 'MATH', 'SCI', 'SOCIAL'],
    '7': ['TAMIL', 'ENG', 'MATH', 'SCI', 'SOCIAL'],
    '8': ['TAMIL', 'ENG', 'MATH', 'SCI', 'SOCIAL'],
    '9': ['TAMIL', 'ENG', 'MATH', 'SCI', 'SOCIAL'],
    '10': ['TAMIL', 'ENG', 'MATH', 'SCI', 'SOCIAL'],
    '11': ['PHY', 'CHEM', 'MATH', 'BIO', 'CS'],
    '12': ['PHY', 'CHEM', 'MATH', 'BIO', 'CS'],
  };

  for (const [gradeStr, subjectCodes] of Object.entries(standardSubjectMap)) {
    const std = seededStandards[gradeStr];
    if (!std) continue;

    for (let i = 0; i < subjectCodes.length; i++) {
      const code = subjectCodes[i];
      const subj = seededSubjects[code];
      if (!subj) continue;

      await prisma.standardSubject.upsert({
        where: {
          standardId_subjectId: {
            standardId: std.id,
            subjectId: subj.id,
          },
        },
        update: {
          displayOrder: i + 1,
        },
        create: {
          standardId: std.id,
          subjectId: subj.id,
          displayOrder: i + 1,
        },
      });
    }
  }
  console.log(' ✔ StandardSubject mappings seeded for Standards 4 through 12');

  // ── 5. CHAPTERS ───────────────────────────────────────────────────────────
  // A. Standard 11 Chemistry (Existing Chapter)
  const periodicChapter = await prisma.chapter.upsert({
    where: {
      standardId_subjectId_chapterNumber: {
        standardId: std11.id,
        subjectId: chemSubject.id,
        chapterNumber: 3,
      },
    },
    update: {
      isActive: true,
      displayOrder: 3,
    },
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
      isActive: true,
      displayOrder: 3,
    },
  });
  console.log(' ✔ Chapter seeded: 11th Chemistry - Periodic Table (Chapter 3)');

  // B. Standard 4 Mathematics (Demonstration Chapters)
  const std4 = seededStandards['4'];
  const mathSubject = seededSubjects['MATH'];
  if (std4 && mathSubject) {
    const mathChapters = [
      { chapterNumber: 1, title: 'Numbers & Counting', description: 'Foundational numbers, place values, and operations.', difficulty: 'EASY', estimatedMinutes: 20, xpReward: 100, coinReward: 25, badgeName: 'Number Pioneer', isLocked: false, displayOrder: 1 },
      { chapterNumber: 2, title: 'Fractions & Decimals', description: 'Parts of a whole, fraction operations, and decimals.', difficulty: 'EASY', estimatedMinutes: 25, xpReward: 150, coinReward: 35, badgeName: 'Fraction Master', isLocked: true, displayOrder: 2 },
      { chapterNumber: 3, title: 'Basic Shapes & Geometry', description: 'Geometric 2D/3D shapes, perimeters, and angles.', difficulty: 'MEDIUM', estimatedMinutes: 30, xpReward: 200, coinReward: 50, badgeName: 'Shape Explorer', isLocked: true, displayOrder: 3 },
    ];

    for (const mc of mathChapters) {
      await prisma.chapter.upsert({
        where: {
          standardId_subjectId_chapterNumber: {
            standardId: std4.id,
            subjectId: mathSubject.id,
            chapterNumber: mc.chapterNumber,
          },
        },
        update: {
          title: mc.title,
          description: mc.description,
          difficulty: mc.difficulty,
          estimatedMinutes: mc.estimatedMinutes,
          xpReward: mc.xpReward,
          coinReward: mc.coinReward,
          badgeName: mc.badgeName,
          displayOrder: mc.displayOrder,
          isActive: true,
        },
        create: {
          standardId: std4.id,
          subjectId: mathSubject.id,
          chapterNumber: mc.chapterNumber,
          title: mc.title,
          description: mc.description,
          difficulty: mc.difficulty,
          estimatedMinutes: mc.estimatedMinutes,
          xpReward: mc.xpReward,
          coinReward: mc.coinReward,
          badgeName: mc.badgeName,
          isLocked: mc.isLocked,
          isActive: true,
          displayOrder: mc.displayOrder,
        },
      });
    }
    console.log(' ✔ Chapters seeded: Standard 4 Mathematics (3 demonstration chapters)');
  }

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
      update: { title: t.title, description: t.description, isActive: true },
      create: {
        chapterId: periodicChapter.id,
        title: t.title,
        description: t.description,
        orderNumber: t.orderNumber,
        isActive: true,
      },
    });
    topicsMap[t.orderNumber] = topic;
  }
  console.log(' ✔ Topics seeded: 11th Chemistry Chapter 3 (6 core topics)');

  // B. Topics for Standard 4 Math Chapter 2 (Fractions)
  if (std4 && mathSubject) {
    const ch2Fractions = await prisma.chapter.findFirst({
      where: { standardId: std4.id, subjectId: mathSubject.id, chapterNumber: 2 },
    });

    if (ch2Fractions) {
      const mathTopics = [
        { orderNumber: 1, title: 'Basic Fractions', description: 'Introduction to numerators and denominators.' },
        { orderNumber: 2, title: 'Equivalent Fractions', description: 'Finding equivalent fractions by multiplying or dividing.' },
        { orderNumber: 3, title: 'Comparing Fractions', description: 'Comparing like and unlike fractions using visual models.' },
      ];

      for (const mt of mathTopics) {
        await prisma.topic.upsert({
          where: {
            chapterId_orderNumber: {
              chapterId: ch2Fractions.id,
              orderNumber: mt.orderNumber,
            },
          },
          update: { title: mt.title, description: mt.description, isActive: true },
          create: {
            chapterId: ch2Fractions.id,
            title: mt.title,
            description: mt.description,
            orderNumber: mt.orderNumber,
            isActive: true,
          },
        });
      }
      console.log(' ✔ Topics seeded: Standard 4 Math Chapter 2 (3 demonstration topics)');
    }
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
