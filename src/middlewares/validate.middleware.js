const { ZodError } = require('zod');
const { AppError } = require('../utils/errors');

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      const errorMessage = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
      return next(new AppError(400, `Validation Error: ${errorMessage}`));
    }
    next(err);
  }
};

module.exports = validate;
