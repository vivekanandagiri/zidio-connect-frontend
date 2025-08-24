import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { protect } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Ensure upload directories exist
const uploadDir = path.join(__dirname, '../uploads');
const resumeDir = path.join(uploadDir, 'resumes');
const avatarDir = path.join(uploadDir, 'avatars');

[uploadDir, resumeDir, avatarDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = uploadDir;
    
    if (file.fieldname === 'resume') {
      uploadPath = resumeDir;
    } else if (file.fieldname === 'avatar') {
      uploadPath = avatarDir;
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'resume') {
    // Allow PDF, DOC, DOCX for resumes
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, and DOCX files are allowed for resumes'), false);
    }
  } else if (file.fieldname === 'avatar') {
    // Allow images for avatars
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for avatars'), false);
    }
  } else {
    cb(new Error('Unexpected field'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB default
  }
});

// @desc    Upload resume
// @route   POST /api/upload/resume
// @access  Private (Students only)
router.post('/resume', protect, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only students can upload resumes'
      });
    }

    const fileInfo = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      url: `/uploads/resumes/${req.file.filename}`
    };

    // Update user's resume info
    const User = (await import('../models/User.js')).default;
    await User.findByIdAndUpdate(req.user._id, {
      'studentProfile.resume': fileInfo.url
    });

    res.json({
      success: true,
      message: 'Resume uploaded successfully',
      file: fileInfo
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    
    // Clean up uploaded file if there was an error
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during file upload'
    });
  }
});

// @desc    Upload avatar
// @route   POST /api/upload/avatar
// @access  Private
router.post('/avatar', protect, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const fileInfo = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      url: `/uploads/avatars/${req.file.filename}`
    };

    // Update user's avatar
    const User = (await import('../models/User.js')).default;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 'profile.avatar': fileInfo.url },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      file: fileInfo,
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    
    // Clean up uploaded file if there was an error
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during file upload'
    });
  }
});

// @desc    Delete file
// @route   DELETE /api/upload/:type/:filename
// @access  Private
router.delete('/:type/:filename', protect, async (req, res) => {
  try {
    const { type, filename } = req.params;
    
    const allowedTypes = ['resumes', 'avatars'];
    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type'
      });
    }

    const filePath = path.join(__dirname, '../uploads', type, filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Delete file
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Error deleting file:', err);
        return res.status(500).json({
          success: false,
          message: 'Error deleting file'
        });
      }

      res.json({
        success: true,
        message: 'File deleted successfully'
      });
    });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB.'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected field name.'
      });
    }
  }
  
  res.status(400).json({
    success: false,
    message: error.message || 'File upload error'
  });
});

export default router;