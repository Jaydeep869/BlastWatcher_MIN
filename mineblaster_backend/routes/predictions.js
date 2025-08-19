const express = require('express');
const Prediction = require('../models/Prediction');
const Mine = require('../models/Mine');
const { authenticateFirebaseToken } = require('../middleware/firebaseAuth');

const router = express.Router();

// Dummy ML prediction function
const generatePrediction = (inputs) => {
  const startTime = Date.now();
  
  // Simulate processing time
  const processingTime = Math.floor(Math.random() * 1000) + 500; // 500-1500ms
  
  // Generate realistic predictions based on inputs
  const rockTypeMultiplier = {
    'Granite': 0.9,
    'Limestone': 1.1,
    'Sandstone': 1.0,
    'Basalt': 0.85,
    'Quartzite': 0.95
  };

  const weatherMultiplier = {
    'Clear': 1.0,
    'Cloudy': 0.98,
    'Rainy': 0.85,
    'Windy': 0.92
  };

  const baseEfficiency = 85;
  const baseSafety = 90;
  const baseFragmentation = 80;
  const baseVibration = 30;
  const baseAirblast = 110;

  // Calculate predictions with some realistic logic
  const efficiency = Math.min(100, Math.max(60, 
    baseEfficiency * 
    rockTypeMultiplier[inputs.rockType] * 
    weatherMultiplier[inputs.weatherCondition] * 
    (1 + Math.random() * 0.2 - 0.1) // ±10% random variation
  ));

  const safety = Math.min(100, Math.max(70,
    baseSafety * 
    (inputs.burden / 5.0) * // Safer with larger burden
    (inputs.spacing / 6.0) * // Safer with larger spacing
    weatherMultiplier[inputs.weatherCondition] *
    (1 + Math.random() * 0.15 - 0.075) // ±7.5% random variation
  ));

  const fragmentationQuality = Math.min(100, Math.max(50,
    baseFragmentation *
    rockTypeMultiplier[inputs.rockType] *
    (inputs.explosiveAmount / 25.0) * // Better with more explosive (up to a point)
    (1 + Math.random() * 0.25 - 0.125) // ±12.5% random variation
  ));

  const vibrationLevel = Math.max(10, Math.min(60,
    baseVibration *
    (inputs.explosiveAmount / 25.0) * // More explosive = more vibration
    (5.0 / inputs.burden) * // Closer burden = more vibration
    (1 + Math.random() * 0.3 - 0.15) // ±15% random variation
  ));

  const airblastLevel = Math.max(90, Math.min(130,
    baseAirblast *
    (inputs.explosiveAmount / 25.0) *
    weatherMultiplier[inputs.weatherCondition] *
    (1 + Math.random() * 0.2 - 0.1) // ±10% random variation
  ));

  const confidence = Math.max(75, Math.min(98,
    85 + Math.random() * 13 // 85-98% confidence
  ));

  // Generate recommendations
  const recommendations = [];
  
  if (inputs.burden < 4) {
    recommendations.push("Consider increasing burden distance for better fragmentation");
  }
  
  if (inputs.spacing < 5) {
    recommendations.push("Increase spacing to reduce vibration levels");
  }
  
  if (inputs.explosiveAmount > 30) {
    recommendations.push("High explosive amount may cause excessive vibration");
  }
  
  if (inputs.weatherCondition === 'Rainy') {
    recommendations.push("Weather conditions may affect blast performance");
  }
  
  if (inputs.rockStrength > 200) {
    recommendations.push("Hard rock conditions detected - consider adjusted blast design");
  }

  if (recommendations.length === 0) {
    recommendations.push("Current blast parameters appear optimal");
  }

  return {
    efficiency: Math.round(efficiency * 100) / 100,
    safety: Math.round(safety * 100) / 100,
    fragmentationQuality: Math.round(fragmentationQuality * 100) / 100,
    vibrationLevel: Math.round(vibrationLevel * 100) / 100,
    airblastLevel: Math.round(airblastLevel * 100) / 100,
    confidence: Math.round(confidence * 100) / 100,
    recommendations: recommendations.slice(0, 3), // Limit to 3 recommendations
    processingTime: Date.now() - startTime
  };
};

// @route   POST /api/v1/predict
// @desc    Generate blast prediction
// @access  Private
router.post('/', authenticateFirebaseToken, async (req, res) => {
  try {
    const { mineId, inputs } = req.body;

    // Validation
    if (!mineId || !inputs) {
      return res.status(400).json({
        success: false,
        message: 'Mine ID and inputs are required'
      });
    }

    // Verify mine exists
    const mine = await Mine.findOne({ _id: mineId, isActive: true });
    if (!mine) {
      return res.status(404).json({
        success: false,
        message: 'Mine not found'
      });
    }

    // Validate required input fields (13 fields)
    const requiredInputs = [
      'rockType', 'rockDensity', 'rockStrength', 'waterContent',
      'holeDepth', 'holeDiameter', 'explosiveAmount',
      'burden', 'spacing', 'subdrill',
      'weatherCondition', 'temperature', 'humidity'
    ];

    for (const field of requiredInputs) {
      if (!inputs[field] && inputs[field] !== 0) {
        return res.status(400).json({
          success: false,
          message: `Input field '${field}' is required`
        });
      }
    }

    // Generate prediction using dummy ML function
    const predictionResult = generatePrediction(inputs);

    // Create prediction record
    const prediction = new Prediction({
      mineId,
      inputs,
      result: predictionResult,
      requestedBy: req.user._id,
      modelVersion: 'v1.0.0-dummy',
      processingTime: predictionResult.processingTime
    });

    await prediction.save();

    // Populate references before sending response
    await prediction.populate([
      { path: 'mineId', select: 'name location' },
      { path: 'requestedBy', select: 'username email' }
    ]);

    res.json({
      success: true,
      message: 'Prediction generated successfully',
      data: { 
        prediction,
        mine: {
          _id: mine._id,
          name: mine.name,
          location: mine.location
        }
      }
    });

  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating prediction'
    });
  }
});

// @route   GET /api/predict/history
// @desc    Get prediction history for user
// @access  Private
router.get('/history', authenticateFirebaseToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, mineId } = req.query;

    // Build filter object
    const filter = { requestedBy: req.user._id };
    
    if (mineId) {
      filter.mineId = mineId;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get predictions with pagination
    const predictions = await Prediction.find(filter)
      .populate('mineId', 'name location')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Prediction.countDocuments(filter);

    res.json({
      success: true,
      data: {
        predictions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get prediction history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching prediction history'
    });
  }
});

// @route   GET /api/v1/predict/:id
// @desc    Get single prediction
// @access  Private
router.get('/:id', authenticateFirebaseToken, async (req, res) => {
  try {
    const prediction = await Prediction.findById(req.params.id)
      .populate('mineId', 'name location')
      .populate('requestedBy', 'username email');

    if (!prediction) {
      return res.status(404).json({
        success: false,
        message: 'Prediction not found'
      });
    }

    // Check if user can access this prediction (own prediction or admin)
    if (req.user.role !== 'admin' && prediction.requestedBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { prediction }
    });

  } catch (error) {
    console.error('Get prediction error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching prediction'
    });
  }
});

// @route   DELETE /api/v1/predict/:id
// @desc    Delete prediction
// @access  Private
router.delete('/:id', authenticateFirebaseToken, async (req, res) => {
  try {
    const prediction = await Prediction.findById(req.params.id);

    if (!prediction) {
      return res.status(404).json({
        success: false,
        message: 'Prediction not found'
      });
    }

    // Check if user can delete this prediction (own prediction or admin)
    if (req.user.role !== 'admin' && prediction.requestedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own predictions'
      });
    }

    await Prediction.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Prediction deleted successfully'
    });

  } catch (error) {
    console.error('Delete prediction error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting prediction'
    });
  }
});

module.exports = router;
