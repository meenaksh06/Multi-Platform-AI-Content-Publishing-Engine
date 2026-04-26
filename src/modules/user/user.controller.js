const userService = require('./user.service');
const sendResponse = require('../../utils/response');

const getProfile = async (req, res, next) => {
  try {
    const profile = await userService.getUserProfile(req.user.id);
    sendResponse(res, 200, profile);
  } catch (error) {
    next(error);
  }
};

const addSocialAccount = async (req, res, next) => {
  try {
    const account = await userService.upsertSocialAccount(req.user.id, req.body);
    // Don't leak access tokens in the response
    const { accessToken, refreshToken, ...safeAccount } = account;
    sendResponse(res, 201, safeAccount);
  } catch (error) {
    next(error);
  }
};

const removeSocialAccount = async (req, res, next) => {
  try {
    await userService.removeSocialAccount(req.user.id, req.params.platform);
    sendResponse(res, 204);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  addSocialAccount,
  removeSocialAccount
};
