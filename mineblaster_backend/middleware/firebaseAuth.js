const { verifyFirebaseToken } = require('../config/firebase');
const User = require('../models/User');

// Middleware to authenticate Firebase token
const authenticateFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    const idToken = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify Firebase token
    const decodedToken = await verifyFirebaseToken(idToken);
    
    // Find or create user in our database
    let user = await User.findOne({ firebaseUid: decodedToken.uid });
    
    if (!user) {
      // Create new user from Firebase data
      user = new User({
        firebaseUid: decodedToken.uid,
        email: decodedToken.email,
        displayName: decodedToken.name || decodedToken.email.split('@')[0],
        photoURL: decodedToken.picture || null,
        role: 'normal' // Default role
      });
      await user.save();
    } else {
      // Update last login
      user.lastLogin = new Date();
      await user.save();
    }

    // Attach user to request
    req.user = user;
    req.firebaseToken = decodedToken;
    
    next();
  } catch (error) {
    console.error('Firebase authentication error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

// Middleware to check user role
const requireRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!req.user.hasPermission(requiredRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. ${requiredRole} role or higher required.`
      });
    }

    next();
  };
};

// Middleware to check if user is admin
const requireAdmin = requireRole('admin');

// Middleware to check if user is data_entry or admin
const requireDataEntry = requireRole('data_entry');

module.exports = {
  authenticateFirebaseToken,
  requireRole,
  requireAdmin,
  requireDataEntry
};
