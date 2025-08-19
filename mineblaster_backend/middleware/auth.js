const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authenticate JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database to ensure they still exist and are active
    const user = await User.findById(decoded.userId).select('-passwordHash');
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token or user not found'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

// Check if user has required role
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Convert single role to array for consistency
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    // Admin role has access to everything
    if (req.user.role === 'admin' || allowedRoles.includes(req.user.role)) {
      return next();
    }

    res.status(403).json({
      success: false,
      message: `Access denied. Required role: ${allowedRoles.join(' or ')}`
    });
  };
};

// Specific middleware for data entry access
const requireDataEntryAccess = requireRole(['data_entry', 'admin']);

// Specific middleware for admin access
const requireAdminAccess = requireRole('admin');

module.exports = {
  authenticateToken,
  requireRole,
  requireDataEntryAccess,
  requireAdminAccess
};
