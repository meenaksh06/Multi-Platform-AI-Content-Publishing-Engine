const { z } = require('zod');

const createPost = z.object({
  body: z.object({
    idea: z.string().optional(),
    tone: z.string().optional(),
    platforms: z.array(z.object({
      platform: z.enum(['twitter', 'linkedin', 'instagram', 'threads']),
      content: z.string()
    })).min(1)
  })
});

const getPost = z.object({
  params: z.object({
    id: z.string().uuid()
  })
});

module.exports = {
  createPost,
  getPost
};
