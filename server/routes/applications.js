import express from 'express';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateApplication, validateObjectId, validatePagination } from '../middleware/validation.js';

const router = express.Router();

// @desc    Apply for a job
// @route   POST /api/applications
// @access  Private (Students only)
router.post('/', protect, authorize('student'), validateApplication, async (req, res) => {
  try {
    const { jobId, coverLetter, answers } = req.body;

    // Check if job exists and is active
    const job = await Job.findById(jobId).populate('recruiter');
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (job.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'This job is no longer accepting applications'
      });
    }

    // Check if application deadline has passed
    if (job.applicationDeadline && new Date() > job.applicationDeadline) {
      return res.status(400).json({
        success: false,
        message: 'Application deadline has passed'
      });
    }

    // Check if user has already applied
    const existingApplication = await Application.findOne({
      job: jobId,
      student: req.user._id
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job'
      });
    }

    // Create application
    const application = await Application.create({
      job: jobId,
      student: req.user._id,
      recruiter: job.recruiter._id,
      coverLetter,
      answers,
      timeline: [{
        status: 'pending',
        date: new Date(),
        note: 'Application submitted'
      }]
    });

    // Increment job application count
    await job.incrementApplicationCount();

    await application.populate([
      { path: 'student', select: 'name email profile studentProfile' },
      { path: 'job', select: 'title company' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application
    });
  } catch (error) {
    console.error('Apply for job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get user's applications
// @route   GET /api/applications/my
// @access  Private (Students only)
router.get('/my', protect, authorize('student'), validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const query = { student: req.user._id };
    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const applications = await Application.find(query)
      .populate('job', 'title company location jobType salary status')
      .populate('recruiter', 'name recruiterProfile.company')
      .skip(skip)
      .limit(parseInt(limit))
      .sort('-createdAt');

    const total = await Application.countDocuments(query);

    res.json({
      success: true,
      applications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get my applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get applications for recruiter's jobs
// @route   GET /api/applications/received
// @access  Private (Recruiters only)
router.get('/received', protect, authorize('recruiter'), validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, jobId } = req.query;
    
    const query = { recruiter: req.user._id };
    if (status) {
      query.status = status;
    }
    if (jobId) {
      query.job = jobId;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const applications = await Application.find(query)
      .populate('student', 'name email profile studentProfile')
      .populate('job', 'title company location jobType')
      .skip(skip)
      .limit(parseInt(limit))
      .sort('-createdAt');

    const total = await Application.countDocuments(query);

    res.json({
      success: true,
      applications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get received applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single application
// @route   GET /api/applications/:id
// @access  Private (Application owner, recruiter, or admin)
router.get('/:id', protect, validateObjectId, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('student', 'name email profile studentProfile')
      .populate('job', 'title company location jobType salary requirements')
      .populate('recruiter', 'name recruiterProfile.company');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check access permissions
    const hasAccess = 
      application.student._id.toString() === req.user._id.toString() ||
      application.recruiter._id.toString() === req.user._id.toString() ||
      req.user.role === 'admin';

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      application
    });
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update application status
// @route   PUT /api/applications/:id/status
// @access  Private (Recruiter or Admin)
router.put('/:id/status', protect, authorize('recruiter', 'admin'), validateObjectId, async (req, res) => {
  try {
    const { status, note } = req.body;

    const validStatuses = ['pending', 'under_review', 'interview', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if recruiter owns this application
    if (req.user.role === 'recruiter' && application.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update status
    application.status = status;
    
    // Add timeline entry
    application.timeline.push({
      status,
      date: new Date(),
      note: note || `Status changed to ${status}`,
      updatedBy: req.user._id
    });

    await application.save();

    await application.populate([
      { path: 'student', select: 'name email' },
      { path: 'job', select: 'title company' }
    ]);

    res.json({
      success: true,
      message: 'Application status updated successfully',
      application
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Schedule interview
// @route   PUT /api/applications/:id/interview
// @access  Private (Recruiter or Admin)
router.put('/:id/interview', protect, authorize('recruiter', 'admin'), validateObjectId, async (req, res) => {
  try {
    const { date, time, location, type, notes } = req.body;

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if recruiter owns this application
    if (req.user.role === 'recruiter' && application.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update interview details
    application.interview = {
      scheduled: true,
      date: new Date(date),
      time,
      location,
      type,
      notes
    };

    application.status = 'interview';

    // Add timeline entry
    application.timeline.push({
      status: 'interview',
      date: new Date(),
      note: `Interview scheduled for ${date} at ${time}`,
      updatedBy: req.user._id
    });

    await application.save();

    res.json({
      success: true,
      message: 'Interview scheduled successfully',
      application
    });
  } catch (error) {
    console.error('Schedule interview error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Withdraw application
// @route   PUT /api/applications/:id/withdraw
// @access  Private (Student only - own application)
router.put('/:id/withdraw', protect, authorize('student'), validateObjectId, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if student owns this application
    if (application.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Can't withdraw if already approved or rejected
    if (['approved', 'rejected'].includes(application.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot withdraw application at this stage'
      });
    }

    application.status = 'withdrawn';
    application.timeline.push({
      status: 'withdrawn',
      date: new Date(),
      note: 'Application withdrawn by student'
    });

    await application.save();

    res.json({
      success: true,
      message: 'Application withdrawn successfully'
    });
  } catch (error) {
    console.error('Withdraw application error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get application statistics
// @route   GET /api/applications/stats
// @access  Private (Recruiters and Admins)
router.get('/stats/overview', protect, authorize('recruiter', 'admin'), async (req, res) => {
  try {
    let matchQuery = {};
    
    if (req.user.role === 'recruiter') {
      matchQuery.recruiter = req.user._id;
    }

    const stats = await Application.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalApplications = await Application.countDocuments(matchQuery);

    const statusStats = stats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {});

    res.json({
      success: true,
      stats: {
        total: totalApplications,
        byStatus: statusStats
      }
    });
  } catch (error) {
    console.error('Get application stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;