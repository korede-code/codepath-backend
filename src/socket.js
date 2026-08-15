import { Server } from 'socket.io';
import { User, Activity, Follow } from './models/index.js';
import jwt from 'jsonwebtoken';

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      console.log('🔑 Socket auth token received:', !!token);
      
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.id);
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      socket.userId = user.id;
      next();
    } catch (error) {
      console.error('Socket auth error:', error);
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🟢 User connected: ${socket.userId}`);

    // Join user's personal room for private notifications
    socket.join(`user:${socket.userId}`);

    // Join user's followers room for public updates
    socket.join(`user:${socket.userId}`);
    socket.join('public');

    // Handle joining a lesson room
    socket.on('join-lesson', (lessonId) => {
      socket.join(`lesson:${lessonId}`);
      console.log(`📚 User ${socket.userId} joined lesson: ${lessonId}`);
    });

    // Handle leaving a lesson room
    socket.on('leave-lesson', (lessonId) => {
      socket.leave(`lesson:${lessonId}`);
      console.log(`📚 User ${socket.userId} joined lesson: ${lessonId}`);
    });

    // Handle typing indicator
    socket.on('typing', ({ lessonId, isTyping }) => {
      socket.to(`lesson:${lessonId}`).emit('user-typing', {
        userId: socket.userId,
        username: socket.user.username,
        isTyping
      });
    });

    // Handle new comment notification
    socket.on('new-comment', (data) => {
      // Broadcast to everyone in the lesson room
      io.to(`lesson:${data.lessonId}`).emit('comment-added', {
        ...data,
        user: {
          id: socket.userId,
          username: socket.user.username,
          avatar: socket.user.avatar
        }
      });
    });

    // Handle new reply notification
    socket.on('new-reply', (data) => {
      io.to(`lesson:${data.lessonId}`).emit('reply-added', data);
    });

    // Handle XP update
    socket.on('xp-update', (data) => {
      io.to(`user:${data.userId}`).emit('xp-earned', {
        xpEarned: data.xpEarned,
        newLevel: data.newLevel,
        totalXp: data.totalXp
      });
    });

    // Handle badge earned
    socket.on('badge-earned', (data) => {
      io.to(`user:${data.userId}`).emit('badge-unlocked', {
        badge: data.badge,
        earnedAt: data.earnedAt
      });
    });

    // Handle activity feed update
    socket.on('activity-update', async (data) => {
      try {
        // Create activity in database
        const activity = await Activity.create({
          userId: socket.userId,
          type: data.type,
          targetId: data.targetId,
          targetType: data.targetType,
          metadata: data.metadata
        });

        // Get user's followers
        const followers = await Follow.findAll({
          where: { followingId: socket.userId }
        });

        const followerIds = followers.map(f => f.followerId);

        // Send to followers
        followerIds.forEach(followerId => {
          io.to(`user:${followerId}`).emit('new-activity', {
            activity: {
              ...activity.toJSON(),
              User: {
                id: socket.userId,
                username: socket.user.username,
                avatar: socket.user.avatar
              }
            }
          });
        });

        // Also broadcast to public
        io.to('public').emit('new-activity', {
          activity: {
            ...activity.toJSON(),
            User: {
              id: socket.userId,
              username: socket.user.username,
              avatar: socket.user.avatar
            }
          }
        });
      } catch (error) {
        console.error('Activity update error:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`🔴 User disconnected: ${socket.userId}`);
    });
  });

  return io;
};

// Helper functions
export const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
};

export const emitToLesson = (lessonId, event, data) => {
  if (io) {
    io.to(`lesson:${lessonId}`).emit(event, data);
  }
};

export const emitPublic = (event, data) => {
  if (io) {
    io.to('public').emit(event, data);
  }
};

export const getIO = () => io;