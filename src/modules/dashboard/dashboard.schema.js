const { z } = require('zod');

const getStatusList = z.object({
  query: z.object({
    status: z.enum(['PENDING', 'PUBLISHING', 'PUBLISHED', 'FAILED']).optional(),
    platform: z.enum(['twitter', 'linkedin', 'instagram', 'threads']).optional(),
    page: z.string().regex(/^\\d+$/).optional().transform(Number),
    limit: z.string().regex(/^\\d+$/).optional().transform(Number)
  })
});

module.exports = {
  getStatusList
};
