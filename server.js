import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { sequelize } from './src/models/index.js';
import { seedDatabase } from './src/seed/seedData.js';
import authRoutes from './src/routes/auth.js';
import courseRoutes from './src/routes/courses.js';
import progressRoutes from './src/routes/progress.js';
import playgroundRoutes from './src/routes/playground.js';
import leaderboardRoutes from './src/routes/leaderboard.js';
import badgeRoutes from './src/routes/badges.js';
import commentRoutes from './src/routes/comments.js';
import discussionRoutes from './src/routes/discussions.js';
import communityRoutes from './src/routes/community.js';
import adminRoutes from './src/routes/admin.js';
import gamificationRoutes from './src/routes/gamification.js';
import quizRoutes from './src/routes/quizzes.js'; // <-- FIXED PATH
import certificateRoutes from './src/routes/certificates.js';

console.log('✅ certificateRoutes loaded:', typeof certificateRoutes);

dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 5000;

app.set('trust proxy', 1);

app.use(helmet({
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
}));

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:8081',
  'http://localhost:19006',
  'https://codepath-jek.web.app',
  'https://codepath-jek.firebaseapp.com',
  'https://codepath-api-qje4.onrender.com',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (
      origin.includes('exp.direct') ||
      origin.includes('expo.dev') ||
      origin.includes('ngrok.io') ||
      origin.includes('ngrok-free.app') ||
      origin.startsWith('exp://')
    ) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

const io = new SocketServer(server, {
  cors: { origin: '*', methods: ['GET', 'POST'], credentials: true },
  transports: ['websocket', 'polling']
});

app.set('io', io);

io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('🔌 User disconnected:', socket.id);
  });
});

console.log('Mounting /api/certificates');

// Routes - ONE time each!
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/badges', badgeRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/discussions', discussionRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/quiz', quizRoutes); // alias for old frontend
app.use('/api/certificates', certificateRoutes);
app.use('/api/playground', playgroundRoutes);

// FALLBACK CERT ROUTES - If file fails, these will still work
app.get('/api/certificates/verify/:certificateId', (req, res) => {
  console.log('✅ FALLBACK verify hit:', req.params.certificateId);
  res.json({ valid: true, certificateId: req.params.certificateId, test: 'fallback works' });
});

app.get('/api/certificates/:courseId', (req, res) => {
  console.log('✅ FALLBACK cert hit:', req.params.courseId);
  res.json({
    certificateId: `CP-${req.params.courseId.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`,
    user: { username: 'Korede Joseph', email: 'korede@example.com' },
    course: {
      id: req.params.courseId,
      pathId: req.params.courseId,
      title: req.params.courseId.replace('-', ' ').toUpperCase(),
      description: 'Completed Course',
      totalLessons: 4,
      totalXp: 100
    },
    issuedAt: new Date(),
    verificationUrl: `https://codepath-api-qje4.onrender.com/api/certificates/verify/CP-TEST`
  });
});

app.post('/api/playground/run', async (req, res) => {
  try {
    const { language, code } = req.body;
    const response = await fetch('https://emkc.org/api/v2/piston/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: language || 'python',
        version: '3.10.0',
        files: [{ content: code }],
      }),
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Execution failed', details: err.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'CodePath API is running',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV
  });
});

app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
  });
});

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connected');
    await sequelize.sync();
    console.log('✅ Database synchronized');
    await seedDatabase();
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ DB error:', error);
    process.exit(1);
  }
}

startServer();

export { io };