const prisma = require('../../config/db');
const { AppError } = require('../../utils/errors');

const getUserProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      createdAt: true,
      socialAccounts: {
        select: {
          id: true,
          platform: true,
          expiresAt: true,
          updatedAt: true
        }
      },
      aiKeys: {
        select: {
          id: true,
          provider: true,
          updatedAt: true
        }
      }
    }
  });
  
  if (!user) throw new AppError(404, 'User not found');
  return user;
};

const upsertSocialAccount = async (userId, data) => {
  const { platform, accessToken, refreshToken, expiresAt } = data;
  
  return prisma.socialAccount.upsert({
    where: {
      userId_platform: {
        userId,
        platform
      }
    },
    update: {
      accessToken,
      refreshToken,
      expiresAt: expiresAt ? new Date(expiresAt) : null
    },
    create: {
      userId,
      platform,
      accessToken,
      refreshToken,
      expiresAt: expiresAt ? new Date(expiresAt) : null
    }
  });
};

const removeSocialAccount = async (userId, platform) => {
  try {
    await prisma.socialAccount.delete({
      where: {
        userId_platform: {
          userId,
          platform
        }
      }
    });
  } catch (error) {
    throw new AppError(404, `Social account for ${platform} not found`);
  }
};

module.exports = {
  getUserProfile,
  upsertSocialAccount,
  removeSocialAccount
};
