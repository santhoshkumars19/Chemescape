const prisma = require('../config/db');

class RoomService {
  async getRoomsByChapter(chapterId) {
    return prisma.room.findMany({
      where: { chapterId },
      orderBy: { orderNumber: 'asc' },
    });
  }

  async getRoomById(roomId) {
    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      const error = new Error('Room not found');
      error.statusCode = 404;
      throw error;
    }

    return room;
  }

  async createRoom(data) {
    return prisma.room.create({
      data,
    });
  }
}

module.exports = new RoomService();
