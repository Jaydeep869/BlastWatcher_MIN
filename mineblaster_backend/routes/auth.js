const express = require('express');
const User = require('../models/User');
const { authenticateFirebaseToken, requireAdmin } = require('../middleware/firebaseAuth');
const { verifyFirebaseToken } = require('../config/firebase');

const router = express.Router();

// @route   POST /api/v1/auth/firebase-login
// @desc    Login/Register with Firebase token
// @access  Public
router.post('/firebase-login', async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'Firebase ID token is required'
      });
    }

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
        role: 'normal' // Default role for new users
      });
      await user.save();
    } else {
      // Update last login and profile data
      user.lastLogin = new Date();
      user.displayName = decodedToken.name || user.displayName;
      user.photoURL = decodedToken.picture || user.photoURL;
      await user.save();
    }

    res.json({
      success: true,
      message: user.isNew ? 'User registered successfully' : 'Login successful',
      data: {
        user: user.toPublicJSON(),
        firebaseUid: decodedToken.uid
      }
    });

  } catch (error) {
    console.error('Firebase login error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid Firebase token'
    });
  }
});

// @route   GET /api/v1/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authenticateFirebaseToken, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user.toPublicJSON()
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile'
    });
  }
});

// @route   PUT /api/v1/auth/update-role
// @desc    Update user role (Admin only)
// @access  Private (Admin)
router.put('/update-role', authenticateFirebaseToken, requireAdmin, async (req, res) => {
  try {
    const { userId, role } = req.body;

    if (!userId || !role) {
      return res.status(400).json({
        success: false,
        message: 'User ID and role are required'
      });
    }

    const validRoles = ['normal', 'data_entry', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.role = role;
    await user.save();

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: {
        user: user.toPublicJSON()
      }
    });

  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user role'
    });
  }
});

// @route   GET /api/v1/auth/users
// @desc    Get all users (Admin only)
// @access  Private (Admin)
router.get('/users', authenticateFirebaseToken, requireAdmin, async (req, res) => {
  try {
    const users = await User.find({ isActive: true })
      .select('-firebaseUid -__v')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        users,
        count: users.length
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
});

// @route   POST /api/v1/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', authenticateFirebaseToken, async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Logout successful. Please clear Firebase token on client side.'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during logout'
    });
  }
});

module.exports = router;
