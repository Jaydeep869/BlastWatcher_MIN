const mongoose = require('mongoose');
const { COLLECTIONS } = require('../config/database');

const userSchema = new mongoose.Schema({
  firebaseUid: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  displayName: {
    type: String,
    trim: true,
    maxlength: [100, 'Display name cannot exceed 100 characters']
  },
  photoURL: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['normal', 'data_entry', 'admin'],
    default: 'normal'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  collection: COLLECTIONS.AUTH.USERS // Explicitly set collection name
});

// Update the updatedAt field before saving
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Instance method to check if user has permission
userSchema.methods.hasPermission = function(requiredRole) {
  const roleHierarchy = { normal: 1, data_entry: 2, admin: 3 };
  return roleHierarchy[this.role] >= roleHierarchy[requiredRole];
};

// Static method to find active users
userSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

// Method to get user public data
userSchema.methods.toPublicJSON = function() {
  const userObject = this.toObject();
  delete userObject.firebaseUid;
  delete userObject.__v;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);
