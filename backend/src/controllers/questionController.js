const questionService = require('../services/questionService');

class QuestionController {
  async getQuestionsByRoom(req, res, next) {
    try {
      const { roomId } = req.params;
      // If request is from TEACHER or ADMIN, return full solution details, otherwise sanitize for STUDENT
      const isStudentView = !req.user || req.user.role === 'STUDENT';
      const questions = await questionService.getQuestionsByRoom(roomId, isStudentView);
      return res.status(200).json({
        success: true,
        message: 'Questions retrieved successfully',
        data: { questions },
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllQuestions(req, res, next) {
    try {
      const questions = await questionService.getAllQuestions(req.query);
      return res.status(200).json({
        success: true,
        data: { questions },
      });
    } catch (error) {
      next(error);
    }
  }

  async getQuestionById(req, res, next) {
    try {
      const { id } = req.params;
      const question = await questionService.getQuestionById(id);
      return res.status(200).json({
        success: true,
        data: { question },
      });
    } catch (error) {
      next(error);
    }
  }

  async createQuestion(req, res, next) {
    try {
      const question = await questionService.createQuestion(req.body);
      return res.status(201).json({
        success: true,
        message: 'Question created successfully',
        data: { question },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateQuestion(req, res, next) {
    try {
      const { id } = req.params;
      const question = await questionService.updateQuestion(id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Question updated successfully',
        data: { question },
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteQuestion(req, res, next) {
    try {
      const { id } = req.params;
      await questionService.deleteQuestion(id);
      return res.status(200).json({
        success: true,
        message: 'Question deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new QuestionController();
