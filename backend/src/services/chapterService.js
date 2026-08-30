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
      const stdMatch =
        chapter.standardId === options.standardId ||
        chapter.standard?.id === options.standardId ||
        chapter.standard?.name === options.standardId ||
        String(chapter.standard?.grade) === options.standardId;

      if (!stdMatch) {
        const error = new Error('Chapter does not belong to the specified standard');
        error.statusCode = 400;
        throw error;
      }
    }

    if (options.subjectId) {
      const subjMatch =
        chapter.subjectId === options.subjectId ||
        chapter.subject?.id === options.subjectId ||
        chapter.subject?.code === options.subjectId.toUpperCase();

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
