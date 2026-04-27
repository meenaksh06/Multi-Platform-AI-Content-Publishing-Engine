const { Worker } = require('bullmq');
const config = require('../config');
const prisma = require('../config/db');

const initWorker = () => {
  const worker = new Worker('publishing-queue', async (job) => {
    const { platformPostId, platform, content } = job.data;
    
    console.log(`[Worker] Processing job ${job.id} for platform: ${platform}`);
    
    await prisma.platformPost.update({
      where: { id: platformPostId },
      data: { status: 'PUBLISHING', jobId: job.id || 'unknown' }
    });

    // Mock API request delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mocking an occasional failure to test the retry mechanism
    if (Math.random() < 0.2) {
      throw new Error(`[Mock] Temporary network timeout connecting to ${platform}`);
    }

    // Mark as published
    await prisma.platformPost.update({
      where: { id: platformPostId },
      data: { status: 'PUBLISHED', publishedAt: new Date() }
    });
    
  }, {
    connection: { url: config.redis.url },
    concurrency: 5
  });

  worker.on('completed', (job) => {
    console.log(`[Worker] Job ${job.id} completed successfully`);
  });

  worker.on('failed', async (job, err) => {
    console.error(`[Worker] Job ${job.id} failed with error: ${err.message} (Attempt ${job.attemptsMade})`);
    
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
