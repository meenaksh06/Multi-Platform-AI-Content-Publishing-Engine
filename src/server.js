require('dotenv').config();
const http = require('http');
const app = require('./app');
const config = require('./config');
const { initBot } = require('./modules/bot/bot.service');
const { connectRedis } = require('./config/redis');
const { initWorker } = require('./workers/publisher.worker');

const server = http.createServer(app);

const startServer = async () => {
  try {
    await connectRedis();
    initBot();
    initWorker(); // Initialize the BullMQ worker
    server.listen(config.port, () => {
      console.log(`Server is running on port ${config.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
