# ZIDIO Connect Backend API

A comprehensive backend API for the ZIDIO Connect job placement platform, supporting students, recruiters, and administrators.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **User Management**: Support for students, recruiters, and admins
- **Job Management**: CRUD operations for job postings with advanced filtering
- **Application System**: Complete application workflow with status tracking
- **File Upload**: Resume and avatar upload with validation
- **Admin Dashboard**: Comprehensive admin controls and analytics
- **Search & Filtering**: Advanced search capabilities across jobs and users
- **Analytics**: Detailed statistics and reporting

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Validation**: Express Validator
- **Security**: Helmet, CORS, Rate Limiting

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Clone and navigate to server directory**
   ```bash
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secure secret key for JWT tokens
   - Other settings as needed

4. **Start MongoDB**
   Make sure MongoDB is running on your system

5. **Seed the database (optional)**
   ```bash
   npm run seed
   ```

6. **Start the server**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

The API will be available at `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/password` - Update password
- `POST /api/auth/logout` - Logout user

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `GET /api/users/search/profiles` - Search user profiles
- `GET /api/users/:id/stats` - Get user statistics

### Jobs
- `GET /api/jobs` - Get all jobs (with filtering)
- `GET /api/jobs/:id` - Get single job
- `POST /api/jobs` - Create new job (recruiters only)
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job
- `GET /api/jobs/recruiter/:recruiterId` - Get jobs by recruiter
- `POST /api/jobs/:id/bookmark` - Bookmark job

### Applications
- `POST /api/applications` - Apply for job
- `GET /api/applications/my` - Get user's applications
- `GET /api/applications/received` - Get received applications (recruiters)
- `GET /api/applications/:id` - Get single application
- `PUT /api/applications/:id/status` - Update application status
- `PUT /api/applications/:id/interview` - Schedule interview
- `PUT /api/applications/:id/withdraw` - Withdraw application
- `GET /api/applications/stats/overview` - Get application statistics

### File Upload
- `POST /api/upload/resume` - Upload resume
- `POST /api/upload/avatar` - Upload avatar
- `DELETE /api/upload/:type/:filename` - Delete file

### Admin (Admin only)
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/status` - Update user status
- `GET /api/admin/jobs` - Get all jobs
- `PUT /api/admin/jobs/:id/status` - Update job status
- `PUT /api/admin/jobs/:id/flag` - Flag/unflag job
- `GET /api/admin/activity` - Get recent activity
- `GET /api/admin/analytics` - Get analytics data

## User Roles

### Student
- Create and manage profile
- Search and apply for jobs
- Track application status
- Upload resume and documents
- Bookmark jobs

### Recruiter
- Create and manage job postings
- Review applications
- Schedule interviews
- Search student profiles
- Manage application workflow

### Admin
- Manage all users and jobs
- Approve/reject job postings
- View platform analytics
- Monitor system activity
- Flag inappropriate content

## Database Models

### User
- Basic info (name, email, password)
- Role-based profiles (student/recruiter specific fields)
- Authentication and status management

### Job
- Job details and requirements
- Recruiter association
- Application tracking
- Status management

### Application
- Student-job relationship
- Status workflow
- Timeline tracking
- Interview scheduling

## Security Features

- JWT-based authentication
- Role-based access control
- Password hashing with bcrypt
- Rate limiting
- Input validation and sanitization
- File upload restrictions
- CORS configuration
- Security headers with Helmet

## Sample Data

After running the seed script, you can use these credentials:

**Admin**
- Email: admin@zidio.com
- Password: admin123

**Recruiter**
- Email: hr@techcorp.com
- Password: recruiter123

**Student**
- Email: sarah.johnson@email.com
- Password: student123

## Development

### Project Structure
```
server/
├── models/          # Database models
├── routes/          # API routes
├── middleware/      # Custom middleware
├── scripts/         # Utility scripts
├── uploads/         # File uploads directory
├── server.js        # Main server file
└── package.json     # Dependencies and scripts
```

### Scripts
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run seed` - Populate database with sample data

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| NODE_ENV | Environment mode | development |
| PORT | Server port | 5000 |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/zidio-connect |
| JWT_SECRET | JWT signing secret | (required) |
| JWT_EXPIRE | JWT expiration time | 7d |
| MAX_FILE_SIZE | Maximum file upload size | 5000000 (5MB) |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.