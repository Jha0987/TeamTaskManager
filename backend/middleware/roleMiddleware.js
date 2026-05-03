const AppError = require('../utils/AppError');

/**
 * Role-based access control middleware factory.
 * Usage: roleMiddleware('Admin') or roleMiddleware('Admin', 'Member')
 */
const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access denied. This action requires one of the following roles: ${allowedRoles.join(', ')}.`,
          403
        )
      );
    }

    next();
  };
};

module.exports = roleMiddleware;
