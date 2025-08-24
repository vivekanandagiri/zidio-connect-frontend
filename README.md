# ZIDIO Connect - Job Placement Platform

A comprehensive full-stack job placement platform connecting students, recruiters, and administrators. Built with React, TypeScript, Node.js, and MongoDB.

## 🚀 Features

### For Students
- **Profile Management**: Create detailed profiles with education, experience, and skills
- **Job Search**: Advanced search and filtering capabilities
- **Application Tracking**: Monitor application status and timeline
- **Resume Upload**: Upload and manage resumes
- **Interview Scheduling**: View and manage interview appointments
- **Bookmarks**: Save interesting job opportunities

### For Recruiters
- **Job Posting**: Create and manage job listings
- **Application Management**: Review and process applications
- **Candidate Search**: Find suitable candidates based on skills and criteria
- **Interview Scheduling**: Schedule and manage interviews
- **Analytics**: Track hiring metrics and performance

### For Administrators
- **User Management**: Manage student and recruiter accounts
- **Content Moderation**: Review and approve job postings
- **Platform Analytics**: Comprehensive dashboard with insights
- **System Monitoring**: Track platform health and activity

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **React Query** for data fetching
- **React Router** for navigation
- **Context API** for state management

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Multer** for file uploads
- **Express Validator** for input validation
- **Helmet** for security headers
- **CORS** for cross-origin requests

## 📦 Project Structure

```
zidio-connect/
├── src/                    # Frontend source code
│   ├── components/         # React components
│   │   ├── auth/          # Authentication components
│   │   ├── dashboards/    # Role-specific dashboards
│   │   └── ui/            # Reusable UI components
│   ├── contexts/          # React contexts
│   ├── lib/               # Utilities and API client
│   ├── pages/             # Page components
│   └── hooks/             # Custom hooks
├── server/                # Backend source code
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── scripts/           # Utility scripts
│   └── uploads/           # File upload directory
└── public/                # Static assets
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd zidio-connect
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd server
   npm install
   cd ..
   ```

4. **Set up environment variables**
   
   **Frontend (.env):**
   ```bash
   cp .env.example .env
   ```
   
   **Backend (server/.env):**
   ```bash
   cd server
   cp .env.example .env
   ```
   
   Update the backend `.env` file with your MongoDB URI and JWT secret:
   ```
   MONGODB_URI=mongodb://localhost:27017/zidio-connect
   JWT_SECRET=your-super-secret-jwt-key
   ```

5. **Start MongoDB**
   Make sure MongoDB is running on your system

6. **Seed the database (optional)**
   ```bash
   cd server
   npm run seed
   cd ..
   ```

7. **Start the development servers**
   
   **Terminal 1 - Backend:**
   ```bash
   cd server
   npm run dev
   ```
   
   **Terminal 2 - Frontend:**
   ```bash
   npm run dev
   ```

8. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 🔐 Sample Credentials

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

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/password` - Update password

### Job Endpoints
- `GET /api/jobs` - Get all jobs (with filtering)
- `POST /api/jobs` - Create new job (recruiters only)
- `GET /api/jobs/:id` - Get single job
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job

### Application Endpoints
- `POST /api/applications` - Apply for job
- `GET /api/applications/my` - Get user's applications
- `GET /api/applications/received` - Get received applications
- `PUT /api/applications/:id/status` - Update application status

### User Endpoints
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `GET /api/users/search/profiles` - Search user profiles

### File Upload Endpoints
- `POST /api/upload/resume` - Upload resume
- `POST /api/upload/avatar` - Upload avatar

### Admin Endpoints
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/status` - Update user status
- `GET /api/admin/jobs` - Get all jobs
- `PUT /api/admin/jobs/:id/status` - Update job status

## 🔧 Development

### Available Scripts

**Frontend:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

**Backend:**
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run seed` - Populate database with sample data

### Code Style
- ESLint configuration for consistent code style
- TypeScript for type safety
- Prettier for code formatting

## 🚀 Deployment

### Frontend Deployment
1. Build the frontend:
   ```bash
   npm run build
   ```
2. Deploy the `dist` folder to your hosting service (Vercel, Netlify, etc.)

### Backend Deployment
1. Set up environment variables on your hosting service
2. Deploy to platforms like Heroku, Railway, or DigitalOcean
3. Ensure MongoDB is accessible from your deployment environment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](../../issues) page
2. Create a new issue with detailed information
3. Contact the development team

## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide React](https://lucide.dev/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)
- Backend powered by [Express.js](https://expressjs.com/)
- Database with [MongoDB](https://www.mongodb.com/)

---

## Original Lovable Project Info

**URL**: https://lovable.dev/projects/d26bdeb0-a57e-4aad-aba7-3aa48669d35f

This project was initially created with Lovable and has been extended with a complete backend implementation.