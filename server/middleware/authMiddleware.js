const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'todo_jwt_secret_dev_key_2026');

      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User no longer exists or authorization token is invalid',
        });
      }

      req.user = user;
      req.userId = user._id.toString();
      return next();
    } catch (error) {
      console.warn('JWT verification failed:', error.message);
      return res.status(401).json({
        success: false,
        message: error.name === 'TokenExpiredError' ? 'Token expired. Please login again.' : 'Not authorized, token invalid',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided',
    });
  }
};

module.exports = { protect };
