const { Worker } = require('bullmq');
const config = require('../config');
const prisma = require('../config/db');
const { publishContent } = require('../modules/publisher/publisher.service');

const initWorker = () => {
  const worker = new Worker('publishing-queue', async (job) => {
    const { platformPostId, platform, content } = job.data;
    
    console.log(`[Worker] Processing job ${job.id} for platform: ${platform}`);
    
    // Track status: PUBLISHING
    await prisma.platformPost.update({
      where: { id: platformPostId },
      data: { status: 'PUBLISHING', jobId: job.id || 'unknown' }
    });

    // 1. Fetch parent post to identify the User ID
    const platformPost = await prisma.platformPost.findUnique({
      where: { id: platformPostId },
      include: { post: true }
    });

    if (!platformPost) {
      throw new Error('PlatformPost record not found in database.');
    }

    // 2. Fetch the user's social account credentials for the platform
    const socialAccount = await prisma.socialAccount.findUnique({
      where: {
        userId_platform: {
          userId: platformPost.post.userId,
          platform: platform.toLowerCase()
        }
      }
    });

    if (!socialAccount || !socialAccount.accessToken) {
      throw new Error(`User has not linked their ${platform} account. Unauthorized.`);
    }

    // 3. Delegate to the Publisher Pipeline
    const publishResult = await publishContent(platform, socialAccount.accessToken, content);

    // 4. Track status: PUBLISHED
    await prisma.platformPost.update({
      where: { id: platformPostId },
      data: { 
        status: 'PUBLISHED', 
        publishedAt: new Date(),
        error: null // clear any previous retry errors
      }
    });
    
    return publishResult;
  }, {
    connection: { url: config.redis.url },
    concurrency: 5
  });

  worker.on('completed', (job, returnvalue) => {
    console.log(`[Worker] Job ${job.id} completed successfully. Return:`, returnvalue);
  });

  worker.on('failed', async (job, err) => {
    console.error(`[Worker] Job ${job.id} failed with error: ${err.message} (Attempt ${job.attemptsMade})`);
    
    // The worker automatically retries if attemptsMade < max attempts
    // If it's exhausted, mark it FAILED in DB
    if (job.attemptsMade >= job.opts.attempts) {
      console.error(`[Worker] Job ${job.id} exhausted all retries. Marking as FAILED.`);
      await prisma.platformPost.update({
        where: { id: job.data.platformPostId },
        data: { status: 'FAILED', error: err.message }
      });
    }
  });
};

module.exports = {
  initWorker
};
