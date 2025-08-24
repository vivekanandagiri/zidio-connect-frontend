import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['student', 'recruiter', 'admin'],
    default: 'student'
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'suspended'],
    default: 'pending'
  },
  profile: {
    phone: String,
    location: String,
    bio: String,
    website: String,
    linkedin: String,
    github: String,
    avatar: String
  },
  // Student-specific fields
  studentProfile: {
    university: String,
    degree: String,
    graduationYear: Number,
    gpa: Number,
    skills: [String],
    resume: String,
    experience: [{
      title: String,
      company: String,
      startDate: Date,
      endDate: Date,
      description: String,
      current: Boolean
    }],
    education: [{
      institution: String,
      degree: String,
      field: String,
      startDate: Date,
      endDate: Date,
      gpa: Number
    }],
    projects: [{
      title: String,
      description: String,
      technologies: [String],
      url: String,
      github: String
    }]
  },
  // Recruiter-specific fields
  recruiterProfile: {
    company: String,
    position: String,
    companySize: String,
    industry: String,
    companyDescription: String,
    companyWebsite: String,
    verified: {
      type: Boolean,
      default: false
    }
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  profileViews: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for search functionality
userSchema.index({ name: 'text', email: 'text' });
userSchema.index({ role: 1, status: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get public profile (exclude sensitive data)
userSchema.methods.getPublicProfile = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

export default mongoose.model('User', userSchema);