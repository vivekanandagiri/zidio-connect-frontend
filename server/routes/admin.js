import express from 'express';
import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateObjectId, validatePagination } from '../middleware/validation.js';

const router = express.Router();

// All routes require admin access
router.use(protect, authorize('admin'));

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private (Admin only)
router.get('/stats', async (req, res) => {
  try {
    // User statistics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'active' });
    const pendingUsers = await User.countDocuments({ status: 'pending' });
    const suspendedUsers = await User.countDocuments({ status: 'suspended' });
    
    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    // Job statistics
    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ status: 'active' });
    const pendingJobs = await Job.countDocuments({ status: 'pending' });
    
    const jobsByType = await Job.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$jobType',
          count: { $sum: 1 }
        }
      }
    ]);

    // Application statistics
    const totalApplications = await Application.countDocuments();
    const applicationsByStatus = await Application.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentUsers = await User.countDocuments({ 
      createdAt: { $gte: thirtyDaysAgo } 
    });
    const recentJobs = await Job.countDocuments({ 
      createdAt: { $gte: thirtyDaysAgo } 
    });
    const recentApplications = await Application.countDocuments({ 
      createdAt: { $gte: thirtyDaysAgo } 
    });

    res.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          active: activeUsers,
          pending: pendingUsers,
          suspended: suspendedUsers,
          recent: recentUsers,
          byRole: usersByRole.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {})
        },
        jobs: {
          total: totalJobs,
          active: activeJobs,
          pending: pendingJobs,
          recent: recentJobs,
          byType: jobsByType.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {})
        },
        applications: {
          total: totalApplications,
          recent: recentApplications,
          byStatus: applicationsByStatus.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {})
        }
      }
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get all users with filtering
// @route   GET /api/admin/users
// @access  Private (Admin only)
router.get('/users', validatePagination, async (req, res) => {
  try {
    const {
      role,
      status,
      search,
      page = 1,
      limit = 10,
      sort = '-createdAt'
    } = req.query;

    const query = {};

    if (role) query.role = role;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort(sort);

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
    console.error('Get admin users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update user status
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin only)
router.put('/users/:id/status', validateObjectId, async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ['active', 'pending', 'suspended'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: `User status updated to ${status}`,
      user
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get all jobs with filtering
// @route   GET /api/admin/jobs
// @access  Private (Admin only)
router.get('/jobs', validatePagination, async (req, res) => {
  try {
    const {
      status,
      flagged,
      search,
      page = 1,
      limit = 10,
      sort = '-createdAt'
    } = req.query;

    const query = {};

    if (status) query.status = status;
    if (flagged === 'true') query.flagged = true;
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { company: new RegExp(search, 'i') }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const jobs = await Job.find(query)
      .populate('recruiter', 'name email recruiterProfile.company')
      .skip(skip)
      .limit(parseInt(limit))
      .sort(sort);

    const total = await Job.countDocuments(query);

    res.json({
      success: true,
      jobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get admin jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update job status
// @route   PUT /api/admin/jobs/:id/status
// @access  Private (Admin only)
router.put('/jobs/:id/status', validateObjectId, async (req, res) => {
  try {
    const { status, adminNotes } = req.body;

    const validStatuses = ['pending', 'approved', 'rejected', 'active', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const updateData = { status };
    if (adminNotes) updateData.adminNotes = adminNotes;

    const job = await Job.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('recruiter', 'name email');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.json({
      success: true,
      message: `Job status updated to ${status}`,
      job
    });
  } catch (error) {
    console.error('Update job status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Flag/unflag job
// @route   PUT /api/admin/jobs/:id/flag
// @access  Private (Admin only)
router.put('/jobs/:id/flag', validateObjectId, async (req, res) => {
  try {
    const { flagged, flagReason } = req.body;

    const updateData = { flagged: Boolean(flagged) };
    if (flagged && flagReason) {
      updateData.flagReason = flagReason;
    } else if (!flagged) {
      updateData.flagReason = '';
    }

    const job = await Job.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('recruiter', 'name email');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.json({
      success: true,
      message: flagged ? 'Job flagged successfully' : 'Job unflagged successfully',
      job
    });
  } catch (error) {
    console.error('Flag job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get recent activity
// @route   GET /api/admin/activity
// @access  Private (Admin only)
router.get('/activity', async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    // Get recent users
    const recentUsers = await User.find()
      .select('name email role status createdAt')
      .sort('-createdAt')
      .limit(parseInt(limit) / 4);

    // Get recent jobs
    const recentJobs = await Job.find()
      .select('title company status createdAt')
      .populate('recruiter', 'name')
      .sort('-createdAt')
      .limit(parseInt(limit) / 4);

    // Get recent applications
    const recentApplications = await Application.find()
      .select('status createdAt')
      .populate('student', 'name')
      .populate('job', 'title company')
      .sort('-createdAt')
      .limit(parseInt(limit) / 2);

    // Combine and sort all activities
    const activities = [
      ...recentUsers.map(user => ({
        type: 'user_registered',
        data: user,
        timestamp: user.createdAt
      })),
      ...recentJobs.map(job => ({
        type: 'job_posted',
        data: job,
        timestamp: job.createdAt
      })),
      ...recentApplications.map(app => ({
        type: 'application_submitted',
        data: app,
        timestamp: app.createdAt
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
     .slice(0, parseInt(limit));

    res.json({
      success: true,
      activities
    });
  } catch (error) {
    console.error('Get admin activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get analytics data
// @route   GET /api/admin/analytics
// @access  Private (Admin only)
router.get('/analytics', async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // User growth over time
    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    // Job posting trends
    const jobTrends = await Job.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    // Application success rates
    const applicationStats = await Application.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Top companies by job postings
    const topCompanies = await Job.aggregate([
      {
        $group: {
          _id: '$company',
          jobCount: { $sum: 1 },
          applicationCount: { $sum: '$applicationCount' }
        }
      },
      {
        $sort: { jobCount: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.json({
      success: true,
      analytics: {
        userGrowth,
        jobTrends,
        applicationStats,
        topCompanies
      }
    });
  } catch (error) {
    console.error('Get admin analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;