const { Telegraf } = require('telegraf');
const config = require('../../config');

let bot;

const initBot = () => {
  if (!config.telegram.botToken) {
    console.warn('Telegram bot token not provided. Bot is disabled.');
    return;
  }

  bot = new Telegraf(config.telegram.botToken);

  // Basic Commands
  bot.start((ctx) => {
    ctx.reply('Welcome to the AI Content Publishing Engine! Use /help to see available commands.');
  });

  bot.help((ctx) => {
    ctx.reply(
      'Available commands:\n' +
      '/start - Start the bot\n' +
      '/help - Show this help message\n' +
      '/newpost - Start a new post creation flow (Coming Soon)'
    );
  });

  bot.command('newpost', (ctx) => {
    ctx.reply('This feature is currently under construction. Stay tuned for Phase 6!');
  });

  // Catch-all for unrecognized messages
  bot.on('text', (ctx) => {
    ctx.reply('I did not understand that. Type /help to see what I can do.');
  });

  bot.launch()
    .then(() => console.log('Telegram bot started successfully'))
    .catch((err) => console.error('Failed to start Telegram bot:', err));

  // Enable graceful stop
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
};

const getBot = () => bot;

module.exports = {
  initBot,
  getBot
};
