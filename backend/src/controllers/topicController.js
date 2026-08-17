const topicService = require('../services/topicService');

class TopicController {
  async getTopicsByChapter(req, res, next) {
    try {
      const { chapterId } = req.params;
      const topics = await topicService.getTopicsByChapter(chapterId);
      return res.status(200).json({
        success: true,
        message: 'Topics retrieved successfully',
        data: { topics },
      });
    } catch (error) {
      next(error);
    }
  }

  async createTopic(req, res, next) {
    try {
      const topic = await topicService.createTopic(req.body);
      return res.status(201).json({
        success: true,
        message: 'Topic created successfully',
        data: { topic },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TopicController();
