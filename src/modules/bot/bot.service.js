const { Telegraf } = require('telegraf');
const config = require('../../config');
const { redisClient } = require('../../config/redis');
const { generateContent } = require('../ai/ai.service');

let bot;

const getSession = async (userId) => {
  const data = await redisClient.get(`bot:session:${userId}`);
  return data ? JSON.parse(data) : null;
};

const setSession = async (userId, session) => {
  await redisClient.set(`bot:session:${userId}`, JSON.stringify(session), { EX: 1800 }); // 30 min timeout
};

const clearSession = async (userId) => {
  await redisClient.del(`bot:session:${userId}`);
};

const initBot = () => {
  if (!config.telegram.botToken) {
    console.warn('Telegram bot token not provided. Bot is disabled.');
    return;
  }

  bot = new Telegraf(config.telegram.botToken);

  bot.start(async (ctx) => {
    await clearSession(ctx.from.id);
    ctx.reply('Welcome to the AI Content Publishing Engine! Use /newpost to start creating content.');
  });

  bot.command('cancel', async (ctx) => {
    await clearSession(ctx.from.id);
    ctx.reply('Current operation cancelled.');
  });

  bot.command('newpost', async (ctx) => {
    await setSession(ctx.from.id, { state: 'AWAITING_TYPE', data: {} });
    ctx.reply('Let\\'s craft a new post! First, what type of content is this? (e.g., Thread, Post, Article)');
  });

  bot.on('text', async (ctx) => {
    const userId = ctx.from.id;
    const session = await getSession(userId);

    if (!session) {
      return ctx.reply('I did not understand that. Use /newpost to start or /help to see commands.');
    }

    const text = ctx.message.text.trim();

    switch (session.state) {
      case 'AWAITING_TYPE':
        session.data.type = text;
        session.state = 'AWAITING_PLATFORM';
        await setSession(userId, session);
        return ctx.reply(`Got it. Type: ${text}.\nWhich platform? (e.g., Twitter, LinkedIn, Instagram)`);

      case 'AWAITING_PLATFORM':
        session.data.platform = text;
        session.state = 'AWAITING_TONE';
        await setSession(userId, session);
        return ctx.reply(`Platform set to: ${text}.\nWhat tone should I use? (e.g., Professional, Casual, Witty)`);

      case 'AWAITING_TONE':
        session.data.tone = text;
        session.state = 'AWAITING_MODEL';
        await setSession(userId, session);
        return ctx.reply(`Tone: ${text}.\nWhich AI model do you prefer? (OpenAI or Anthropic)`);

      case 'AWAITING_MODEL':
        session.data.model = text;
        session.state = 'AWAITING_IDEA';
        await setSession(userId, session);
        return ctx.reply(`Model: ${text}.\nGreat! Now, describe your idea or topic in a few sentences.`);

      case 'AWAITING_IDEA':
        session.data.idea = text;
        
        ctx.reply('Generating your content... Please wait ⏳');

        try {
          const generatedContent = await generateContent(userId, {
            type: session.data.type,
            platform: session.data.platform,
            tone: session.data.tone,
            model: session.data.model,
            idea: session.data.idea
          });
          
          session.data.generatedContent = generatedContent;
          session.state = 'AWAITING_CONFIRM';
          await setSession(userId, session);

          return ctx.reply(`Here is a preview of your post:\n\n${generatedContent}\n\nDo you want to publish this? (reply 'yes' or 'no')`);
        } catch (error) {
          await clearSession(userId);
          return ctx.reply(`Error generating content: ${error.message}. Please try /newpost again.`);
        }

      case 'AWAITING_CONFIRM':
        if (text.toLowerCase() === 'yes') {
          // In Phase 8/9/10 we will save to DB and send to Queue.
          await clearSession(userId);
          return ctx.reply('Awesome! Your post has been scheduled for publishing. 🚀');
        } else if (text.toLowerCase() === 'no') {
          await clearSession(userId);
          return ctx.reply('Post discarded. You can start over with /newpost.');
        } else {
          return ctx.reply('Please reply with "yes" or "no".');
        }

      default:
        await clearSession(userId);
        return ctx.reply('Something went wrong. Please start over with /newpost.');
    }
  });

  bot.launch()
    .then(() => console.log('Telegram bot started successfully'))
    .catch((err) => console.error('Failed to start Telegram bot:', err));

  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
};

const getBot = () => bot;

module.exports = {
  initBot,
  getBot
};
