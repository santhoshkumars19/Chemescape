const topicService = require('../services/topicService');
const { createTopicSchema, updateTopicSchema } = require('../validators/topicValidator');

class TopicController {
  /**
   * GET /api/chapters/:chapterId/topics
   */
  async getTopicsByChapter(req, res, next) {
    try {
      const { chapterId } = req.params;
      const isTeacherOrAdmin = req.user && ['TEACHER', 'ADMIN'].includes(req.user.role);
      const topics = await topicService.getTopicsByChapter(chapterId, {
        includeInactive: isTeacherOrAdmin && req.query.includeInactive === 'true',
      });
      return res.status(200).json({
        success: true,
        message: 'Topics retrieved successfully',
        data: { topics },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/topics/:id
   */
  async getTopicById(req, res, next) {
    try {
      const { id } = req.params;
      const { chapterId } = req.query;
      const topic = await topicService.getTopicById(id, { chapterId });
      return res.status(200).json({
        success: true,
        message: 'Topic retrieved successfully',
        data: { topic },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/topics (Teacher / Admin only)
   */
  async createTopic(req, res, next) {
    try {
      const validatedData = createTopicSchema.parse(req.body);
      const topic = await topicService.createTopic(validatedData);
      return res.status(201).json({
        success: true,
        message: 'Topic created successfully',
        data: { topic },
      });
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          message: error.errors[0]?.message || 'Validation error',
          errors: error.errors,
        });
      }
      next(error);
    }
  }

  /**
   * PUT /api/topics/:id (Teacher / Admin only)
   */
  async updateTopic(req, res, next) {
    try {
      const { id } = req.params;
      const validatedData = updateTopicSchema.parse(req.body);
      const topic = await topicService.updateTopic(id, validatedData);
      return res.status(200).json({
        success: true,
        message: 'Topic updated successfully',
        data: { topic },
      });
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          message: error.errors[0]?.message || 'Validation error',
          errors: error.errors,
        });
      }
      next(error);
    }
  }

  /**
   * DELETE /api/topics/:id (Teacher / Admin only)
   */
  async deleteTopic(req, res, next) {
    try {
      const { id } = req.params;
      const result = await topicService.deleteTopic(id);
      return res.status(200).json({
        success: true,
        message: result.message || 'Topic archived successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TopicController();
