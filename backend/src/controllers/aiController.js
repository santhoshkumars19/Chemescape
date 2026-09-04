/**
 * EduNova AI Assistant Controller
 * Handles POST /api/ai/assistant requests
 * Derives userId strictly from req.user.id (verified JWT)
 */

const aiAssistantService = require('../services/ai/aiAssistantService');

class AIController {
  async askAssistant(req, res, next) {
    try {
      const userId = req.user.id;
      const { question, mode, standardId, subjectId, chapterId, topicId } = req.body || {};

      if (!question || typeof question !== 'string' || question.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Question parameter is required.'
        });
      }

      const result = await aiAssistantService.processQuery({
        userId,
        question,
        mode: mode || 'CURRENT_CHAPTER',
        standardId,
        subjectId,
        chapterId,
        topicId
      });

      return res.status(200).json({
        success: true,
        message: 'AI Assistant response generated',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AIController();
