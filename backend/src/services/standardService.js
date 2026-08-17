const prisma = require('../config/db');

class StandardService {
  async getAllStandards() {
    return prisma.standard.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        displayName: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getStandardById(id) {
    const standard = await prisma.standard.findUnique({
      where: { id },
    });
    if (!standard) {
      const error = new Error('Standard not found');
      error.statusCode = 404;
      throw error;
    }
    return standard;
  }
}

module.exports = new StandardService();
