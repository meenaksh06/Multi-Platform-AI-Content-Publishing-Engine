require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',
  jwt: {
    secret: process.env.JWT_SECRET || 'supersecretkey',
    accessExpiration: '15m',
    refreshExpiration: '7d'
  },
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  },
  ai: {
    openaiKey: process.env.OPENAI_API_KEY,
    anthropicKey: process.env.ANTHROPIC_API_KEY
  }
};
