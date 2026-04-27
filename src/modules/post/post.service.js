const prisma = require('../../config/db');
const { AppError } = require('../../utils/errors');

const createPost = async (userId, data) => {
  const { idea, tone, platforms } = data;

  const post = await prisma.post.create({
    data: {
      userId,
      idea,
      tone,
      platformPosts: {
        create: platforms.map(p => ({
          platform: p.platform,
          content: p.content,
          status: 'PENDING'
        }))
      }
    },
    include: {
      platformPosts: true
    }
  });

  return post;
};

const getPosts = async (userId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where: { userId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        platformPosts: {
          select: { id: true, platform: true, status: true }
        }
      }
    }),
    prisma.post.count({ where: { userId } })
  ]);

  return { posts, total, page, limit };
};

const getPostById = async (userId, postId) => {
  const post = await prisma.post.findFirst({
    where: { id: postId, userId },
    include: {
      platformPosts: true
    }
  });

  if (!post) {
    throw new AppError(404, 'Post not found');
  }

  return post;
};

module.exports = {
  createPost,
  getPosts,
  getPostById
};
