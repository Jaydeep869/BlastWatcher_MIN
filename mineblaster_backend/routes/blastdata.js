const express = require('express');
const BlastData = require('../models/BlastData');
const Mine = require('../models/Mine');
const { authenticateFirebaseToken, requireDataEntry } = require('../middleware/firebaseAuth');

const router = express.Router();

// @route   GET /api/v1/blastdata/:mineId
// @desc    Get blast data for a specific mine
// @access  Private
router.get('/:mineId', authenticateFirebaseToken, async (req, res) => {
  try {
    const { mineId } = req.params;
    const { page = 1, limit = 10, startDate, endDate, blastId } = req.query;

    // Verify mine exists
    const mine = await Mine.findOne({ _id: mineId, isActive: true });
    if (!mine) {
      return res.status(404).json({
        success: false,
        message: 'Mine not found'
      });
    }

    // Build filter object
    const filter = { mineId };
    
    if (blastId) {
      filter.blastId = { $regex: blastId, $options: 'i' };
    }

    if (startDate || endDate) {
      filter.blastDate = {};
      if (startDate) filter.blastDate.$gte = new Date(startDate);
      if (endDate) filter.blastDate.$lte = new Date(endDate);
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get blast data with pagination
    const blastData = await BlastData.find(filter)
      .populate('mineId', 'name location')
      .populate('enteredBy', 'username email')
      .sort({ blastDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await BlastData.countDocuments(filter);

    res.json({
      success: true,
      data: {
        blastData,
        mine: {
          _id: mine._id,
          name: mine.name,
          location: mine.location
        },
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get blast data error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching blast data'
    });
  }
});

// @route   GET /api/v1/blastdata/single/:id
// @desc    Get single blast data record
// @access  Private
router.get('/single/:id', authenticateFirebaseToken, async (req, res) => {
  try {
    const blastData = await BlastData.findById(req.params.id)
      .populate('mineId', 'name location')
      .populate('enteredBy', 'username email role');

    if (!blastData) {
      return res.status(404).json({
        success: false,
        message: 'Blast data not found'
      });
    }

    res.json({
      success: true,
      data: { blastData }
    });

  } catch (error) {
    console.error('Get single blast data error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching blast data'
    });
  }
});

// @route   POST /api/v1/blastdata
// @desc    Create new blast data record
// @access  Private (Data Entry or Admin only)
router.post('/', authenticateFirebaseToken, requireDataEntry, async (req, res) => {
  try {
    const {
      mineId,
      blastParameters,
      additionalInfo,
      results
    } = req.body;

    // Validation
    if (!mineId || !blastParameters) {
      return res.status(400).json({
        success: false,
        message: 'Mine ID and blast parameters are required'
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

    // Validate required blast parameter fields
    const requiredParameters = [
      'depth', 'burden', 'spacing', 'stemming', 'totalChargeLength',
      'explosivePerHole', 'maxChargePerDelay', 'totalExplosiveAmount',
      'totalRockBlasted', 'powerFactor', 'distance', 'standardDeviation',
      'frequency'
    ];

    for (const field of requiredParameters) {
      if (!blastParameters[field] && blastParameters[field] !== 0) {
        return res.status(400).json({
          success: false,
          message: `Blast parameter '${field}' is required`
        });
      }
    }

    // Create new blast data
    const blastData = new BlastData({
      mineId,
      blastParameters,
      additionalInfo: additionalInfo || {},
      results: results || {},
      enteredBy: req.user._id
    });

    await blastData.save();

    // Populate references before sending response
    await blastData.populate([
      { path: 'mineId', select: 'name location' },
      { path: 'enteredBy', select: 'displayName email' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Blast data created successfully',
      data: { blastData }
    });

  } catch (error) {
    console.error('Create blast data error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating blast data'
    });
  }
});

// @route   PUT /api/v1/blastdata/:id
// @desc    Update blast data record
// @access  Private (Data Entry or Admin only)
router.put('/:id', authenticateFirebaseToken, requireDataEntry, async (req, res) => {
  try {
    const {
      blastId,
      inputs,
      outputs,
      blastDate,
      notes,
      isVerified
    } = req.body;

    // Find blast data
    const blastData = await BlastData.findById(req.params.id);

    if (!blastData) {
      return res.status(404).json({
        success: false,
        message: 'Blast data not found'
      });
    }

    // Check if user can edit (own data or admin)
    if (req.user.role !== 'admin' && blastData.enteredBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own blast data entries'
      });
    }

    // Check if new blast ID conflicts (if changed)
    if (blastId && blastId !== blastData.blastId) {
      const existingBlast = await BlastData.findOne({
        mineId: blastData.mineId,
        blastId: blastId.trim(),
        _id: { $ne: blastData._id }
      });

      if (existingBlast) {
        return res.status(400).json({
          success: false,
          message: 'Blast ID already exists for this mine'
        });
      }
    }

    // Update fields
    if (blastId) blastData.blastId = blastId.trim();
    if (inputs) blastData.inputs = { ...blastData.inputs, ...inputs };
    if (outputs) blastData.outputs = { ...blastData.outputs, ...outputs };
    if (blastDate) blastData.blastDate = new Date(blastDate);
    if (notes !== undefined) blastData.notes = notes?.trim();
    if (isVerified !== undefined && req.user.role === 'admin') {
      blastData.isVerified = isVerified;
    }

    await blastData.save();

    // Populate references before sending response
    await blastData.populate([
      { path: 'mineId', select: 'name location' },
      { path: 'enteredBy', select: 'username email' }
    ]);

    res.json({
      success: true,
      message: 'Blast data updated successfully',
      data: { blastData }
    });

  } catch (error) {
    console.error('Update blast data error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating blast data'
    });
  }
});

// @route   DELETE /api/v1/blastdata/:id
// @desc    Delete blast data record
// @access  Private (Data Entry or Admin only)
router.delete('/:id', authenticateFirebaseToken, requireDataEntry, async (req, res) => {
  try {
    const blastData = await BlastData.findById(req.params.id);

    if (!blastData) {
      return res.status(404).json({
        success: false,
        message: 'Blast data not found'
      });
    }

    // Check if user can delete (own data or admin)
    if (req.user.role !== 'admin' && blastData.enteredBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own blast data entries'
      });
    }

    await BlastData.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Blast data deleted successfully'
    });

  } catch (error) {
    console.error('Delete blast data error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting blast data'
    });
  }
});

module.exports = router;
