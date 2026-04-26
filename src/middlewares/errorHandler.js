const config = require('../config');
const { AppError } = require('../utils/errors');
const sendResponse = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof AppError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    error = new AppError(statusCode, message, false, err.stack);
  }

  const { statusCode, message } = error;

  const responseError = {
    code: statusCode,
    message,
    ...(config.env === 'development' && { stack: error.stack }),
  };

  sendResponse(res, statusCode, null, null, responseError);
};

module.exports = errorHandler;
