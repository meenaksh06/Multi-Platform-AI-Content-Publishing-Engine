const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');
const prisma = require('../../config/db');
const config = require('../../config');
const { buildPrompt } = require('./ai.prompt');
const { AppError } = require('../../utils/errors');

const getApiKey = async (userId, provider) => {
  // Check if user has provided their own API key
  const userKey = await prisma.aiKey.findUnique({
    where: { userId_provider: { userId, provider } }
  });

  if (userKey && userKey.apiKey) {
    return userKey.apiKey;
  }

  // Fallback to system default if available
  const systemKey = provider === 'openai' ? config.ai.openaiKey : config.ai.anthropicKey;
  if (!systemKey) {
    throw new AppError(400, `No API key available for ${provider}`);
  }

  return systemKey;
};

const generateWithOpenAI = async (apiKey, prompt) => {
  const openai = new OpenAI({ apiKey });
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4o', // or gpt-4-turbo
    messages: [
      { role: 'system', content: 'You are a highly skilled social media ghostwriter.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
  });

  return response.choices[0].message.content.trim();
};

const generateWithAnthropic = async (apiKey, prompt) => {
  const anthropic = new Anthropic({ apiKey });

  const response = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307', // or claude-3-opus
    max_tokens: 1024,
    temperature: 0.7,
    system: 'You are a highly skilled social media ghostwriter.',
    messages: [
      { role: 'user', content: prompt }
    ]
  });

  return response.content[0].text.trim();
};

const generateContent = async (userId, params) => {
  const { type, platform, tone, model, idea } = params;

  const provider = model.toLowerCase().includes('anthropic') || model.toLowerCase().includes('claude') 
    ? 'anthropic' 
    : 'openai';

  const apiKey = await getApiKey(userId, provider);
  const prompt = buildPrompt(type, platform, tone, idea);

  if (provider === 'openai') {
    return generateWithOpenAI(apiKey, prompt);
  } else {
    return generateWithAnthropic(apiKey, prompt);
  }
};

module.exports = {
  generateContent
};
