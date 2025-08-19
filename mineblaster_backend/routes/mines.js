const express = require('express');
const Mine = require('../models/Mine');
const { authenticateFirebaseToken, requireAdmin } = require('../middleware/firebaseAuth');

const router = express.Router();

// @route   GET /api/v1/mines
// @desc    Get all mines
// @access  Private
router.get('/', authenticateFirebaseToken, async (req, res) => {
  try {
    const { status, page = 1, limit = 10, search } = req.query;
    
    // Build filter object
    const filter = { isActive: true };
    
    if (status) {
      filter.status = status;
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { operatingCompany: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get mines with pagination
    const mines = await Mine.find(filter)
      .populate('createdBy', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Mine.countDocuments(filter);

    res.json({
      success: true,
      data: {
        mines,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get mines error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching mines'
    });
  }
});

// @route   GET /api/v1/mines/:id
// @desc    Get single mine
// @access  Private
router.get('/:id', authenticateFirebaseToken, async (req, res) => {
  try {
    const mine = await Mine.findOne({
      _id: req.params.id,
      isActive: true
    }).populate('createdBy', 'username email');

    if (!mine) {
      return res.status(404).json({
        success: false,
        message: 'Mine not found'
      });
    }

    res.json({
      success: true,
      data: { mine }
    });

  } catch (error) {
    console.error('Get mine error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching mine'
    });
  }
});

// @route   POST /api/v1/mines
// @desc    Create new mine
// @access  Private (Admin only)
router.post('/', authenticateFirebaseToken, requireAdmin, async (req, res) => {
  try {
    const {
      name,
      location,
      description,
      coordinates,
      status = 'active',
      capacity,
      operatingCompany
    } = req.body;

    // Validation
    if (!name || !location) {
      return res.status(400).json({
        success: false,
        message: 'Name and location are required'
      });
    }

    // Check if mine with same name already exists
    const existingMine = await Mine.findOne({ 
      name: name.trim(),
      isActive: true 
    });

    if (existingMine) {
      return res.status(400).json({
        success: false,
        message: 'Mine with this name already exists'
      });
    }

    // Create new mine
    const mine = new Mine({
      name: name.trim(),
      location: location.trim(),
      description: description?.trim(),
      coordinates,
      status,
      capacity,
      operatingCompany: operatingCompany?.trim(),
      createdBy: req.user._id
    });

    await mine.save();

    // Populate creator info before sending response
    await mine.populate('createdBy', 'username email');

    res.status(201).json({
      success: true,
      message: 'Mine created successfully',
      data: { mine }
    });

  } catch (error) {
    console.error('Create mine error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating mine'
    });
  }
});

// @route   PUT /api/v1/mines/:id
// @desc    Update mine
// @access  Private (Admin only)
router.put('/:id', authenticateFirebaseToken, requireAdmin, async (req, res) => {
  try {
    const {
      name,
      location,
      description,
      coordinates,
      status,
      capacity,
      operatingCompany
    } = req.body;

    // Find mine
    const mine = await Mine.findOne({
      _id: req.params.id,
      isActive: true
    });

    if (!mine) {
      return res.status(404).json({
        success: false,
        message: 'Mine not found'
      });
    }

    // Check if new name conflicts with existing mine (excluding current mine)
    if (name && name !== mine.name) {
      const existingMine = await Mine.findOne({
        name: name.trim(),
        isActive: true,
        _id: { $ne: mine._id }
      });

      if (existingMine) {
        return res.status(400).json({
          success: false,
          message: 'Mine with this name already exists'
        });
      }
    }

    // Update fields
    if (name) mine.name = name.trim();
    if (location) mine.location = location.trim();
    if (description !== undefined) mine.description = description?.trim();
    if (coordinates) mine.coordinates = coordinates;
    if (status) mine.status = status;
    if (capacity !== undefined) mine.capacity = capacity;
    if (operatingCompany !== undefined) mine.operatingCompany = operatingCompany?.trim();

    await mine.save();
    await mine.populate('createdBy', 'username email');

    res.json({
      success: true,
      message: 'Mine updated successfully',
      data: { mine }
    });

  } catch (error) {
    console.error('Update mine error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating mine'
    });
  }
});

// @route   DELETE /api/v1/mines/:id
// @desc    Delete mine (soft delete)
// @access  Private (Admin only)
router.delete('/:id', authenticateFirebaseToken, requireAdmin, async (req, res) => {
  try {
    const mine = await Mine.findOne({
      _id: req.params.id,
      isActive: true
    });

    if (!mine) {
      return res.status(404).json({
        success: false,
        message: 'Mine not found'
      });
    }

    // Soft delete
    mine.isActive = false;
    await mine.save();

    res.json({
      success: true,
      message: 'Mine deleted successfully'
    });

  } catch (error) {
    console.error('Delete mine error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting mine'
    });
  }
});

module.exports = router;
