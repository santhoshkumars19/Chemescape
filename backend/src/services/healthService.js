const prisma = require('../config/db');

class HealthService {
  async getHealthStatus() {
    let database = 'disconnected';
    try {
      await prisma.$queryRaw`SELECT 1`;
      database = 'connected';
    } catch (err) {
      database = 'error';
    }

    return {
      status: 'healthy',
      database,
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = new HealthService();
