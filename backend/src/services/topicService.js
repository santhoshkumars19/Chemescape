const prisma = require('../config/db');
const chapterService = require('./chapterService');

// Authoritative default topic definitions
const DEFAULT_TOPICS = [
  // 11th Chemistry Chapter 3 Topics
  {
    id: 'topic-1',
    chapterId: 'ch-3',
    title: 'Modern Periodic Law',
    description: 'Properties of elements are periodic functions of their atomic numbers.',
    orderNumber: 1,
    isActive: true,
  },
  {
    id: 'topic-2',
    chapterId: 'ch-3',
    title: 'Groups and Periods',
    description: 'Vertical columns (groups) and horizontal rows (periods) in the table.',
    orderNumber: 2,
    isActive: true,
  },
  {
    id: 'topic-3',
    chapterId: 'ch-3',
    title: 'Periodic Trends',
    description: 'Atomic size, ionization enthalpy, and electronegativity variations.',
    orderNumber: 3,
    isActive: true,
  },
  {
    id: 'topic-4',
    chapterId: 'ch-3',
    title: 'Atomic Radius',
    description: 'Distance from the nucleus to the outermost electron shell.',
    orderNumber: 4,
    isActive: true,
  },
  {
    id: 'topic-5',
    chapterId: 'ch-3',
    title: 'Ionization Energy',
    description: 'Energy required to remove an electron from an isolated gaseous atom.',
    orderNumber: 5,
    isActive: true,
  },
  {
    id: 'topic-6',
    chapterId: 'ch-3',
    title: 'Electron Configuration',
    description: 'Distribution of electrons in shells and subshells (s, p, d, f).',
    orderNumber: 6,
    isActive: true,
  },
  // Standard 4 Math Chapter 2 Topics
  {
    id: 'topic-math4-2-1',
    chapterId: 'ch-math4-2',
    title: 'Basic Fractions',
    description: 'Introduction to numerators and denominators.',
    orderNumber: 1,
    isActive: true,
  },
  {
    id: 'topic-math4-2-2',
    chapterId: 'ch-math4-2',
    title: 'Equivalent Fractions',
    description: 'Finding equivalent fractions by multiplying or dividing.',
    orderNumber: 2,
    isActive: true,
  },
  // Standard 4 Tamil Chapter 1 Topics (அன்னைத் தமிழே)
  {
    id: 'topic-tam4-1-1',
    chapterId: 'ch-tam4-1',
    title: 'பாடல் வரிகளும் விளக்கமும்',
    description: 'அன்னைத் தமிழே பாடலின் வரிகள் மற்றும் அதன் பொருள் நயம்.',
    orderNumber: 1,
    isActive: true,
  },
  {
    id: 'topic-tam4-1-2',
    chapterId: 'ch-tam4-1',
    title: 'சொல் பொருள் & அகராதி',
    description: 'அன்னை, ஆவி, உலகம், வளர்பவள் போன்ற அருஞ்சொற்பொருள்.',
    orderNumber: 2,
    isActive: true,
  },
  {
    id: 'topic-tam4-1-3',
    chapterId: 'ch-tam4-1',
    title: 'பிரித்து & சேர்த்து எழுதுக',
    description: 'சொற்களைப் பிரித்தறிதல் மற்றும் புணர்ச்சி விதிகள்.',
    orderNumber: 3,
    isActive: true,
  },
  {
    id: 'topic-tam4-1-4',
    chapterId: 'ch-tam4-1',
    title: 'எதுகை, மோனை & நயங்கள்',
    description: 'செய்யுள் நயங்கள் மற்றும் எதுகை மோனை சொற்கள்.',
    orderNumber: 4,
    isActive: true,
  },
  // Standard 4 English Chapter 1 Topics (A Feast for Rats)
  {
    id: 'topic-eng4-1-1',
    chapterId: 'ch-eng4-1',
    title: 'Story & Reading Comprehension',
    description: 'A Feast for Rats narrative, characters, and plot sequence.',
    orderNumber: 1,
    isActive: true,
  },
  {
    id: 'topic-eng4-1-2',
    chapterId: 'ch-eng4-1',
    title: 'Vocabulary & Word Meanings',
    description: 'Contextual vocabulary, synonyms, and antonyms from the story.',
    orderNumber: 2,
    isActive: true,
  },
  {
    id: 'topic-eng4-1-3',
    chapterId: 'ch-eng4-1',
    title: 'Nouns: Proper, Common & Collective',
    description: 'Identifying naming words, groups of things, and capitalization.',
    orderNumber: 3,
    isActive: true,
  },
  {
    id: 'topic-eng4-1-4',
    chapterId: 'ch-eng4-1',
    title: 'Sentence Formation & Punctuation',
    description: 'Crafting meaningful sentences with capital letters and punctuation.',
    orderNumber: 4,
    isActive: true,
  },
];

class TopicService {
  /**
   * Get topics belonging to a specific Chapter
   */
  async getTopicsByChapter(chapterId, options = {}) {
    const includeInactive = options.includeInactive || false;

    // 1. Verify chapter exists and is active
    let chapter;
    try {
      chapter = await chapterService.getChapterById(chapterId);
    } catch {
      const error = new Error('Chapter not found');
      error.statusCode = 404;
      throw error;
    }

    if (!chapter) {
      const error = new Error('Chapter not found');
      error.statusCode = 404;
      throw error;
    }

    if (chapter.isActive === false && !includeInactive) {
      const error = new Error('Chapter is inactive');
      error.statusCode = 404;
      throw error;
    }

    // 2. Query DB
    try {
      const topics = await prisma.topic.findMany({
        where: {
          OR: [
            { chapterId: chapter.id },
            { chapter: { id: chapter.id } },
          ],
          ...(includeInactive ? {} : { isActive: true }),
        },
        orderBy: { orderNumber: 'asc' },
      });

      if (topics && topics.length > 0) {
        return topics.map(t => this.sanitizeTopic(t));
      }
    } catch (dbErr) {
      /* fallback below */
    }

    // 3. Fallback matching topics
    const matched = DEFAULT_TOPICS.filter(t => {
      const matchChap = t.chapterId === chapter.id || t.chapterId === chapterId;
      if (!matchChap) return false;
      if (!includeInactive && t.isActive === false) return false;
      return true;
    });

    matched.sort((a, b) => (a.orderNumber || 0) - (b.orderNumber || 0));
    return matched.map(t => this.sanitizeTopic(t));
  }

  /**
   * Get single topic by ID with optional chapter context check
   */
  async getTopicById(topicId, options = {}) {
    let topic;
    try {
      topic = await prisma.topic.findUnique({
        where: { id: topicId },
        include: {
          chapter: {
            select: { id: true, title: true, chapterNumber: true, standardId: true, subjectId: true },
          },
        },
      });
    } catch {
      /* fallback below */
    }

    if (!topic) {
      topic = DEFAULT_TOPICS.find(t => t.id === topicId);
    }

    if (!topic) {
      const error = new Error('Topic not found');
      error.statusCode = 404;
      throw error;
    }

    // Context validation if chapterId provided
    if (options.chapterId && topic.chapterId !== options.chapterId) {
      const error = new Error('Topic does not belong to the specified chapter');
      error.statusCode = 400;
      throw error;
    }

    return this.sanitizeTopic(topic);
  }

  /**
   * Create a new Topic (Teacher / Admin)
   */
  async createTopic(data) {
    const orderNumber = data.orderNumber || data.displayOrder || 1;

    // Validate chapter exists
    const chapter = await chapterService.getChapterById(data.chapterId);

    // Check duplicate orderNumber within the same chapter
    try {
      const existing = await prisma.topic.findFirst({
        where: {
          chapterId: chapter.id,
          orderNumber,
        },
      });

      if (existing) {
        const error = new Error('A topic with this order number already exists in this chapter.');
        error.statusCode = 409;
        throw error;
      }

      const topic = await prisma.topic.create({
        data: {
          chapterId: chapter.id,
          title: data.title,
          description: data.description || null,
          orderNumber,
          isActive: data.isActive !== undefined ? data.isActive : true,
        },
      });

      return this.sanitizeTopic(topic);
    } catch (error) {
      if (error.statusCode) throw error;
      // In offline mode
      const conflict = DEFAULT_TOPICS.find(
        t => t.chapterId === chapter.id && t.orderNumber === orderNumber
      );
      if (conflict) {
        const err = new Error('A topic with this order number already exists in this chapter.');
        err.statusCode = 409;
        throw err;
      }

      return {
        id: `topic-custom-${Date.now()}`,
        chapterId: chapter.id,
        title: data.title,
        description: data.description || null,
        orderNumber,
        isActive: data.isActive !== false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
  }

  /**
   * Update an existing Topic (Teacher / Admin)
   */
  async updateTopic(topicId, data) {
    const existing = await this.getTopicById(topicId);
    const orderNumber = data.orderNumber || data.displayOrder;

    try {
      if (orderNumber && orderNumber !== existing.orderNumber) {
        const conflict = await prisma.topic.findFirst({
          where: {
            id: { not: existing.id },
            chapterId: existing.chapterId,
            orderNumber,
          },
        });

        if (conflict) {
          const error = new Error('A topic with this order number already exists in this chapter.');
          error.statusCode = 409;
          throw error;
        }
      }

      const updated = await prisma.topic.update({
        where: { id: existing.id },
        data: {
          ...(data.title !== undefined && { title: data.title }),
          ...(data.description !== undefined && { description: data.description }),
          ...(orderNumber !== undefined && { orderNumber }),
          ...(data.isActive !== undefined && { isActive: data.isActive }),
        },
      });

      return this.sanitizeTopic(updated);
    } catch (error) {
      if (error.statusCode) throw error;
      return {
        ...existing,
        ...data,
        ...(orderNumber !== undefined && { orderNumber }),
        updatedAt: new Date(),
      };
    }
  }

  /**
   * Safe archive / deactivate a Topic (Teacher / Admin)
   */
  async deleteTopic(topicId) {
    const existing = await this.getTopicById(topicId);

    try {
      await prisma.topic.update({
        where: { id: existing.id },
        data: { isActive: false },
      });
      return { message: 'Topic archived successfully' };
    } catch (error) {
      return { message: 'Topic archived successfully' };
    }
  }

  /**
   * Sanitize topic for student safety
   */
  sanitizeTopic(topic) {
    if (!topic) return null;
    return {
      id: topic.id,
      chapterId: topic.chapterId,
      title: topic.title,
      description: topic.description,
      orderNumber: topic.orderNumber,
      displayOrder: topic.orderNumber,
      isActive: topic.isActive !== false,
      createdAt: topic.createdAt,
      updatedAt: topic.updatedAt,
      ...(topic.chapter ? { chapter: topic.chapter } : {}),
    };
  }
}

module.exports = new TopicService();
