const roomService = require('../services/roomService');

class RoomController {
  async getRoomsByChapter(req, res, next) {
    try {
      const { chapterId } = req.params;
      const rooms = await roomService.getRoomsByChapter(chapterId);
      return res.status(200).json({
        success: true,
        message: 'Rooms retrieved successfully',
        data: { rooms },
      });
    } catch (error) {
      next(error);
    }
  }

  async createRoom(req, res, next) {
    try {
      const room = await roomService.createRoom(req.body);
      return res.status(201).json({
        success: true,
        message: 'Room created successfully',
        data: { room },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RoomController();
