import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recruiter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'under_review', 'interview', 'approved', 'rejected', 'withdrawn'],
    default: 'pending'
  },
  coverLetter: {
    type: String,
    maxlength: [2000, 'Cover letter cannot exceed 2000 characters']
  },
  resume: {
    filename: String,
    originalName: String,
    path: String,
    size: Number,
    mimetype: String
  },
  answers: [{
    question: String,
    answer: String
  }],
  notes: {
    recruiter: String,
    student: String,
    admin: String
  },
  timeline: [{
    status: String,
    date: {
      type: Date,
      default: Date.now
    },
    note: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  interview: {
    scheduled: Boolean,
    date: Date,
    time: String,
    location: String,
    type: {
      type: String,
      enum: ['phone', 'video', 'in-person']
    },
    notes: String
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comments: String,
    strengths: [String],
    improvements: [String]
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate applications
applicationSchema.index({ job: 1, student: 1 }, { unique: true });
applicationSchema.index({ student: 1, status: 1 });
applicationSchema.index({ recruiter: 1, status: 1 });
applicationSchema.index({ createdAt: -1 });

// Add timeline entry when status changes
applicationSchema.pre('save', function(next) {
  if (this.isModified('status') && !this.isNew) {
    this.timeline.push({
      status: this.status,
      date: new Date(),
      note: `Status changed to ${this.status}`
    });
  }
  next();
});

// Static method to get application statistics
applicationSchema.statics.getStats = async function(recruiterId) {
  const stats = await this.aggregate([
    { $match: { recruiter: mongoose.Types.ObjectId(recruiterId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  return stats.reduce((acc, stat) => {
    acc[stat._id] = stat.count;
    return acc;
  }, {});
};

export default mongoose.model('Application', applicationSchema);