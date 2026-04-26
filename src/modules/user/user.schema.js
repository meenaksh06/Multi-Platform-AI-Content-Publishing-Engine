const { z } = require('zod');

const addSocialAccount = z.object({
  body: z.object({
    platform: z.enum(['twitter', 'linkedin', 'instagram', 'threads']),
    accessToken: z.string(),
    refreshToken: z.string().optional(),
    expiresAt: z.string().datetime().optional()
  })
});

const removeSocialAccount = z.object({
  params: z.object({
    platform: z.enum(['twitter', 'linkedin', 'instagram', 'threads'])
  })
});

module.exports = {
  addSocialAccount,
  removeSocialAccount
};
