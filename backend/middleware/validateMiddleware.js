const { validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

/**
 * Runs after express-validator chains.
 * Collects all errors and sends a 422 response if any exist.
 */
const validateMiddleware = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const messages = errors.array().map((err) => `${err.path}: ${err.msg}`);
    return next(new AppError(`Validation failed: ${messages.join('. ')}`, 422));
  }

  next();
};

module.exports = validateMiddleware;
