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
import leaderboardRoutes from './src/routes/leaderboard.js';
import badgeRoutes from './src/routes/badges.js';
import commentRoutes from './src/routes/comments.js';
import discussionRoutes from './src/routes/discussions.js';
import communityRoutes from './src/routes/community.js';
import adminRoutes from './src/routes/admin.js';
import gamificationRoutes from './src/routes/gamification.js';

dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 5000;

// Render is behind proxy - needed for rate-limit to work
app.set('trust proxy', 1);

// Security - but allow Expo + WebView
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
}));

// CORS
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
    // Allow mobile apps, Expo Go, Postman (no origin)
    if (!origin) return callback(null, true);
    
    // Allow Expo tunnel, ngrok, any exp.direct
    if (
      origin.includes('exp.direct') ||
      origin.includes('expo.dev') ||
      origin.includes('ngrok.io') ||
      origin.includes('ngrok-free.app') ||
      origin.startsWith('exp://')
    ) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    console.log('❌ Blocked origin:', origin);
    callback(null, true); // In production, allow anyway for mobile - change to error if you want strict
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Socket.IO with CORS
const io = new SocketServer(server, {
  cors: {
    origin: '*', // Allow all for mobile + web - restrict if needed
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Make io available in routes if needed
app.set('io', io);

io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('🔌 User disconnected:', socket.id);
  });
});

// Routes
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

// NEW: Playground proxy - avoids CORS from Android to Piston
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'CodePath API is running',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV
  });
});

// Error handler
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
    await sequelize.sync({ alter: true });
    console.log('✅ Database synchronized');
    await seedDatabase();
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🔌 WebSocket ready`);
    });
  } catch (error) {
    console.error('❌ DB error:', error);
    process.exit(1);
  }
}

startServer();

export { io };