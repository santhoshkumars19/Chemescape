const prisma = require('../config/db');

class QuestionService {
  /**
   * Helper to strip correct answer data (isCorrect) for student public API
   */
  sanitizeOptionsForStudent(options) {
    if (!options) return [];
    return options.map(({ isCorrect, ...rest }) => rest);
  }

  /**
   * Helper to strip internal solution keys from puzzleData for student API
   */
  sanitizePuzzleDataForStudent(puzzleData) {
    if (!puzzleData) return null;
    const sanitized = { ...puzzleData };
    // Strip correct answers / solution keys
    delete sanitized.correctMapping;
    delete sanitized.correctOrder;
    delete sanitized.expectedConfiguration;
    return sanitized;
  }

  async getQuestionsByRoom(roomId, isStudentView = true) {
    const questions = await prisma.question.findMany({
      where: { roomId },
      include: {
        options: {
          orderBy: { orderNumber: 'asc' },
        },
      },
    });

    if (isStudentView) {
      return questions.map((q) => ({
        ...q,
        options: this.sanitizeOptionsForStudent(q.options),
        puzzleData: this.sanitizePuzzleDataForStudent(q.puzzleData),
        explanation: undefined, // Hide explanation until question is answered
      }));
    }

    return questions;
  }

  async createQuestion(data) {
    const { options, ...questionData } = data;

    if (options && options.length > 0) {
      return prisma.question.create({
        data: {
          ...questionData,
          options: {
            create: options,
          },
        },
        include: { options: true },
      });
    }

    return prisma.question.create({
      data: questionData,
      include: { options: true },
    });
  }

  async updateQuestion(id, data) {
    const { options, ...questionData } = data;
    return prisma.question.update({
      where: { id },
      data: questionData,
      include: { options: true },
    });
  }

  async getAllQuestions(query = {}) {
    const { chapterId, roomId } = query;
    const where = {};
    if (chapterId) where.chapterId = chapterId;
    if (roomId) where.roomId = roomId;

    return prisma.question.findMany({
      where,
      include: {
        options: { orderBy: { orderNumber: 'asc' } },
        chapter: { select: { id: true, title: true, chapterNumber: true } },
        room: { select: { id: true, name: true, gameType: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getQuestionById(id) {
    return prisma.question.findUnique({
      where: { id },
      include: {
        options: { orderBy: { orderNumber: 'asc' } },
        chapter: true,
        room: true,
      },
    });
  }
}

module.exports = new QuestionService();
