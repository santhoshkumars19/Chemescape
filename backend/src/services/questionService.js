const prisma = require('../config/db');
const roomService = require('./roomService');
const topicService = require('./topicService');

// Authoritative default questions for fallback / offline resilience
const DEFAULT_QUESTIONS = [
  // 11th Chemistry Room 1 (Deconstruction Lab - Grid Reconstruction)
  {
    id: 'q-chem-r1-1',
    chapterId: 'ch-3',
    topicId: 'topic-1',
    roomId: 'room-1',
    questionNumber: 1,
    displayOrder: 1,
    questionType: 'MCQ',
    questionText: 'Which element is located in Group 1, Period 3 of the Periodic Table?',
    description: 'Identify the alkali metal in the third period.',
    difficulty: 'EASY',
    points: 100,
    timeLimit: 60,
    hint: 'Its atomic number is 11 and it reacts vigorously with water.',
    explanation: 'Sodium (Na) is an alkali metal with atomic number 11 located in Group 1, Period 3.',
    status: 'PUBLISHED',
    isActive: true,
    options: [
      { id: 'opt-q1-1', optionKey: 'A', optionText: 'Lithium (Li)', isCorrect: false, orderNumber: 1 },
      { id: 'opt-q1-2', optionKey: 'B', optionText: 'Sodium (Na)', isCorrect: true, orderNumber: 2 },
      { id: 'opt-q1-3', optionKey: 'C', optionText: 'Potassium (K)', isCorrect: false, orderNumber: 3 },
      { id: 'opt-q1-4', optionKey: 'D', optionText: 'Magnesium (Mg)', isCorrect: false, orderNumber: 4 },
    ],
  },
  {
    id: 'q-chem-r1-2',
    chapterId: 'ch-3',
    topicId: 'topic-2',
    roomId: 'room-1',
    questionNumber: 2,
    displayOrder: 2,
    questionType: 'DRAG_DROP',
    questionText: 'Drag each element to its correct periodic block.',
    difficulty: 'MEDIUM',
    points: 150,
    timeLimit: 90,
    status: 'PUBLISHED',
    isActive: true,
    puzzleData: {
      items: ['Sodium', 'Iron', 'Chlorine', 'Cerium'],
      targets: ['s-block', 'd-block', 'p-block', 'f-block'],
      correctMapping: { Sodium: 's-block', Iron: 'd-block', Chlorine: 'p-block', Cerium: 'f-block' },
    },
  },
  // 11th Chemistry Room 2 (Quantum Chamber - Quantum Architect)
  {
    id: 'q-chem-r2-1',
    chapterId: 'ch-3',
    topicId: 'topic-6',
    roomId: 'room-2',
    questionNumber: 1,
    displayOrder: 1,
    questionType: 'ELECTRON_CONFIGURATION',
    questionText: 'Enter the electron configuration for Oxygen (Z = 8).',
    difficulty: 'MEDIUM',
    points: 150,
    timeLimit: 120,
    status: 'PUBLISHED',
    isActive: true,
    puzzleData: {
      element: 'Oxygen',
      atomicNumber: 8,
      expectedConfiguration: '1s2 2s2 2p4',
    },
  },
  // 11th Chemistry Room 3 (Trend Vault - Calculation Heist)
  {
    id: 'q-chem-r3-1',
    chapterId: 'ch-3',
    topicId: 'topic-3',
    roomId: 'room-3',
    questionNumber: 1,
    displayOrder: 1,
    questionType: 'CALCULATION',
    questionText: 'Calculate the number of moles in 36 grams of pure Water (H2O, Molar Mass = 18 g/mol).',
    difficulty: 'EASY',
    points: 100,
    timeLimit: 90,
    status: 'PUBLISHED',
    isActive: true,
    puzzleData: {
      mass: 36,
      molarMass: 18,
      unit: 'mol',
      expectedCalculation: 2,
      expectedValue: 2,
    },
  },
  // Standard 4 Math Room 1 (Fraction Bakery)
  {
    id: 'q-math4-r1-1',
    chapterId: 'ch-math4-2',
    topicId: 'topic-math4-2-1',
    roomId: 'room-math4-2-1',
    questionNumber: 1,
    displayOrder: 1,
    questionType: 'MCQ',
    questionText: 'Which fraction is equivalent to 1/2?',
    difficulty: 'EASY',
    points: 100,
    timeLimit: 60,
    status: 'PUBLISHED',
    isActive: true,
    options: [
      { id: 'opt-math-1', optionKey: 'A', optionText: '2/4', isCorrect: true, orderNumber: 1 },
      { id: 'opt-math-2', optionKey: 'B', optionText: '1/3', isCorrect: false, orderNumber: 2 },
      { id: 'opt-math-3', optionKey: 'C', optionText: '3/5', isCorrect: false, orderNumber: 3 },
    ],
  },
];

class QuestionService {
  /**
   * Authoritative Student-Safe Question Sanitizer
   * Strips all answer keys, correct answers, and secret solutions
   */
  toStudentQuestion(question) {
    if (!question) return null;

    // Sanitize options
    let sanitizedOptions = undefined;
    if (question.options && Array.isArray(question.options)) {
      sanitizedOptions = question.options
        .filter(opt => opt.isActive !== false)
        .map(opt => ({
          id: opt.id,
          optionKey: opt.optionKey,
          optionText: opt.optionText,
          optionValue: opt.optionValue,
          orderNumber: opt.orderNumber,
          displayOrder: opt.displayOrder ?? opt.orderNumber,
        }));
    }

    // Sanitize puzzleData
    let sanitizedPuzzleData = undefined;
    if (question.puzzleData) {
      const raw = typeof question.puzzleData === 'object' ? { ...question.puzzleData } : {};
      delete raw.correctMapping;
      delete raw.correctOrder;
      delete raw.expectedConfiguration;
      delete raw.expectedCalculation;
      delete raw.expectedValue;
      delete raw.solutionKey;
      delete raw.correctAnswer;
      delete raw.answerKey;
      delete raw.solution;
      delete raw.targetState;
      delete raw.teacherNotes;
      delete raw.secretValidationData;
      sanitizedPuzzleData = raw;
    }

    return {
      id: question.id,
      roomId: question.roomId,
      topicId: question.topicId,
      chapterId: question.chapterId,
      questionNumber: question.questionNumber ?? question.orderNumber ?? 1,
      displayOrder: question.displayOrder ?? question.questionNumber ?? 1,
      questionType: question.questionType,
      questionText: question.questionText,
      description: question.description,
      difficulty: question.difficulty,
      points: question.points,
      timeLimit: question.timeLimit,
      hint: question.hint,
      puzzleData: sanitizedPuzzleData,
      options: sanitizedOptions,
      status: question.status,
      isActive: question.isActive !== false,
      createdAt: question.createdAt,
      updatedAt: question.updatedAt,
      ...(question.topic ? { topic: question.topic } : {}),
      ...(question.room ? { room: question.room } : {}),
      ...(question.chapter ? { chapter: question.chapter } : {}),
    };
  }

  /**
   * Get all questions for a specific Room
   */
  async getQuestionsByRoom(roomId, isStudentView = true) {
    // 1. Verify Room exists
    let room;
    try {
      room = await roomService.getRoomById(roomId, { includeInactive: !isStudentView });
    } catch (err) {
      if (err.statusCode) throw err;
      const error = new Error('Room not found');
      error.statusCode = 404;
      throw error;
    }

    if (!room) {
      const error = new Error('Room not found');
      error.statusCode = 404;
      throw error;
    }

    // 2. Query DB
    try {
      const where = {
        roomId: room.id,
        ...(isStudentView ? { status: 'PUBLISHED', isActive: true } : {}),
      };

      const questions = await prisma.question.findMany({
        where,
        include: {
          options: {
            where: isStudentView ? { isActive: true } : {},
            orderBy: { orderNumber: 'asc' },
          },
          topic: { select: { id: true, title: true, orderNumber: true } },
        },
        orderBy: { questionNumber: 'asc' },
      });

      if (questions && questions.length > 0) {
        return isStudentView
          ? questions.map(q => this.toStudentQuestion(q))
          : questions;
      }
    } catch (dbErr) {
      /* fallback below */
    }

    // 3. Fallback matching questions
    const matched = DEFAULT_QUESTIONS.filter(q => {
      const matchRoom = q.roomId === room.id || q.roomId === roomId;
      if (!matchRoom) return false;
      if (isStudentView && (q.status !== 'PUBLISHED' || q.isActive === false)) return false;
      return true;
    });

    matched.sort((a, b) => (a.questionNumber || 0) - (b.questionNumber || 0));
    return isStudentView ? matched.map(q => this.toStudentQuestion(q)) : matched;
  }

  /**
   * Get single question by ID
   */
  async getQuestionById(id, options = {}) {
    const isStudentView = options.isStudentView !== false;

    let question;
    try {
      question = await prisma.question.findUnique({
        where: { id },
        include: {
          options: {
            where: isStudentView ? { isActive: true } : {},
            orderBy: { orderNumber: 'asc' },
          },
          topic: true,
          room: true,
          chapter: true,
        },
      });
    } catch {
      /* fallback below */
    }

    if (!question) {
      question = DEFAULT_QUESTIONS.find(q => q.id === id);
    }

    if (!question) {
      const error = new Error('Question not found');
      error.statusCode = 404;
      throw error;
    }

    // Context validation if roomId or chapterId is provided
    if (options.roomId && question.roomId !== options.roomId) {
      const error = new Error('Question does not belong to the specified room');
      error.statusCode = 400;
      throw error;
    }

    if (options.chapterId && question.chapterId !== options.chapterId) {
      const error = new Error('Question does not belong to the specified chapter');
      error.statusCode = 400;
      throw error;
    }

    if (isStudentView && (question.status !== 'PUBLISHED' || question.isActive === false)) {
      const error = new Error('Question not found');
      error.statusCode = 404;
      throw error;
    }

    return isStudentView ? this.toStudentQuestion(question) : question;
  }

  /**
   * Teacher / Admin: Get all questions with filtering & search
   */
  async getAllQuestions(query = {}, isStudentView = false) {
    const { standardId, subjectId, chapterId, topicId, roomId, questionType, difficulty, status, search } = query;

    const where = {};
    if (chapterId) where.chapterId = chapterId;
    if (roomId) where.roomId = roomId;
    if (topicId) where.topicId = topicId;
    if (questionType) where.questionType = questionType;
    if (difficulty) where.difficulty = difficulty;
    if (status) where.status = status;
    if (isStudentView) {
      where.status = 'PUBLISHED';
      where.isActive = true;
    }

    if (search) {
      where.OR = [
        { questionText: { contains: search } },
        { description: { contains: search } },
      ];
    }

    try {
      const questions = await prisma.question.findMany({
        where,
        include: {
          options: { orderBy: { orderNumber: 'asc' } },
          topic: { select: { id: true, title: true } },
          room: { select: { id: true, name: true, gameType: true } },
          chapter: { select: { id: true, title: true, chapterNumber: true } },
        },
        orderBy: [{ roomId: 'asc' }, { questionNumber: 'asc' }],
      });

      return isStudentView ? questions.map(q => this.toStudentQuestion(q)) : questions;
    } catch {
      let filtered = [...DEFAULT_QUESTIONS];
      if (roomId) filtered = filtered.filter(q => q.roomId === roomId);
      if (chapterId) filtered = filtered.filter(q => q.chapterId === chapterId);
      if (topicId) filtered = filtered.filter(q => q.topicId === topicId);
      if (questionType) filtered = filtered.filter(q => q.questionType === questionType);
      if (difficulty) filtered = filtered.filter(q => q.difficulty === difficulty);
      if (status) filtered = filtered.filter(q => q.status === status);
      if (isStudentView) filtered = filtered.filter(q => q.status === 'PUBLISHED' && q.isActive !== false);

      return isStudentView ? filtered.map(q => this.toStudentQuestion(q)) : filtered;
    }
  }

  /**
   * Create a new Question (Teacher / Admin)
   */
  async createQuestion(data) {
    let resolvedChapterId = data.chapterId;
    let room = null;

    // 1. Resolve Room context
    if (data.roomId) {
      try {
        room = await roomService.getRoomById(data.roomId, { includeInactive: true });
      } catch (err) {
        if (err.statusCode) throw err;
        const error = new Error('Room not found');
        error.statusCode = 404;
        throw error;
      }
      if (!room) {
        const error = new Error('Room not found');
        error.statusCode = 404;
        throw error;
      }
      resolvedChapterId = room.chapterId;
    }

    // 2. Validate Topic context if provided
    if (data.topicId) {
      const topic = await topicService.getTopicById(data.topicId);
      if (!topic) {
        const error = new Error('Topic not found');
        error.statusCode = 404;
        throw error;
      }
      if (resolvedChapterId && topic.chapterId !== resolvedChapterId) {
        const error = new Error('Topic does not belong to the same chapter as the room');
        error.statusCode = 400;
        throw error;
      }
      resolvedChapterId = topic.chapterId;
    }

    if (!resolvedChapterId) {
      const error = new Error('Either roomId, topicId, or chapterId must be provided');
      error.statusCode = 400;
      throw error;
    }

    const questionNumber = data.questionNumber || data.displayOrder || 1;

    // 3. Prevent duplicate questionNumber within same room
    if (data.roomId) {
      try {
        const existing = await prisma.question.findFirst({
          where: {
            roomId: data.roomId,
            questionNumber,
          },
        });

        if (existing) {
          const error = new Error('A question with this question number already exists in this room.');
          error.statusCode = 409;
          throw error;
        }
      } catch (err) {
        if (err.statusCode) throw err;
      }

      const conflict = DEFAULT_QUESTIONS.find(
        q => q.roomId === data.roomId && q.questionNumber === questionNumber
      );
      if (conflict) {
        const error = new Error('A question with this question number already exists in this room.');
        error.statusCode = 409;
        throw error;
      }
    }

    // 4. Create in DB
    const { options, ...questionPayload } = data;

    try {
      const created = await prisma.question.create({
        data: {
          chapterId: resolvedChapterId,
          topicId: data.topicId || null,
          roomId: data.roomId || null,
          questionNumber,
          displayOrder: data.displayOrder || questionNumber,
          questionType: data.questionType || 'MCQ',
          questionText: data.questionText,
          description: data.description || null,
          difficulty: data.difficulty || 'MEDIUM',
          points: data.points ?? 100,
          timeLimit: data.timeLimit ?? 60,
          hint: data.hint || null,
          explanation: data.explanation || null,
          puzzleData: data.puzzleData || null,
          status: data.status || 'PUBLISHED',
          isActive: data.isActive !== undefined ? data.isActive : true,
          ...(options && options.length > 0
            ? {
                options: {
                  create: options.map((opt, idx) => ({
                    optionKey: opt.optionKey || String.fromCharCode(65 + idx),
                    optionText: opt.optionText,
                    optionValue: opt.optionValue || null,
                    isCorrect: opt.isCorrect === true,
                    orderNumber: opt.orderNumber ?? idx + 1,
                    displayOrder: opt.displayOrder ?? opt.orderNumber ?? idx + 1,
                    isActive: opt.isActive !== false,
                  })),
                },
              }
            : {}),
        },
        include: {
          options: { orderBy: { orderNumber: 'asc' } },
          topic: true,
          room: true,
          chapter: true,
        },
      });

      return created;
    } catch (error) {
      if (error.statusCode) throw error;
      // In offline resilience mode
      const newQuestion = {
        id: `q-custom-${Date.now()}`,
        chapterId: resolvedChapterId,
        topicId: data.topicId || null,
        roomId: data.roomId || null,
        questionNumber,
        displayOrder: data.displayOrder || questionNumber,
        questionType: data.questionType || 'MCQ',
        questionText: data.questionText,
        description: data.description || null,
        difficulty: data.difficulty || 'MEDIUM',
        points: data.points ?? 100,
        timeLimit: data.timeLimit ?? 60,
        hint: data.hint || null,
        explanation: data.explanation || null,
        puzzleData: data.puzzleData || null,
        status: data.status || 'PUBLISHED',
        isActive: data.isActive !== false,
        options: (options || []).map((opt, idx) => ({
          id: `opt-custom-${Date.now()}-${idx}`,
          optionKey: opt.optionKey || String.fromCharCode(65 + idx),
          optionText: opt.optionText,
          optionValue: opt.optionValue || null,
          isCorrect: opt.isCorrect === true,
          orderNumber: opt.orderNumber ?? idx + 1,
          displayOrder: opt.displayOrder ?? opt.orderNumber ?? idx + 1,
          isActive: opt.isActive !== false,
        })),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      DEFAULT_QUESTIONS.push(newQuestion);
      return newQuestion;
    }
  }

  /**
   * Update an existing Question (Teacher / Admin)
   */
  async updateQuestion(id, data) {
    const existing = await this.getQuestionById(id, { isStudentView: false });
    const questionNumber = data.questionNumber || data.displayOrder;

    // Check duplicate questionNumber within same room if changed
    if (questionNumber && questionNumber !== existing.questionNumber && existing.roomId) {
      try {
        const conflict = await prisma.question.findFirst({
          where: {
            id: { not: existing.id },
            roomId: existing.roomId,
            questionNumber,
          },
        });

        if (conflict) {
          const error = new Error('A question with this question number already exists in this room.');
          error.statusCode = 409;
          throw error;
        }
      } catch (err) {
        if (err.statusCode) throw err;
      }
    }

    const { options, ...questionPayload } = data;

    try {
      // If options are provided, replace them
      if (options && Array.isArray(options)) {
        await prisma.questionOption.deleteMany({ where: { questionId: id } });
        await prisma.questionOption.createMany({
          data: options.map((opt, idx) => ({
            questionId: id,
            optionKey: opt.optionKey || String.fromCharCode(65 + idx),
            optionText: opt.optionText,
            optionValue: opt.optionValue || null,
            isCorrect: opt.isCorrect === true,
            orderNumber: opt.orderNumber ?? idx + 1,
            displayOrder: opt.displayOrder ?? opt.orderNumber ?? idx + 1,
            isActive: opt.isActive !== false,
          })),
        });
      }

      const updated = await prisma.question.update({
        where: { id },
        data: {
          ...(questionPayload.questionText !== undefined && { questionText: questionPayload.questionText }),
          ...(questionPayload.description !== undefined && { description: questionPayload.description }),
          ...(questionPayload.questionType !== undefined && { questionType: questionPayload.questionType }),
          ...(questionNumber !== undefined && { questionNumber, displayOrder: questionNumber }),
          ...(questionPayload.difficulty !== undefined && { difficulty: questionPayload.difficulty }),
          ...(questionPayload.points !== undefined && { points: questionPayload.points }),
          ...(questionPayload.timeLimit !== undefined && { timeLimit: questionPayload.timeLimit }),
          ...(questionPayload.hint !== undefined && { hint: questionPayload.hint }),
          ...(questionPayload.explanation !== undefined && { explanation: questionPayload.explanation }),
          ...(questionPayload.puzzleData !== undefined && { puzzleData: questionPayload.puzzleData }),
          ...(questionPayload.status !== undefined && { status: questionPayload.status }),
          ...(questionPayload.isActive !== undefined && { isActive: questionPayload.isActive }),
        },
        include: {
          options: { orderBy: { orderNumber: 'asc' } },
          topic: true,
          room: true,
          chapter: true,
        },
      });

      return updated;
    } catch (error) {
      if (error.statusCode) throw error;
      // In offline mode
      Object.assign(existing, questionPayload);
      if (questionNumber !== undefined) {
        existing.questionNumber = questionNumber;
        existing.displayOrder = questionNumber;
      }
      if (options) {
        existing.options = options.map((opt, idx) => ({
          id: opt.id || `opt-upd-${Date.now()}-${idx}`,
          optionKey: opt.optionKey || String.fromCharCode(65 + idx),
          optionText: opt.optionText,
          optionValue: opt.optionValue || null,
          isCorrect: opt.isCorrect === true,
          orderNumber: opt.orderNumber ?? idx + 1,
          displayOrder: opt.displayOrder ?? opt.orderNumber ?? idx + 1,
          isActive: opt.isActive !== false,
        }));
      }
      existing.updatedAt = new Date();
      return existing;
    }
  }

  /**
   * Safe archive / soft delete a Question (Teacher / Admin)
   */
  async deleteQuestion(id) {
    const existing = await this.getQuestionById(id, { isStudentView: false });

    try {
      await prisma.question.update({
        where: { id: existing.id },
        data: {
          isActive: false,
          status: 'ARCHIVED',
        },
      });
      return { message: 'Question archived successfully' };
    } catch (error) {
      existing.isActive = false;
      existing.status = 'ARCHIVED';
      return { message: 'Question archived successfully' };
    }
  }
}

module.exports = new QuestionService();
