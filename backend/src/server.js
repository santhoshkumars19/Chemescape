const app = require('./app');
const prisma = require('./config/db');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Attempt DB connection check
    await prisma.$connect();
    console.log('[DATABASE] MySQL database connection established successfully.');

    app.listen(PORT, () => {
      console.log(`==================================================`);
      console.log(`🚀 ChemEscape API Server is running`);
      console.log(`🌐 Server URL: http://localhost:${PORT}`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`==================================================`);
    });
  } catch (error) {
    console.warn('[DATABASE] Database connection warning:', error.message);
    app.listen(PORT, () => {
      console.log(`==================================================`);
      console.log(`🚀 ChemEscape API Server is running (DB Warning)`);
      console.log(`🌐 Server URL: http://localhost:${PORT}`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`==================================================`);
    });
  }
}

// Graceful shutdown handling
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('[SERVER] Prisma disconnected. Server shutting down.');
  process.exit(0);
});

startServer();
