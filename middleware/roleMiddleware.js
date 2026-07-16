// Checks if logged in user has required role
// This runs AFTER authMiddleware (user must be logged in first)

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // Check if user's role is in allowed roles list
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied! Only ${roles.join(', ')} can access this route`
      });
    }
    next();
  };
};

module.exports = { authorizeRoles };