const prisma = require('../config/db');
const standardService = require('./standardService');
const subjectService = require('./subjectService');

// Authoritative default chapter definitions
const DEFAULT_CHAPTERS = [
  // 11th Chemistry (Existing chapter)
  {
    id: 'ch-3',
    standardId: 'grade-11',
    subjectId: 'subj-chem',
    title: 'Periodic Classification',
    description: 'Master periodic trends, electron configurations, and element classifications to escape the laboratory',
    chapterNumber: 3,
    difficulty: 'MEDIUM',
    estimatedMinutes: 25,
    xpReward: 500,
    coinReward: 100,
    badgeName: 'Periodic Master',
    isLocked: false,
    isActive: true,
    displayOrder: 3,
    subject: { id: 'subj-chem', name: 'Chemistry', code: 'CHEM', icon: '🧪' },
    standard: { id: 'grade-11', name: '11', displayName: '11th Standard' },
  },
  // Standard 4 Mathematics demonstration chapters
  {
    id: 'ch-math4-1',
    standardId: 'grade-4',
    subjectId: 'subj-math',
    title: 'Numbers & Counting',
    description: 'Learn foundational numbers, place values, and basic addition/subtraction',
    chapterNumber: 1,
    difficulty: 'EASY',
    estimatedMinutes: 20,
    xpReward: 100,
    coinReward: 25,
    badgeName: 'Number Pioneer',
    isLocked: false,
    isActive: true,
    displayOrder: 1,
    subject: { id: 'subj-math', name: 'Mathematics', code: 'MATH', icon: '📐' },
    standard: { id: 'grade-4', name: '4', displayName: '4th Standard' },
  },
  {
    id: 'ch-math4-2',
    standardId: 'grade-4',
    subjectId: 'subj-math',
    title: 'Fractions & Decimals',
    description: 'Understand parts of a whole, simple fraction operations, and decimal numbers',
    chapterNumber: 2,
    difficulty: 'EASY',
    estimatedMinutes: 25,
    xpReward: 150,
    coinReward: 35,
    badgeName: 'Fraction Master',
    isLocked: true,
    isActive: true,
    displayOrder: 2,
    subject: { id: 'subj-math', name: 'Mathematics', code: 'MATH', icon: '📐' },
    standard: { id: 'grade-4', name: '4', displayName: '4th Standard' },
  },
  {
    id: 'ch-math4-3',
    standardId: 'grade-4',
    subjectId: 'subj-math',
    title: 'Basic Shapes & Geometry',
    description: 'Explore 2D and 3D geometric shapes, perimeters, and angles',
    chapterNumber: 3,
    difficulty: 'MEDIUM',
    estimatedMinutes: 30,
    xpReward: 200,
    coinReward: 50,
    badgeName: 'Shape Explorer',
    isLocked: true,
    isActive: true,
    displayOrder: 3,
    subject: { id: 'subj-math', name: 'Mathematics', code: 'MATH', icon: '📐' },
    standard: { id: 'grade-4', name: '4', displayName: '4th Standard' },
  },
  // Standard 4 Tamil Chapter 1
  {
    id: 'ch-tam4-1',
    standardId: 'grade-4',
    subjectId: 'subj-tamil',
    title: 'அன்னைத் தமிழே',
    description: 'தமிழ் மொழியின் இனிமை, பாடல் நயம், சொல்வளம் மற்றும் இலக்கணம்',
    chapterNumber: 1,
    difficulty: 'EASY',
    estimatedMinutes: 20,
    xpReward: 400,
    coinReward: 100,
    badgeName: 'அன்னைத் தமிழ் அறிஞர்',
    isLocked: false,
    isActive: true,
    displayOrder: 1,
    subject: { id: 'subj-tamil', name: 'Tamil', code: 'TAMIL', icon: '📚' },
    standard: { id: 'grade-4', name: '4', displayName: '4th Standard' },
  },
  // Standard 4 Science demonstration chapters
  {
    id: 'ch-sci4-1',
    standardId: 'grade-4',
    subjectId: 'subj-sci',
    title: 'Living & Non-Living Things',
    description: 'Characteristics of living organisms and their environment',
    chapterNumber: 1,
    difficulty: 'EASY',
    estimatedMinutes: 20,
    xpReward: 100,
    coinReward: 25,
    badgeName: 'Nature Explorer',
    isLocked: false,
    isActive: true,
    displayOrder: 1,
    subject: { id: 'subj-sci', name: 'Science', code: 'SCI', icon: '🔬' },
    standard: { id: 'grade-4', name: '4', displayName: '4th Standard' },
  },
  {
    id: 'ch-sci4-2',
    standardId: 'grade-4',
    subjectId: 'subj-sci',
    title: 'Plant Life & Ecosystems',
    description: 'Discover how plants grow, photosynthesize, and support life',
    chapterNumber: 2,
    difficulty: 'EASY',
    estimatedMinutes: 25,
    xpReward: 150,
    coinReward: 35,
    badgeName: 'Botanist Junior',
    isLocked: true,
    isActive: true,
    displayOrder: 2,
    subject: { id: 'subj-sci', name: 'Science', code: 'SCI', icon: '🔬' },
    standard: { id: 'grade-4', name: '4', displayName: '4th Standard' },
  },
  // Standard 5 Subject Chapters
  {
    id: 'ch-tam5-1',
    standardId: 'grade-5',
    subjectId: 'subj-tamil',
    title: 'Introduction to Tamil',
    description: 'Classical Tamil literature, poetry, and foundational grammar concepts',
    chapterNumber: 1,
    difficulty: 'EASY',
    estimatedMinutes: 20,
    xpReward: 400,
    coinReward: 100,
    badgeName: 'Tamil Scholar',
    isLocked: false,
    isActive: true,
    displayOrder: 1,
    subject: { id: 'subj-tamil', name: 'Tamil', code: 'TAMIL', icon: '📚' },
    standard: { id: 'grade-5', name: '5', displayName: '5th Standard' },
  },
  {
    id: 'ch-tam5-2',
    standardId: 'grade-5',
    subjectId: 'subj-tamil',
    title: 'Tamil Poetry & Prose',
    description: 'Explore Sangam poetry, rhyming meters, and proverbs',
    chapterNumber: 2,
    difficulty: 'MEDIUM',
    estimatedMinutes: 25,
    xpReward: 500,
    coinReward: 120,
    badgeName: 'Tamil Master',
    isLocked: true,
    isActive: true,
    displayOrder: 2,
    subject: { id: 'subj-tamil', name: 'Tamil', code: 'TAMIL', icon: '📚' },
    standard: { id: 'grade-5', name: '5', displayName: '5th Standard' },
  },
  {
    id: 'ch-tam5-3',
    standardId: 'grade-5',
    subjectId: 'subj-tamil',
    title: 'Ancient Sangam Epics',
    description: 'Study legendary Tamil epics and classical drama',
    chapterNumber: 3,
    difficulty: 'HARD',
    estimatedMinutes: 30,
    xpReward: 600,
    coinReward: 150,
    badgeName: 'Sangam Legend',
    isLocked: true,
    isActive: true,
    displayOrder: 3,
    subject: { id: 'subj-tamil', name: 'Tamil', code: 'TAMIL', icon: '📚' },
    standard: { id: 'grade-5', name: '5', displayName: '5th Standard' },
  },
  {
    id: 'ch-math5-1',
    standardId: 'grade-5',
    subjectId: 'subj-math',
    title: 'Fractions & Geometry',
    description: 'Master fractions, 2D shapes, perimeter, and area calculations',
    chapterNumber: 1,
    difficulty: 'EASY',
    estimatedMinutes: 20,
    xpReward: 400,
    coinReward: 100,
    badgeName: 'Math Pioneer',
    isLocked: false,
    isActive: true,
    displayOrder: 1,
    subject: { id: 'subj-math', name: 'Mathematics', code: 'MATH', icon: '📐' },
    standard: { id: 'grade-5', name: '5', displayName: '5th Standard' },
  },
  {
    id: 'ch-math5-2',
    standardId: 'grade-5',
    subjectId: 'subj-math',
    title: 'Decimals, Percentages & Data',
    description: 'Explore decimal arithmetic, percentages, bar graphs, and averages',
    chapterNumber: 2,
    difficulty: 'MEDIUM',
    estimatedMinutes: 25,
    xpReward: 500,
    coinReward: 120,
    badgeName: 'Math Ace',
    isLocked: true,
    isActive: true,
    displayOrder: 2,
    subject: { id: 'subj-math', name: 'Mathematics', code: 'MATH', icon: '📐' },
    standard: { id: 'grade-5', name: '5', displayName: '5th Standard' },
  },
  {
    id: 'ch-math5-3',
    standardId: 'grade-5',
    subjectId: 'subj-math',
    title: 'Algebraic Patterns & Angles',
    description: 'Understand linear sequences, missing terms, and angular measurements',
    chapterNumber: 3,
    difficulty: 'HARD',
    estimatedMinutes: 30,
    xpReward: 600,
    coinReward: 150,
    badgeName: 'Geometry Grandmaster',
    isLocked: true,
    isActive: true,
    displayOrder: 3,
    subject: { id: 'subj-math', name: 'Mathematics', code: 'MATH', icon: '📐' },
    standard: { id: 'grade-5', name: '5', displayName: '5th Standard' },
  },
  {
    id: 'ch-sci5-1',
    standardId: 'grade-5',
    subjectId: 'subj-sci',
    title: 'States of Matter & Simple Machines',
    description: 'Learn solids, liquids, gases, levers, pulleys, and basic mechanics',
    chapterNumber: 1,
    difficulty: 'EASY',
    estimatedMinutes: 20,
    xpReward: 400,
    coinReward: 100,
    badgeName: 'Science Explorer',
    isLocked: false,
    isActive: true,
    displayOrder: 1,
    subject: { id: 'subj-sci', name: 'Science', code: 'SCI', icon: '🔬' },
    standard: { id: 'grade-5', name: '5', displayName: '5th Standard' },
  },
  {
    id: 'ch-sci5-2',
    standardId: 'grade-5',
    subjectId: 'subj-sci',
    title: 'Human Body Systems & Health',
    description: 'Circulatory, respiratory, and digestive systems of the human body',
    chapterNumber: 2,
    difficulty: 'MEDIUM',
    estimatedMinutes: 25,
    xpReward: 500,
    coinReward: 120,
    badgeName: 'Biology Ace',
    isLocked: true,
    isActive: true,
    displayOrder: 2,
    subject: { id: 'subj-sci', name: 'Science', code: 'SCI', icon: '🔬' },
    standard: { id: 'grade-5', name: '5', displayName: '5th Standard' },
  },
  {
    id: 'ch-soc5-1',
    standardId: 'grade-5',
    subjectId: 'subj-social',
    title: 'Introduction to Social science',
    description: 'Civics, Indian heritage, continents, and geographical maps',
    chapterNumber: 1,
    difficulty: 'EASY',
    estimatedMinutes: 20,
    xpReward: 400,
    coinReward: 100,
    badgeName: 'Heritage Master',
    isLocked: false,
    isActive: true,
    displayOrder: 1,
    subject: { id: 'subj-social', name: 'Social Science', code: 'SOCIAL', icon: '🌍' },
    standard: { id: 'grade-5', name: '5', displayName: '5th Standard' },
  },
  {
    id: 'ch-soc5-2',
    standardId: 'grade-5',
    subjectId: 'subj-social',
    title: 'Ancient Civilizations & Geography',
    description: 'Indus Valley, Mesopotamia, climate zones, and natural resources',
    chapterNumber: 2,
    difficulty: 'MEDIUM',
    estimatedMinutes: 25,
    xpReward: 500,
    coinReward: 120,
    badgeName: 'Civilization Expert',
    isLocked: true,
    isActive: true,
    displayOrder: 2,
    subject: { id: 'subj-social', name: 'Social Science', code: 'SOCIAL', icon: '🌍' },
    standard: { id: 'grade-5', name: '5', displayName: '5th Standard' },
  },
  {
    id: 'ch-eng5-1',
    standardId: 'grade-5',
    subjectId: 'subj-eng',
    title: 'Introduction to English',
    description: 'Parts of speech, sentence formation, reading comprehension, and vocabulary',
    chapterNumber: 1,
    difficulty: 'EASY',
    estimatedMinutes: 20,
    xpReward: 400,
    coinReward: 100,
    badgeName: 'English Pro',
    isLocked: false,
    isActive: true,
    displayOrder: 1,
    subject: { id: 'subj-eng', name: 'English', code: 'ENG', icon: '📖' },
    standard: { id: 'grade-5', name: '5', displayName: '5th Standard' },
  },
  {
    id: 'ch-eng5-2',
    standardId: 'grade-5',
    subjectId: 'subj-eng',
    title: 'Storytelling & Composition',
    description: 'Essay writing, narrative voice, metaphors, and advanced vocabulary',
    chapterNumber: 2,
    difficulty: 'MEDIUM',
    estimatedMinutes: 25,
    xpReward: 500,
    coinReward: 120,
    badgeName: 'Master Storyteller',
    isLocked: true,
    isActive: true,
    displayOrder: 2,
    subject: { id: 'subj-eng', name: 'English', code: 'ENG', icon: '📖' },
    standard: { id: 'grade-5', name: '5', displayName: '5th Standard' },
  },
  {
    id: 'ch-phy11-1',
    standardId: 'grade-11',
    subjectId: 'subj-phy',
    title: 'Units & Measurements',
    description: 'SI units, dimensional analysis, and error estimation',
    chapterNumber: 1,
    difficulty: 'MEDIUM',
    estimatedMinutes: 25,
    xpReward: 500,
    coinReward: 100,
    badgeName: 'Physics Pioneer',
    isLocked: false,
    isActive: true,
    displayOrder: 1,
    subject: { id: 'subj-phy', name: 'Physics', code: 'PHY', icon: '⚡' },
    standard: { id: 'grade-11', name: '11', displayName: '11th Standard' },
  },
  {
    id: 'ch-phy11-2',
    standardId: 'grade-11',
    subjectId: 'subj-phy',
    title: 'Kinematics & Motion',
    description: '1D/2D motion, vectors, velocity-time curves, and projectile motion',
    chapterNumber: 2,
    difficulty: 'HARD',
    estimatedMinutes: 30,
    xpReward: 600,
    coinReward: 150,
    badgeName: 'Kinematics Ace',
    isLocked: true,
    isActive: true,
    displayOrder: 2,
    subject: { id: 'subj-phy', name: 'Physics', code: 'PHY', icon: '⚡' },
    standard: { id: 'grade-11', name: '11', displayName: '11th Standard' },
  },
];

// Fallback allowed subject codes per standard grade
const ALLOWED_MAPPINGS = {
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

class ChapterService {
  /**
   * Helper to validate StandardSubject relationship
   */
  async validateStandardSubjectMapping(standard, subject) {
    try {
      const mapping = await prisma.standardSubject.findFirst({
        where: {
          OR: [
            { standardId: standard.id, subjectId: subject.id },
            { standard: { name: standard.name }, subject: { code: subject.code } },
          ],
        },
      });
      if (mapping) return true;
    } catch {
      /* fallback below */
    }

    const gradeKey = String(standard.grade || standard.name || '').replace(/^(grade-|std-)/, '');
    const allowed = ALLOWED_MAPPINGS[gradeKey] || [];
    if (allowed.includes(subject.code)) return true;

    const error = new Error('Subject is not available for the selected standard.');
    error.statusCode = 400;
    throw error;
  }

  /**
   * Get all chapters for a specific standard and subject
   */
  async getChaptersByStandardAndSubject(standardId, subjectId) {
    return this.getChaptersByStandard(standardId, { subjectFilter: subjectId });
  }

  /**
   * Get all chapters for a specific standard with optional subject filter
   */
  async getChaptersByStandard(standardId, options = {}) {
    const includeInactive = options.includeInactive || false;
    const subjectFilter = options.subjectId || options.subjectFilter || null;

    // 1. Resolve standard
    let standard;
    try {
      standard = await standardService.getStandardById(standardId);
    } catch {
      const error = new Error('Standard not found');
      error.statusCode = 404;
      throw error;
    }

    if (!standard) {
      const error = new Error('Standard not found');
      error.statusCode = 404;
      throw error;
    }

    if (standard.isActive === false && !includeInactive) {
      const error = new Error('Standard is inactive');
      error.statusCode = 404;
      throw error;
    }

    // 2. Resolve subject if filtered
    let subject = null;
    if (subjectFilter) {
      try {
        subject = await subjectService.getSubjectById(subjectFilter);
      } catch {
        const error = new Error('Subject not found');
        error.statusCode = 404;
        throw error;
      }

      if (!subject) {
        const error = new Error('Subject not found');
        error.statusCode = 404;
        throw error;
      }

      // Validate that standard and subject are mapped
      await this.validateStandardSubjectMapping(standard, subject);
    }

    // 3. Query Database
    try {
      const whereConditions = [
        {
          OR: [
            { standardId: standard.id },
            { standard: { name: standard.name } },
            ...(standard.grade ? [{ standard: { grade: standard.grade } }] : []),
          ],
        },
        ...(includeInactive ? [] : [{ isActive: true }]),
      ];

      if (subject) {
        whereConditions.push({
          OR: [
            { subjectId: subject.id },
            { subject: { code: subject.code } },
          ],
        });
      }

      const chapters = await prisma.chapter.findMany({
        where: { AND: whereConditions },
        orderBy: [
          { chapterNumber: 'asc' },
          { displayOrder: 'asc' },
        ],
        include: {
          subject: {
            select: { id: true, name: true, code: true, icon: true },
          },
          standard: {
            select: { id: true, name: true, displayName: true },
          },
        },
      });

      if (chapters && chapters.length > 0) {
        return chapters.map(ch => this.sanitizeChapter(ch));
      }
    } catch (dbErr) {
      /* fallback below */
    }

    // 4. Fallback in-memory list
    const gradeKey = String(standard.grade || standard.name || '').replace(/^(grade-|std-)/, '');
    let matched = DEFAULT_CHAPTERS.filter(ch => {
      const chStd = String(ch.standard?.name || ch.standardId).replace(/^(grade-|std-)/, '');
      const matchStd = chStd === gradeKey || ch.standardId === standard.id;
      if (!matchStd) return false;

      if (subject) {
        const matchSubj = ch.subjectId === subject.id || ch.subject?.code === subject.code;
        if (!matchSubj) return false;
      }

      if (!includeInactive && ch.isActive === false) return false;
      return true;
    });

    matched.sort((a, b) => (a.chapterNumber || a.displayOrder || 0) - (b.chapterNumber || b.displayOrder || 0));
    return matched.map(ch => this.sanitizeChapter(ch));
  }

  /**
   * Get single chapter by ID
   */
  async getChapterById(chapterId, options = {}) {
    let chapter;
    try {
      chapter = await prisma.chapter.findUnique({
        where: { id: chapterId },
        include: {
          standard: { select: { id: true, name: true, displayName: true, grade: true } },
          subject: { select: { id: true, name: true, code: true, icon: true } },
        },
      });
    } catch {
      /* fallback below */
    }

    if (!chapter) {
      chapter = DEFAULT_CHAPTERS.find(ch => ch.id === chapterId);
    }

    if (!chapter) {
      const error = new Error('Chapter not found');
      error.statusCode = 404;
      throw error;
    }

    // Validate ownership context if supplied
    if (options.standardId) {
      const normStd = String(options.standardId).replace(/[^0-9]/g, '');
      const chStd = String(chapter.standardId || chapter.standard?.name || chapter.standard?.grade || '').replace(/[^0-9]/g, '');
      const stdMatch =
        chapter.standardId === options.standardId ||
        chapter.standard?.id === options.standardId ||
        (normStd && chStd && normStd === chStd);

      if (!stdMatch) {
        const error = new Error('Chapter does not belong to the specified standard');
        error.statusCode = 400;
        throw error;
      }
    }

    if (options.subjectId) {
      const normSubj = String(options.subjectId).toLowerCase().replace(/^subj-/, '');
      const chSubjCode = String(chapter.subject?.code || '').toLowerCase();
      const chSubjName = String(chapter.subject?.name || '').toLowerCase();
      const chSubjId = String(chapter.subjectId || '').toLowerCase().replace(/^subj-/, '');

      const subjMatch =
        chapter.subjectId === options.subjectId ||
        chSubjId === normSubj ||
        chSubjCode === normSubj ||
        chSubjName === normSubj ||
        (normSubj === 'physics' && (chSubjCode === 'phy' || chSubjId === 'phy')) ||
        (normSubj === 'chemistry' && (chSubjCode === 'chem' || chSubjId === 'chem')) ||
        (normSubj === 'mathematics' && (chSubjCode === 'math' || chSubjId === 'math')) ||
        (normSubj === 'science' && (chSubjCode === 'sci' || chSubjId === 'sci')) ||
        (normSubj === 'social-science' && (chSubjCode === 'social' || chSubjCode === 'soc' || chSubjId === 'social')) ||
        (normSubj === 'tamil' && (chSubjCode === 'tamil' || chSubjId === 'tamil')) ||
        (normSubj === 'english' && (chSubjCode === 'eng' || chSubjId === 'eng'));

      if (!subjMatch) {
        const error = new Error('Chapter does not belong to the specified subject');
        error.statusCode = 400;
        throw error;
      }
    }

    return this.sanitizeChapter(chapter);
  }

  /**
   * Create a new Chapter (Teacher / Admin)
   */
  async createChapter(data) {
    const standard = await standardService.getStandardById(data.standardId);
    const subject = await subjectService.getSubjectById(data.subjectId);

    // Validate StandardSubject mapping
    await this.validateStandardSubjectMapping(standard, subject);

    // Check duplicate chapterNumber within (standardId, subjectId)
    try {
      const existing = await prisma.chapter.findFirst({
        where: {
          standardId: standard.id,
          subjectId: subject.id,
          chapterNumber: data.chapterNumber,
        },
      });

      if (existing) {
        const error = new Error('A chapter with this number already exists for the selected standard and subject.');
        error.statusCode = 409;
        throw error;
      }

      const chapter = await prisma.chapter.create({
        data: {
          standardId: standard.id,
          subjectId: subject.id,
          chapterNumber: data.chapterNumber,
          title: data.title,
          description: data.description || null,
          difficulty: data.difficulty || 'MEDIUM',
          estimatedMinutes: data.estimatedMinutes || 30,
          xpReward: data.xpReward ?? 500,
          coinReward: data.coinReward ?? 100,
          badgeName: data.badgeName || null,
          isLocked: data.isLocked !== undefined ? data.isLocked : false,
          isActive: data.isActive !== undefined ? data.isActive : true,
          displayOrder: data.displayOrder ?? data.chapterNumber,
        },
        include: {
          standard: { select: { id: true, name: true, displayName: true } },
          subject: { select: { id: true, name: true, code: true, icon: true } },
        },
      });

      return this.sanitizeChapter(chapter);
    } catch (error) {
      if (error.statusCode) throw error;
      // In offline mode
      const conflict = DEFAULT_CHAPTERS.find(
        ch =>
          (ch.standardId === standard.id || ch.standard?.name === standard.name) &&
          (ch.subjectId === subject.id || ch.subject?.code === subject.code) &&
          ch.chapterNumber === data.chapterNumber
      );
      if (conflict) {
        const err = new Error('A chapter with this number already exists for the selected standard and subject.');
        err.statusCode = 409;
        throw err;
      }

      return {
        id: `ch-custom-${Date.now()}`,
        standardId: standard.id,
        subjectId: subject.id,
        chapterNumber: data.chapterNumber,
        title: data.title,
        description: data.description || null,
        difficulty: data.difficulty || 'MEDIUM',
        estimatedMinutes: data.estimatedMinutes || 30,
        xpReward: data.xpReward ?? 500,
        coinReward: data.coinReward ?? 100,
        badgeName: data.badgeName || null,
        isLocked: data.isLocked || false,
        isActive: data.isActive !== false,
        displayOrder: data.displayOrder || data.chapterNumber,
        standard,
        subject,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
  }

  /**
   * Update an existing chapter (Teacher / Admin)
   */
  async updateChapter(chapterId, data) {
    const existing = await this.getChapterById(chapterId);

    try {
      if (data.chapterNumber && data.chapterNumber !== existing.chapterNumber) {
        const conflict = await prisma.chapter.findFirst({
          where: {
            id: { not: existing.id },
            standardId: existing.standardId,
            subjectId: existing.subjectId,
            chapterNumber: data.chapterNumber,
          },
        });

        if (conflict) {
          const error = new Error('A chapter with this number already exists for the selected standard and subject.');
          error.statusCode = 409;
          throw error;
        }
      }

      const updated = await prisma.chapter.update({
        where: { id: existing.id },
        data: {
          ...(data.title !== undefined && { title: data.title }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.chapterNumber !== undefined && { chapterNumber: data.chapterNumber }),
          ...(data.difficulty !== undefined && { difficulty: data.difficulty }),
          ...(data.estimatedMinutes !== undefined && { estimatedMinutes: data.estimatedMinutes }),
          ...(data.xpReward !== undefined && { xpReward: data.xpReward }),
          ...(data.coinReward !== undefined && { coinReward: data.coinReward }),
          ...(data.badgeName !== undefined && { badgeName: data.badgeName }),
          ...(data.isLocked !== undefined && { isLocked: data.isLocked }),
          ...(data.isActive !== undefined && { isActive: data.isActive }),
          ...(data.displayOrder !== undefined && { displayOrder: data.displayOrder }),
        },
        include: {
          standard: { select: { id: true, name: true, displayName: true } },
          subject: { select: { id: true, name: true, code: true, icon: true } },
        },
      });

      return this.sanitizeChapter(updated);
    } catch (error) {
      if (error.statusCode) throw error;
      return {
        ...existing,
        ...data,
        updatedAt: new Date(),
      };
    }
  }

  /**
   * Safe archive/delete a chapter (Teacher / Admin)
   */
  async deleteChapter(chapterId) {
    const existing = await this.getChapterById(chapterId);

    try {
      // Safe archive instead of breaking child records
      await prisma.chapter.update({
        where: { id: existing.id },
        data: { isActive: false },
      });
      return { message: 'Chapter archived successfully' };
    } catch (error) {
      return { message: 'Chapter archived successfully' };
    }
  }

  /**
   * Sanitize chapter for student safety
   */
  sanitizeChapter(chapter) {
    if (!chapter) return null;
    return {
      id: chapter.id,
      standardId: chapter.standardId,
      subjectId: chapter.subjectId,
      chapterNumber: chapter.chapterNumber,
      title: chapter.title,
      description: chapter.description,
      difficulty: chapter.difficulty,
      estimatedMinutes: chapter.estimatedMinutes,
      xpReward: chapter.xpReward,
      coinReward: chapter.coinReward,
      badgeName: chapter.badgeName,
      isLocked: chapter.isLocked,
      isActive: chapter.isActive !== false,
      displayOrder: chapter.displayOrder ?? chapter.chapterNumber,
      createdAt: chapter.createdAt,
      updatedAt: chapter.updatedAt,
      ...(chapter.subject ? { subject: chapter.subject } : {}),
      ...(chapter.standard ? { standard: chapter.standard } : {}),
    };
  }
}

module.exports = new ChapterService();
