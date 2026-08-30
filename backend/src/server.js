const app = require('./app');
const prisma = require('./config/db');

const PORT = process.env.PORT || 5000;

async function startServer() {
  app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`🚀 ChemEscape API Server is running`);
    console.log(`🌐 Server URL: http://localhost:${PORT}`);
    console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`==================================================`);
  });

  // Attempt DB connection check asynchronously
  prisma.$connect()
    .then(() => {
      console.log('[DATABASE] MySQL database connection established successfully.');
    })
    .catch((error) => {
      console.warn('[DATABASE] Database connection warning:', error.message);
    });
}

// Graceful shutdown handling
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('[SERVER] Prisma disconnected. Server shutting down.');
  process.exit(0);
});

startServer();
