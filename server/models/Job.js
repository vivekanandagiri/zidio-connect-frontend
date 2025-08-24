import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [200, 'Job title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  recruiter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  jobType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Internship', 'Contract', 'Remote'],
    required: [true, 'Job type is required']
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true
  },
  salary: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'USD'
    },
    period: {
      type: String,
      enum: ['hour', 'month', 'year'],
      default: 'year'
    }
  },
  requirements: {
    skills: [String],
    experience: {
      min: Number,
      max: Number
    },
    education: String,
    other: [String]
  },
  benefits: [String],
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'closed', 'pending', 'approved', 'rejected'],
    default: 'pending'
  },
  applicationDeadline: Date,
  startDate: Date,
  isRemote: {
    type: Boolean,
    default: false
  },
  isUrgent: {
    type: Boolean,
    default: false
  },
  applicationCount: {
    type: Number,
    default: 0
  },
  viewCount: {
    type: Number,
    default: 0
  },
  bookmarkCount: {
    type: Number,
    default: 0
  },
  tags: [String],
  flagged: {
    type: Boolean,
    default: false
  },
  flagReason: String,
  adminNotes: String
}, {
  timestamps: true
});

// Indexes for search and filtering
jobSchema.index({ title: 'text', description: 'text', company: 'text' });
jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ recruiter: 1, status: 1 });
jobSchema.index({ jobType: 1, location: 1 });
jobSchema.index({ 'requirements.skills': 1 });

// Virtual for applications
jobSchema.virtual('applications', {
  ref: 'Application',
  localField: '_id',
  foreignField: 'job'
});

// Increment application count
jobSchema.methods.incrementApplicationCount = function() {
  this.applicationCount += 1;
  return this.save();
};

// Increment view count
jobSchema.methods.incrementViewCount = function() {
  this.viewCount += 1;
  return this.save();
};

export default mongoose.model('Job', jobSchema);