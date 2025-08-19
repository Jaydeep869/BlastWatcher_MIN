const mongoose = require('mongoose');
const { COLLECTIONS } = require('../config/database');

const mineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Mine name is required'],
    trim: true,
    maxlength: [100, 'Mine name cannot exceed 100 characters']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    maxlength: [200, 'Location cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  coordinates: {
    latitude: {
      type: Number,
      min: [-90, 'Latitude must be between -90 and 90'],
      max: [90, 'Latitude must be between -90 and 90']
    },
    longitude: {
      type: Number,
      min: [-180, 'Longitude must be between -180 and 180'],
      max: [180, 'Longitude must be between -180 and 180']
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  capacity: {
    type: Number,
    min: [0, 'Capacity cannot be negative'],
    default: 0
  },
  operatingCompany: {
    type: String,
    trim: true,
    maxlength: [100, 'Operating company name cannot exceed 100 characters']
  },
  mineType: {
    type: String,
    enum: ['opencast', 'underground', 'surface'],
    default: 'opencast'
  },
  safetyRating: {
    type: Number,
    min: [0, 'Safety rating cannot be negative'],
    max: [100, 'Safety rating cannot exceed 100'],
    default: 85
  },
  establishedYear: {
    type: Number,
    min: [1800, 'Established year seems too old'],
    max: [new Date().getFullYear(), 'Established year cannot be in the future']
  },
  contactDetails: {
    phone: String,
    email: String,
    address: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: COLLECTIONS.DATA.MINES // Explicitly set collection name
});

// Indexes for better query performance
mineSchema.index({ name: 1 }, { unique: true });
mineSchema.index({ status: 1 });
mineSchema.index({ location: 1 });
mineSchema.index({ 'coordinates.latitude': 1, 'coordinates.longitude': 1 });

// Update the updatedAt field before saving
mineSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static method to find active mines
mineSchema.statics.findActive = function() {
  return this.find({ status: 'active' });
};

// Instance method to get mine summary
mineSchema.methods.getSummary = function() {
  return {
    id: this._id,
    name: this.name,
    location: this.location,
    status: this.status,
    operatingCompany: this.operatingCompany
  };
};

module.exports = mongoose.model('Mine', mineSchema);
