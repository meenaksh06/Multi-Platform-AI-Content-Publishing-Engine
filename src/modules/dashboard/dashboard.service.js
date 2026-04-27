const prisma = require('../../config/db');

const getMetrics = async (userId) => {
  // Aggregate counts of platformPosts by status for this user
  // Since platformPosts don't directly have userId, we join through the post
  const statusCounts = await prisma.platformPost.groupBy({
    by: ['status'],
    where: {
      post: {
        userId
      }
    },
    _count: {
      status: true
    }
  });

  const totalPosts = await prisma.post.count({
    where: { userId }
  });

  const formattedStatusCounts = statusCounts.reduce((acc, curr) => {
    acc[curr.status] = curr._count.status;
    return acc;
  }, { PENDING: 0, PUBLISHING: 0, PUBLISHED: 0, FAILED: 0 });

  return {
    totalParentPosts: totalPosts,
    platformStatusDistribution: formattedStatusCounts
  };
};

const getStatusList = async (userId, filters) => {
  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const skip = (page - 1) * limit;

  const whereClause = {
    post: { userId }
  };

  if (filters.status) {
    whereClause.status = filters.status;
  }
  if (filters.platform) {
    whereClause.platform = filters.platform;
  }

  const [platformPosts, total] = await Promise.all([
    prisma.platformPost.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        post: {
          select: { idea: true, tone: true }
        }
      }
    }),
    prisma.platformPost.count({ where: whereClause })
  ]);

  return { platformPosts, total, page, limit };
};

module.exports = {
  getMetrics,
  getStatusList
};
