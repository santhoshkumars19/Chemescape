const prisma = require('../config/db');

class TopicService {
  async getTopicsByChapter(chapterId) {
    return prisma.topic.findMany({
      where: { chapterId },
      orderBy: { orderNumber: 'asc' },
    });
  }

  async createTopic(data) {
    return prisma.topic.create({
      data,
    });
  }
}

module.exports = new TopicService();
