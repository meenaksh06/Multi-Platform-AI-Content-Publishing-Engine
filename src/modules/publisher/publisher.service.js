const publishToTwitter = async (accessToken, content) => {
  // Mock external API call to Twitter API v2
  console.log(`[Twitter API] Publishing tweet: "${content.substring(0, 30)}..."`);
  await new Promise((resolve) => setTimeout(resolve, 1500));
  
  // Simulate random API rate limit or network issue
  if (Math.random() < 0.1) throw new Error('Twitter API Rate Limit Exceeded');
  
  return { id: `tw_${Date.now()}`, url: `https://twitter.com/user/status/${Date.now()}` };
};

const publishToLinkedIn = async (accessToken, content) => {
  // Mock external API call to LinkedIn v2 API
  console.log(`[LinkedIn API] Publishing post: "${content.substring(0, 30)}..."`);
  await new Promise((resolve) => setTimeout(resolve, 2000));
  
  if (Math.random() < 0.1) throw new Error('LinkedIn API Timeout');
  
  return { id: `urn:li:share:${Date.now()}`, url: `https://linkedin.com/feed/update/urn:li:activity:${Date.now()}` };
};

const publishToInstagram = async (accessToken, content) => {
  console.log(`[Instagram API] Publishing media: "${content.substring(0, 30)}..."`);
  await new Promise((resolve) => setTimeout(resolve, 3000));
  return { id: `ig_${Date.now()}`, url: `https://instagram.com/p/random123` };
};

const publishToThreads = async (accessToken, content) => {
  console.log(`[Threads API] Publishing thread: "${content.substring(0, 30)}..."`);
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return { id: `th_${Date.now()}`, url: `https://threads.net/t/random123` };
};

const publishContent = async (platform, accessToken, content) => {
  switch (platform.toLowerCase()) {
    case 'twitter':
      return publishToTwitter(accessToken, content);
    case 'linkedin':
      return publishToLinkedIn(accessToken, content);
    case 'instagram':
      return publishToInstagram(accessToken, content);
    case 'threads':
      return publishToThreads(accessToken, content);
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
};

module.exports = {
  publishContent
};
