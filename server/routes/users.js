import express from 'express';
import User from '../models/User.js';
import { protect, authorize, authorizeOwnerOrAdmin } from '../middleware/auth.js';
import { validateProfileUpdate, validateObjectId } from '../middleware/validation.js';

const router = express.Router();

// @desc    Get user profile
// @route   GET /api/users/:id
// @access  Private
router.get('/:id', protect, validateObjectId, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Increment profile views if viewing someone else's profile
    if (req.user._id.toString() !== req.params.id) {
      user.profileViews += 1;
      await user.save();
    }

    res.json({
      success: true,
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private (Own profile or Admin)
router.put('/:id', protect, authorizeOwnerOrAdmin, validateObjectId, validateProfileUpdate, async (req, res) => {
  try {
    const allowedFields = [
      'name', 'profile', 'studentProfile', 'recruiterProfile'
    ];

    const updateData = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Search users (for recruiters to find students)
// @route   GET /api/users/search
// @access  Private (Recruiters and Admins)
router.get('/search/profiles', protect, authorize('recruiter', 'admin'), async (req, res) => {
  try {
    const {
      q,
      skills,
      location,
      university,
      graduationYear,
      page = 1,
      limit = 10
    } = req.query;

    const query = { role: 'student', status: 'active' };

    // Text search
    if (q) {
      query.$text = { $search: q };
    }

    // Skills filter
    if (skills) {
      const skillsArray = skills.split(',').map(skill => skill.trim());
      query['studentProfile.skills'] = { $in: skillsArray };
    }

    // Location filter
    if (location) {
      query['profile.location'] = new RegExp(location, 'i');
    }

    // University filter
    if (university) {
      query['studentProfile.university'] = new RegExp(university, 'i');
    }

    // Graduation year filter
    if (graduationYear) {
      query['studentProfile.graduationYear'] = parseInt(graduationYear);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get user statistics
// @route   GET /api/users/:id/stats
// @access  Private (Own stats or Admin)
router.get('/:id/stats', protect, authorizeOwnerOrAdmin, validateObjectId, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    let stats = {
      profileViews: user.profileViews,
      joinDate: user.createdAt,
      lastLogin: user.lastLogin
    };

    // Add role-specific stats
    if (user.role === 'student') {
      // Import Application model here to avoid circular dependency
      const Application = (await import('../models/Application.js')).default;
      
      const applicationStats = await Application.aggregate([
        { $match: { student: user._id } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      stats.applications = applicationStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {});

      stats.totalApplications = applicationStats.reduce((sum, stat) => sum + stat.count, 0);
    }

    if (user.role === 'recruiter') {
      // Import models here to avoid circular dependency
      const Job = (await import('../models/Job.js')).default;
      const Application = (await import('../models/Application.js')).default;

      const jobStats = await Job.aggregate([
        { $match: { recruiter: user._id } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      stats.jobs = jobStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {});

      const totalApplications = await Application.countDocuments({ recruiter: user._id });
      stats.totalApplicationsReceived = totalApplications;
    }

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;