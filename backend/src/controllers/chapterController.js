const chapterService = require('../services/chapterService');

class ChapterController {
  async getChaptersByStandard(req, res, next) {
    try {
      const { standardId } = req.params;
      const chapters = await chapterService.getChaptersByStandard(standardId);
      return res.status(200).json({
        success: true,
        message: 'Chapters retrieved successfully',
        data: { chapters },
      });
    } catch (error) {
      next(error);
    }
  }

  async getChapterById(req, res, next) {
    try {
      const { chapterId } = req.params;
      const chapter = await chapterService.getChapterById(chapterId);
      return res.status(200).json({
        success: true,
        message: 'Chapter details retrieved successfully',
        data: { chapter },
      });
    } catch (error) {
      next(error);
    }
  }

  async createChapter(req, res, next) {
    try {
      const chapter = await chapterService.createChapter(req.body);
      return res.status(201).json({
        success: true,
        message: 'Chapter created successfully',
        data: { chapter },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateChapter(req, res, next) {
    try {
      const { id } = req.params;
      const chapter = await chapterService.updateChapter(id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Chapter updated successfully',
        data: { chapter },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ChapterController();
