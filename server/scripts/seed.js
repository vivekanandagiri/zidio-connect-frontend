import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for seeding');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Job.deleteMany({});
    await Application.deleteMany({});

    console.log('Cleared existing data');

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@zidio.com',
      password: 'admin123',
      role: 'admin',
      status: 'active'
    });

    // Create sample recruiters
    const recruiters = await User.create([
      {
        name: 'TechCorp Recruiter',
        email: 'hr@techcorp.com',
        password: 'recruiter123',
        role: 'recruiter',
        status: 'active',
        recruiterProfile: {
          company: 'TechCorp Inc.',
          position: 'HR Manager',
          companySize: '500-1000',
          industry: 'Technology',
          companyDescription: 'Leading technology company specializing in web development and AI solutions.',
          companyWebsite: 'https://techcorp.com',
          verified: true
        }
      },
      {
        name: 'Innovation Labs HR',
        email: 'careers@innovationlabs.com',
        password: 'recruiter123',
        role: 'recruiter',
        status: 'active',
        recruiterProfile: {
          company: 'Innovation Labs',
          position: 'Talent Acquisition Specialist',
          companySize: '100-500',
          industry: 'Software Development',
          companyDescription: 'Innovative software development company creating cutting-edge solutions.',
          companyWebsite: 'https://innovationlabs.com',
          verified: true
        }
      },
      {
        name: 'DataFlow Solutions',
        email: 'jobs@dataflow.com',
        password: 'recruiter123',
        role: 'recruiter',
        status: 'pending',
        recruiterProfile: {
          company: 'DataFlow Solutions',
          position: 'Recruitment Manager',
          companySize: '50-100',
          industry: 'Data Analytics',
          companyDescription: 'Data analytics company helping businesses make data-driven decisions.',
          companyWebsite: 'https://dataflow.com',
          verified: false
        }
      }
    ]);

    // Create sample students
    const students = await User.create([
      {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        password: 'student123',
        role: 'student',
        status: 'active',
        profile: {
          location: 'San Francisco, CA',
          bio: 'Computer Science student passionate about web development and AI.',
          linkedin: 'https://linkedin.com/in/sarahjohnson'
        },
        studentProfile: {
          university: 'Stanford University',
          degree: 'Bachelor of Science in Computer Science',
          graduationYear: 2024,
          gpa: 3.8,
          skills: ['JavaScript', 'React', 'Node.js', 'Python', 'Machine Learning'],
          experience: [{
            title: 'Software Engineering Intern',
            company: 'Google',
            startDate: new Date('2023-06-01'),
            endDate: new Date('2023-08-31'),
            description: 'Worked on frontend development for Google Search features.',
            current: false
          }],
          education: [{
            institution: 'Stanford University',
            degree: 'Bachelor of Science',
            field: 'Computer Science',
            startDate: new Date('2020-09-01'),
            endDate: new Date('2024-06-01'),
            gpa: 3.8
          }]
        }
      },
      {
        name: 'John Smith',
        email: 'john.smith@email.com',
        password: 'student123',
        role: 'student',
        status: 'active',
        profile: {
          location: 'New York, NY',
          bio: 'Marketing student with experience in digital marketing and analytics.',
          linkedin: 'https://linkedin.com/in/johnsmith'
        },
        studentProfile: {
          university: 'New York University',
          degree: 'Bachelor of Business Administration',
          graduationYear: 2024,
          gpa: 3.6,
          skills: ['Digital Marketing', 'Google Analytics', 'SEO', 'Content Marketing', 'Social Media'],
          experience: [{
            title: 'Marketing Intern',
            company: 'Creative Agency',
            startDate: new Date('2023-01-01'),
            endDate: new Date('2023-05-31'),
            description: 'Assisted with social media campaigns and content creation.',
            current: false
          }]
        }
      },
      {
        name: 'Mike Chen',
        email: 'mike.chen@email.com',
        password: 'student123',
        role: 'student',
        status: 'active',
        profile: {
          location: 'Seattle, WA',
          bio: 'UX/UI Designer with a passion for creating user-centered designs.',
          linkedin: 'https://linkedin.com/in/mikechen'
        },
        studentProfile: {
          university: 'University of Washington',
          degree: 'Bachelor of Design',
          graduationYear: 2024,
          gpa: 3.7,
          skills: ['UI/UX Design', 'Figma', 'Adobe Creative Suite', 'Prototyping', 'User Research'],
          projects: [{
            title: 'E-commerce Mobile App',
            description: 'Designed a complete mobile app for online shopping with focus on user experience.',
            technologies: ['Figma', 'Sketch', 'InVision'],
            url: 'https://behance.net/mikechen/ecommerce-app'
          }]
        }
      }
    ]);

    // Create sample jobs
    const jobs = await Job.create([
      {
        title: 'Frontend Developer Intern',
        description: 'Join our dynamic frontend team and work on cutting-edge React applications. You will be responsible for developing user interfaces, implementing responsive designs, and collaborating with our design team to create amazing user experiences.',
        company: 'TechCorp Inc.',
        recruiter: recruiters[0]._id,
        location: 'San Francisco, CA',
        jobType: 'Internship',
        department: 'Engineering',
        salary: {
          min: 20,
          max: 25,
          period: 'hour'
        },
        requirements: {
          skills: ['React', 'JavaScript', 'HTML', 'CSS', 'TypeScript'],
          experience: { min: 0, max: 1 },
          education: 'Bachelor\'s degree in Computer Science or related field',
          other: ['Strong problem-solving skills', 'Team player']
        },
        benefits: ['Health insurance', 'Flexible hours', 'Learning opportunities'],
        status: 'active',
        applicationDeadline: new Date('2024-03-01'),
        startDate: new Date('2024-06-01'),
        isRemote: false,
        tags: ['frontend', 'react', 'internship']
      },
      {
        title: 'Software Engineer',
        description: 'We\'re looking for a passionate software engineer to join our growing team. You will work on backend services, APIs, and database design while collaborating with cross-functional teams.',
        company: 'Innovation Labs',
        recruiter: recruiters[1]._id,
        location: 'Remote',
        jobType: 'Full-time',
        department: 'Engineering',
        salary: {
          min: 75000,
          max: 95000,
          period: 'year'
        },
        requirements: {
          skills: ['Node.js', 'JavaScript', 'MongoDB', 'Express.js', 'REST APIs'],
          experience: { min: 2, max: 5 },
          education: 'Bachelor\'s degree in Computer Science or equivalent experience',
          other: ['Experience with cloud platforms', 'Agile methodology experience']
        },
        benefits: ['Health insurance', 'Remote work', '401k matching', 'Professional development'],
        status: 'active',
        applicationDeadline: new Date('2024-02-28'),
        startDate: new Date('2024-04-01'),
        isRemote: true,
        tags: ['backend', 'nodejs', 'remote', 'fulltime']
      },
      {
        title: 'Data Science Intern',
        description: 'Exciting opportunity to work with big data and machine learning algorithms. You will analyze large datasets, build predictive models, and create data visualizations.',
        company: 'DataFlow Solutions',
        recruiter: recruiters[2]._id,
        location: 'New York, NY',
        jobType: 'Internship',
        department: 'Data Science',
        salary: {
          min: 18,
          max: 22,
          period: 'hour'
        },
        requirements: {
          skills: ['Python', 'SQL', 'Machine Learning', 'Pandas', 'NumPy'],
          experience: { min: 0, max: 1 },
          education: 'Bachelor\'s degree in Data Science, Statistics, or related field',
          other: ['Strong analytical skills', 'Experience with data visualization tools']
        },
        benefits: ['Mentorship program', 'Flexible schedule', 'Learning stipend'],
        status: 'pending',
        applicationDeadline: new Date('2024-02-25'),
        startDate: new Date('2024-05-15'),
        isRemote: false,
        tags: ['datascience', 'python', 'internship', 'ml']
      },
      {
        title: 'UX Designer',
        description: 'Join our design team to create intuitive and beautiful user experiences. You will conduct user research, create wireframes and prototypes, and collaborate with developers.',
        company: 'TechCorp Inc.',
        recruiter: recruiters[0]._id,
        location: 'San Francisco, CA',
        jobType: 'Full-time',
        department: 'Design',
        salary: {
          min: 80000,
          max: 100000,
          period: 'year'
        },
        requirements: {
          skills: ['UI/UX Design', 'Figma', 'Sketch', 'Prototyping', 'User Research'],
          experience: { min: 2, max: 4 },
          education: 'Bachelor\'s degree in Design, HCI, or related field',
          other: ['Portfolio required', 'Experience with design systems']
        },
        benefits: ['Health insurance', 'Design tools budget', 'Conference attendance'],
        status: 'active',
        applicationDeadline: new Date('2024-03-15'),
        startDate: new Date('2024-05-01'),
        isRemote: false,
        tags: ['design', 'ux', 'ui', 'fulltime']
      }
    ]);

    // Create sample applications
    const applications = await Application.create([
      {
        job: jobs[0]._id, // Frontend Developer Intern
        student: students[0]._id, // Sarah Johnson
        recruiter: recruiters[0]._id,
        status: 'under_review',
        coverLetter: 'I am excited to apply for the Frontend Developer Intern position. My experience with React and passion for creating great user experiences make me a perfect fit for this role.',
        timeline: [
          {
            status: 'pending',
            date: new Date('2024-01-15'),
            note: 'Application submitted'
          },
          {
            status: 'under_review',
            date: new Date('2024-01-18'),
            note: 'Application under review'
          }
        ]
      },
      {
        job: jobs[1]._id, // Software Engineer
        student: students[0]._id, // Sarah Johnson
        recruiter: recruiters[1]._id,
        status: 'interview',
        coverLetter: 'I am interested in the Software Engineer position at Innovation Labs. My backend development skills and experience with Node.js align well with your requirements.',
        interview: {
          scheduled: true,
          date: new Date('2024-01-25'),
          time: '2:00 PM',
          location: 'Video call',
          type: 'video',
          notes: 'Technical interview with the engineering team'
        },
        timeline: [
          {
            status: 'pending',
            date: new Date('2024-01-10'),
            note: 'Application submitted'
          },
          {
            status: 'under_review',
            date: new Date('2024-01-12'),
            note: 'Application under review'
          },
          {
            status: 'interview',
            date: new Date('2024-01-20'),
            note: 'Interview scheduled'
          }
        ]
      },
      {
        job: jobs[3]._id, // UX Designer
        student: students[2]._id, // Mike Chen
        recruiter: recruiters[0]._id,
        status: 'approved',
        coverLetter: 'As a UX Designer with experience in user research and prototyping, I am excited about the opportunity to contribute to TechCorp\'s design team.',
        timeline: [
          {
            status: 'pending',
            date: new Date('2024-01-05'),
            note: 'Application submitted'
          },
          {
            status: 'under_review',
            date: new Date('2024-01-08'),
            note: 'Application under review'
          },
          {
            status: 'interview',
            date: new Date('2024-01-12'),
            note: 'Interview completed'
          },
          {
            status: 'approved',
            date: new Date('2024-01-15'),
            note: 'Offer extended'
          }
        ]
      }
    ]);

    // Update job application counts
    for (const job of jobs) {
      const applicationCount = await Application.countDocuments({ job: job._id });
      job.applicationCount = applicationCount;
      await job.save();
    }

    console.log('Seed data created successfully!');
    console.log('\nLogin credentials:');
    console.log('Admin: admin@zidio.com / admin123');
    console.log('Recruiter: hr@techcorp.com / recruiter123');
    console.log('Student: sarah.johnson@email.com / student123');
    
  } catch (error) {
    console.error('Seeding error:', error);
  }
};

const runSeed = async () => {
  await connectDB();
  await seedData();
  await mongoose.connection.close();
  console.log('Database connection closed');
  process.exit(0);
};

runSeed();