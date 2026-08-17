const prisma = require('../config/db');

class ChapterService {
  async getChaptersByStandard(standardId) {
    let standard = await prisma.standard.findFirst({
      where: {
        OR: [{ id: standardId }, { name: standardId }],
      },
    });

    if (!standard) {
      const error = new Error('Standard not found');
      error.statusCode = 404;
      throw error;
    }

    return prisma.chapter.findMany({
      where: { standardId: standard.id },
      orderBy: { chapterNumber: 'asc' },
      include: {
        subject: {
          select: { id: true, name: true, code: true, icon: true },
        },
      },
    });
  }

  async getChapterById(chapterId) {
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: {
        standard: { select: { id: true, name: true, displayName: true } },
        subject: { select: { id: true, name: true, code: true, icon: true } },
      },
    });

    if (!chapter) {
      const error = new Error('Chapter not found');
      error.statusCode = 404;
      throw error;
    }

    return chapter;
  }

  async createChapter(data) {
    return prisma.chapter.create({
      data,
    });
  }

  async updateChapter(chapterId, data) {
    await this.getChapterById(chapterId);
    return prisma.chapter.update({
      where: { id: chapterId },
      data,
    });
  }
}

module.exports = new ChapterService();
