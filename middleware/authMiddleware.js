const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Checks if user is logged in via JWT token
const protect = async (req, res, next) => {
  try {
    let token;

    // Get token from Authorization header
    if (req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // No token found
    if (!token) {
      return res.status(401).json({
        message: 'Not authorized, no token'
      });
    }

    // Verify token is valid
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    req.user = await User.findById(decoded.id).select('-password');

    // Check if user is blocked
    if (req.user.isBlocked) {
      return res.status(403).json({
        message: 'Your account has been blocked'
      });
    }

    next();

  } catch (error) {
    res.status(401).json({
      message: 'Not authorized, token failed'
    });
  }
};

module.exports = { protect };