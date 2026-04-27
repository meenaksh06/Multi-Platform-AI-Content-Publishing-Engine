const { Queue } = require('bullmq');
const config = require('../../config');

const publishingQueue = new Queue('publishing-queue', {
  connection: {
    url: config.redis.url
  }
});

const enqueuePlatformPost = async (platformPostId, platform, content) => {
  await publishingQueue.add(
    `publish-${platform}`, 
    { platformPostId, platform, content },
    {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000 // 2s, 4s, 8s
      }
    }
  );
};

module.exports = {
  publishingQueue,
  enqueuePlatformPost
};
