# CodePath Backend API

The backend API for CodePath - an immersive learning platform for beginner coders.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT with bcrypt
- **Deployment**: Render.com

## Features

- User Authentication (Register/Login/Google OAuth)
- Course Management
- Lesson Management
- Progress Tracking
- XP & Leveling System
- Badges System
- Leaderboard
- User Profiles

## API Endpoints

### Auth
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:courseId` - Get course with lessons
- `GET /api/courses/lesson/:lessonId` - Get lesson details

### Progress
- `GET /api/progress/dashboard` - Get user dashboard data
- `POST /api/progress/complete` - Complete a lesson

### Leaderboard
- `GET /api/leaderboard` - Get top users
- `GET /api/leaderboard/rank` - Get user rank

### Badges
- `GET /api/badges` - Get all badges with progress
- `GET /api/badges/user` - Get user's earned badges
- `GET /api/badges/next` - Get next badge to earn

## Installation

```bash
# Clone the repository
git clone https://github.com/korede-code/codepath-backend.git

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Run migrations
npm run migrate

# Start development server
npm run dev

# Start production server
npm start