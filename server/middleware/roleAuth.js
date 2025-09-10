const jwt = require('jsonwebtoken');
const User = require('../models/User');

const roleAuth = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      // Get token from header
      const token = req.header('Authorization')?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ message: 'No authentication token found' });
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from database
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      // Check if user has any of the allowed roles
      const hasAllowedRole = allowedRoles.some(role => 
        user.roles.includes(role) || user.role === role
      );

      if (!hasAllowedRole) {
        return res.status(403).json({ 
          message: 'Access denied. Required role not found.'
        });
      }

      // Add user to request object
      req.user = user;
      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token' });
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
};

module.exports = roleAuth;