const mongoose = require('mongoose');
const { COLLECTIONS } = require('../config/database');

const predictionSchema = new mongoose.Schema({
  mineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mine',
    required: true
  },
  
  // Input Parameters (same as BlastData)
  inputs: {
    // Geological Parameters
    rockType: {
      type: String,
      required: true,
      enum: ['Granite', 'Limestone', 'Sandstone', 'Basalt', 'Quartzite']
    },
    rockDensity: {
      type: Number,
      required: true,
      min: 1000,
      max: 5000
    },
    rockStrength: {
      type: Number,
      required: true,
      min: 10,
      max: 500
    },
    waterContent: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    
    // Blast Design Parameters
    holeDepth: {
      type: Number,
      required: true,
      min: 1,
      max: 50
    },
    holeDiameter: {
      type: Number,
      required: true,
      min: 50,
      max: 500
    },
    explosiveAmount: {
      type: Number,
      required: true,
      min: 1,
      max: 1000
    },
    
    // Pattern Parameters
    burden: {
      type: Number,
      required: true,
      min: 1,
      max: 20
    },
    spacing: {
      type: Number,
      required: true,
      min: 1,
      max: 25
    },
    subdrill: {
      type: Number,
      required: true,
      min: 0,
      max: 5
    },
    
    // Environmental Parameters
    weatherCondition: {
      type: String,
      required: true,
      enum: ['Clear', 'Cloudy', 'Rainy', 'Windy']
    },
    temperature: {
      type: Number,
      required: true,
      min: -40,
      max: 60
    },
    humidity: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    }
  },
  
  // Prediction Results
  result: {
    efficiency: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    safety: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    fragmentationQuality: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    vibrationLevel: {
      type: Number,
      required: true,
      min: 0,
      max: 200
    },
    airblastLevel: {
      type: Number,
      required: true,
      min: 50,
      max: 200
    },
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    recommendations: [{
      type: String,
      maxlength: 200
    }]
  },
  
  // Metadata
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  modelVersion: {
    type: String,
    default: 'v1.0.0'
  },
  processingTime: {
    type: Number // milliseconds
  }
}, {
  timestamps: true,
  collection: COLLECTIONS.DATA.PREDICTIONS // Explicitly set collection name
});

// Index for efficient queries
predictionSchema.index({ mineId: 1, createdAt: -1 });
predictionSchema.index({ requestedBy: 1, createdAt: -1 });

// Remove version key when converting to JSON
predictionSchema.methods.toJSON = function() {
  const predictionObject = this.toObject();
  delete predictionObject.__v;
  return predictionObject;
};

module.exports = mongoose.model('Prediction', predictionSchema);
