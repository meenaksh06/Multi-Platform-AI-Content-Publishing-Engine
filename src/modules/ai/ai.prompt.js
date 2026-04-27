const buildPrompt = (type, platform, tone, idea) => {
  let platformConstraint = '';

  switch (platform.toLowerCase()) {
    case 'twitter':
      platformConstraint = 'Must be under 280 characters. Keep it punchy and engaging.';
      break;
    case 'linkedin':
      platformConstraint = 'Tone must be strictly professional. Avoid overly casual language or slang.';
      break;
    case 'instagram':
      platformConstraint = 'Include exactly 10-15 relevant hashtags at the end.';
      break;
    case 'threads':
      platformConstraint = 'Must be under 500 characters. Conversational style preferred.';
      break;
    default:
      platformConstraint = 'Optimize for engagement.';
      break;
  }

  const prompt = `
You are an expert social media manager and content creator.
Your task is to write a ${type} for ${platform}.

User's Idea: "${idea}"
Requested Tone: ${tone}

Strict Platform Rules:
${platformConstraint}

Return ONLY the raw content ready for publishing. Do not wrap in quotes or add intro/outro text.
`;

  return prompt.trim();
};

module.exports = {
  buildPrompt
};
