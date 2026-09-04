const activityReportService = require('../services/activityReportService');

class ReportController {
  /**
   * GET /api/reports
   * Accessible only to TEACHER and ADMIN roles
   */
  async getAllActivityReports(req, res, next) {
    try {
      const {
        standard,
        subject,
        chapter,
        gameOrQuiz,
        status,
        search,
        date,
        userId,
        page = 1,
        limit = 50,
      } = req.query;

      const filtered = activityReportService.getReports({
        standard,
        subject,
        chapter,
        gameOrQuiz,
        status,
        search,
        date,
        userId,
      });

      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.max(1, Math.min(200, parseInt(limit, 10) || 50));
      const total = filtered.length;
      const totalPages = Math.ceil(total / limitNum) || 1;
      const startIndex = (pageNum - 1) * limitNum;
      const paginated = filtered.slice(startIndex, startIndex + limitNum);

      const stats = activityReportService.getStats();

      return res.status(200).json({
        success: true,
        message: 'User activity reports retrieved successfully',
        data: {
          reports: paginated,
          total,
          page: pageNum,
          limit: limitNum,
          totalPages,
          stats,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/reports/stats
   * Accessible only to TEACHER and ADMIN roles
   */
  async getReportStats(req, res, next) {
    try {
      const stats = activityReportService.getStats();
      return res.status(200).json({
        success: true,
        data: { stats },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/reports/user/:userId
   * Retrieve full quiz/game activity history for a specific registered user
   * Accessible only to TEACHER and ADMIN roles
   */
  async getUserActivityHistory(req, res, next) {
    try {
      const { userId } = req.params;
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'userId parameter is required',
        });
      }

      const userHistory = activityReportService.getUserHistory(userId);
      return res.status(200).json({
        success: true,
        message: 'User activity history retrieved successfully',
        data: { userHistory },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/reports/excel
   * Download the complete user activity Excel report (.xlsx)
   * Accessible only to TEACHER and ADMIN roles
   */
  async exportExcelReport(req, res, next) {
    try {
      const { standard, subject, chapter, gameOrQuiz, status, search, date, userId } = req.query;

      const buffer = activityReportService.generateExcelBuffer({
        standard,
        subject,
        chapter,
        gameOrQuiz,
        status,
        search,
        date,
        userId,
      });

      const filename = userId
        ? `EduNova_User_${userId}_Activity_Report_${Date.now()}.xlsx`
        : `EduNova_User_Activity_Report_${Date.now()}.xlsx`;

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', buffer.length);

      return res.send(buffer);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/reports/activity
   * Log user activity from client completion
   */
  async logUserActivity(req, res, next) {
    try {
      const user = req.user || {};
      const {
        name,
        userId,
        standard,
        subject,
        chapter,
        gameOrQuizName,
        points,
        accuracy,
        totalQuestions,
        correctAnswers,
        wrongAnswers,
        timeSpentSec,
        status,
      } = req.body;

      const logged = activityReportService.logActivity({
        userId: userId || user.id,
        name: name || user.name,
        standard,
        subject,
        chapter,
        gameOrQuizName,
        points,
        accuracy,
        totalQuestions,
        correctAnswers,
        wrongAnswers,
        timeSpentSec,
        status,
      });

      return res.status(201).json({
        success: true,
        message: 'User activity logged successfully',
        data: { activity: logged },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReportController();
