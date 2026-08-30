const questionService = require('../services/questionService');
const { createQuestionSchema, updateQuestionSchema } = require('../validators/questionValidator');

class QuestionController {
  /**
   * GET /api/rooms/:roomId/questions
   * Available to Students (sanitized) and Teachers/Admins (full solution details)
   */
  async getQuestionsByRoom(req, res, next) {
    try {
      const { roomId } = req.params;
      const { standardId, subjectId, chapterId } = req.query;
      const isStudentView = !req.user || req.user.role === 'STUDENT';
      const questions = await questionService.getQuestionsByRoom(roomId, isStudentView, { standardId, subjectId, chapterId });
      return res.status(200).json({
        success: true,
        message: 'Questions retrieved successfully',
        data: { questions },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/questions (Teacher / Admin management search & listing)
   */
  async getAllQuestions(req, res, next) {
    try {
      const isStudentView = !req.user || req.user.role === 'STUDENT';
      const questions = await questionService.getAllQuestions(req.query, isStudentView);
      return res.status(200).json({
        success: true,
        message: 'Questions retrieved successfully',
        data: { questions },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/questions/:id
   */
  async getQuestionById(req, res, next) {
    try {
      const { id } = req.params;
      const { roomId, chapterId } = req.query;
      const isStudentView = !req.user || req.user.role === 'STUDENT';
      const question = await questionService.getQuestionById(id, { roomId, chapterId, isStudentView });
      return res.status(200).json({
        success: true,
        message: 'Question retrieved successfully',
        data: { question },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/questions (Teacher / Admin only)
   */
  async createQuestion(req, res, next) {
    try {
      const validatedData = createQuestionSchema.parse(req.body);
      const question = await questionService.createQuestion(validatedData);
      return res.status(201).json({
        success: true,
        message: 'Question created successfully',
        data: { question },
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
   * PUT /api/questions/:id (Teacher / Admin only)
   */
  async updateQuestion(req, res, next) {
    try {
      const { id } = req.params;
      const validatedData = updateQuestionSchema.parse(req.body);
      const question = await questionService.updateQuestion(id, validatedData);
      return res.status(200).json({
        success: true,
        message: 'Question updated successfully',
        data: { question },
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
   * DELETE /api/questions/:id (Teacher / Admin only)
   */
  async deleteQuestion(req, res, next) {
    try {
      const { id } = req.params;
      const result = await questionService.deleteQuestion(id);
      return res.status(200).json({
        success: true,
        message: result.message || 'Question archived successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new QuestionController();
