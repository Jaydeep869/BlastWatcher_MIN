const mongoose = require('mongoose');
const { COLLECTIONS } = require('../config/database');

const blastDataSchema = new mongoose.Schema({
  mineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mine',
    required: [true, 'Mine selection is required']
  },
  blastId: {
    type: String,
    required: true,
    trim: true
  },
  
  // 14 Required Blast Parameters
  blastParameters: {
    // 1. Depth (meters)
    depth: {
      type: Number,
      required: [true, 'Depth is required'],
      min: [0.1, 'Depth must be greater than 0'],
      max: [100, 'Depth cannot exceed 100 meters']
    },
    
    // 2. Burden (meters)
    burden: {
      type: Number,
      required: [true, 'Burden is required'],
      min: [0.5, 'Burden must be at least 0.5 meters'],
      max: [20, 'Burden cannot exceed 20 meters']
    },
    
    // 3. Spacing (meters)
    spacing: {
      type: Number,
      required: [true, 'Spacing is required'],
      min: [0.5, 'Spacing must be at least 0.5 meters'],
      max: [25, 'Spacing cannot exceed 25 meters']
    },
    
    // 4. Stemming (meters)
    stemming: {
      type: Number,
      required: [true, 'Stemming is required'],
      min: [0.1, 'Stemming must be greater than 0'],
      max: [10, 'Stemming cannot exceed 10 meters']
    },
    
    // 5. Total Charge Length (meters)
    totalChargeLength: {
      type: Number,
      required: [true, 'Total charge length is required'],
      min: [0.1, 'Total charge length must be greater than 0'],
      max: [50, 'Total charge length cannot exceed 50 meters']
    },
    
    // 6. Explosive per Hole (kg)
    explosivePerHole: {
      type: Number,
      required: [true, 'Explosive per hole is required'],
      min: [0.1, 'Explosive per hole must be greater than 0'],
      max: [500, 'Explosive per hole cannot exceed 500 kg']
    },
    
    // 7. Maximum Charge per Delay (kg)
    maxChargePerDelay: {
      type: Number,
      required: [true, 'Maximum charge per delay is required'],
      min: [0.1, 'Maximum charge per delay must be greater than 0'],
      max: [2000, 'Maximum charge per delay cannot exceed 2000 kg']
    },
    
    // 8. Total Amount of Explosive (kg)
    totalExplosiveAmount: {
      type: Number,
      required: [true, 'Total amount of explosive is required'],
      min: [0.1, 'Total explosive amount must be greater than 0'],
      max: [10000, 'Total explosive amount cannot exceed 10000 kg']
    },
    
    // 9. Total Rock Blasted (tonnes)
    totalRockBlasted: {
      type: Number,
      required: [true, 'Total rock blasted is required'],
      min: [1, 'Total rock blasted must be at least 1 tonne'],
      max: [100000, 'Total rock blasted cannot exceed 100000 tonnes']
    },
    
    // 10. Power Factor (tonnes per kg)
    powerFactor: {
      type: Number,
      required: [true, 'Power factor is required'],
      min: [0.1, 'Power factor must be greater than 0'],
      max: [50, 'Power factor cannot exceed 50']
    },
    
    // 11. Distance (meters)
    distance: {
      type: Number,
      required: [true, 'Distance is required'],
      min: [10, 'Distance must be at least 10 meters'],
      max: [2000, 'Distance cannot exceed 2000 meters']
    },
    
    // 12. SD (Standard Deviation)
    standardDeviation: {
      type: Number,
      required: [true, 'Standard deviation is required'],
      min: [0, 'Standard deviation cannot be negative'],
      max: [100, 'Standard deviation cannot exceed 100']
    },
    
    // 13. Frequency (Hz)
    frequency: {
      type: Number,
      required: [true, 'Frequency is required'],
      min: [1, 'Frequency must be at least 1 Hz'],
      max: [500, 'Frequency cannot exceed 500 Hz']
    }
  },
  
  // Additional Information
  additionalInfo: {
    rockType: {
      type: String,
      enum: ['Granite', 'Limestone', 'Sandstone', 'Basalt', 'Quartzite', 'Coal', 'Other']
    },
    weatherCondition: {
      type: String,
      enum: ['Clear', 'Cloudy', 'Rainy', 'Windy', 'Stormy']
    },
    blastTime: {
      type: Date
    },
    notes: {
      type: String,
      maxlength: [1000, 'Notes cannot exceed 1000 characters']
    }
  },
  
  // Results (to be filled after blast)
  results: {
    efficiency: {
      type: Number,
      min: [0, 'Efficiency cannot be negative'],
      max: [100, 'Efficiency cannot exceed 100%']
    },
    safetyScore: {
      type: Number,
      min: [0, 'Safety score cannot be negative'],
      max: [100, 'Safety score cannot exceed 100']
    },
    fragmentationQuality: {
      type: String,
      enum: ['Excellent', 'Good', 'Fair', 'Poor']
    },
    vibrationLevel: {
      type: Number,
      min: [0, 'Vibration level cannot be negative']
    },
    airblastLevel: {
      type: Number,
      min: [0, 'Airblast level cannot be negative']
    }
  },
  
  // Metadata
  enteredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  blastDate: {
    type: Date,
    required: [true, 'Blast date is required'],
    default: Date.now
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'verified', 'archived'],
    default: 'draft'
  }
}, {
  timestamps: true,
  collection: COLLECTIONS.DATA.BLAST_DATA
});

// Compound index for efficient queries
blastDataSchema.index({ mineId: 1, blastDate: -1 });
blastDataSchema.index({ blastId: 1, mineId: 1 }, { unique: true });

// Remove version key when converting to JSON
blastDataSchema.methods.toJSON = function() {
  const blastObject = this.toObject();
  delete blastObject.__v;
  return blastObject;
};

module.exports = mongoose.model('BlastData', blastDataSchema);
