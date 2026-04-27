const dashboardService = require('./dashboard.service');
const sendResponse = require('../../utils/response');

const getMetrics = async (req, res, next) => {
  try {
    const metrics = await dashboardService.getMetrics(req.user.id);
    sendResponse(res, 200, metrics);
  } catch (error) {
    next(error);
  }
};

const getStatusList = async (req, res, next) => {
  try {
    const result = await dashboardService.getStatusList(req.user.id, req.query);
    sendResponse(res, 200, result.platformPosts, {
      total: result.total,
      page: result.page,
      limit: result.limit
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMetrics,
  getStatusList
};
