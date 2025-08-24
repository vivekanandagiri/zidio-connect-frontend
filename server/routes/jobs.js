import express from 'express';
import Job from '../models/Job.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateJob, validateObjectId, validatePagination } from '../middleware/validation.js';

const router = express.Router();

// @desc    Get all jobs with filtering and pagination
// @route   GET /api/jobs
// @access  Public
router.get('/', validatePagination, async (req, res) => {
  try {
    const {
      q,
      location,
      jobType,
      company,
      skills,
      salaryMin,
      salaryMax,
      isRemote,
      page = 1,
      limit = 10,
      sort = '-createdAt'
    } = req.query;

    const query = { status: 'active' };

    // Text search
    if (q) {
      query.$text = { $search: q };
    }

    // Location filter
    if (location) {
      query.location = new RegExp(location, 'i');
    }

    // Job type filter
    if (jobType) {
      query.jobType = jobType;
    }

    // Company filter
    if (company) {
      query.company = new RegExp(company, 'i');
    }

    // Skills filter
    if (skills) {
      const skillsArray = skills.split(',').map(skill => skill.trim());
      query['requirements.skills'] = { $in: skillsArray };
    }

    // Salary filter
    if (salaryMin || salaryMax) {
      query['salary.min'] = {};
      if (salaryMin) query['salary.min'].$gte = parseInt(salaryMin);
      if (salaryMax) query['salary.max'].$lte = parseInt(salaryMax);
    }

    // Remote filter
    if (isRemote === 'true') {
      query.isRemote = true;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const jobs = await Job.find(query)
      .populate('recruiter', 'name recruiterProfile.company')
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
    console.error('Get jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Public
router.get('/:id', validateObjectId, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('recruiter', 'name profile recruiterProfile');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Increment view count
    await job.incrementViewCount();

    res.json({
      success: true,
      job
    });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Create new job
// @route   POST /api/jobs
// @access  Private (Recruiters only)
router.post('/', protect, authorize('recruiter'), validateJob, async (req, res) => {
  try {
    const jobData = {
      ...req.body,
      recruiter: req.user._id
    };

    const job = await Job.create(jobData);
    await job.populate('recruiter', 'name recruiterProfile.company');

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      job
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private (Job owner or Admin)
router.put('/:id', protect, validateObjectId, validateJob, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user owns the job or is admin
    if (job.recruiter.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('recruiter', 'name recruiterProfile.company');

    res.json({
      success: true,
      message: 'Job updated successfully',
      job: updatedJob
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private (Job owner or Admin)
router.delete('/:id', protect, validateObjectId, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user owns the job or is admin
    if (job.recruiter.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await Job.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get jobs by recruiter
// @route   GET /api/jobs/recruiter/:recruiterId
// @access  Private
router.get('/recruiter/:recruiterId', protect, validateObjectId, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const query = { recruiter: req.params.recruiterId };
    if (status) {
      query.status = status;
    }

    // Check if user can access these jobs
    if (req.user._id.toString() !== req.params.recruiterId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const jobs = await Job.find(query)
      .populate('recruiter', 'name recruiterProfile.company')
      .skip(skip)
      .limit(parseInt(limit))
      .sort('-createdAt');

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
    console.error('Get recruiter jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Toggle job bookmark
// @route   POST /api/jobs/:id/bookmark
// @access  Private (Students only)
router.post('/:id/bookmark', protect, authorize('student'), validateObjectId, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // This would typically be stored in a separate Bookmark model
    // For now, we'll just increment the bookmark count
    job.bookmarkCount += 1;
    await job.save();

    res.json({
      success: true,
      message: 'Job bookmarked successfully'
    });
  } catch (error) {
    console.error('Bookmark job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;