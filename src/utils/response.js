const sendResponse = (res, statusCode, data = null, meta = null, error = null) => {
  return res.status(statusCode).json({
    data,
    meta,
    error
  });
};

module.exports = sendResponse;
