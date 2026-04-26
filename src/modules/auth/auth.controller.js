const authService = require('./auth.service');
const sendResponse = require('../../utils/response');

const register = async (req, res, next) => {
  try {
    const { user, tokens } = await authService.register(req.body.email, req.body.password);
    
    const userData = { id: user.id, email: user.email };
    sendResponse(res, 201, { user: userData, tokens });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { user, tokens } = await authService.login(req.body.email, req.body.password);
    
    const userData = { id: user.id, email: user.email };
    sendResponse(res, 200, { user: userData, tokens });
  } catch (err) {
    next(err);
  }
};

const refreshTokens = async (req, res, next) => {
  try {
    const { tokens } = await authService.refreshTokens(req.body.refreshToken);
    sendResponse(res, 200, { tokens });
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    await authService.logout(req.user.id);
    sendResponse(res, 204);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  refreshTokens,
  logout
};
