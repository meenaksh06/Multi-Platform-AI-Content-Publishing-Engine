require('dotenv').config();
const http = require('http');
const app = require('./app');
const config = require('./config');
const { initBot } = require('./modules/bot/bot.service');

const server = http.createServer(app);

// Initialize Telegram Bot
initBot();

server.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
