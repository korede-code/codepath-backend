import express from 'express';
import { Op } from 'sequelize';
import { User, Course, Lesson, UserProgress, Badge, UserBadge, Comment, DiscussionTopic } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';
import { isAdmin } from '../middleware/admin.js';

const router = express.Router();

// ========== DASHBOARD STATS ==========
router.get('/stats', authenticateToken, isAdmin, async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalCourses = await Course.count();
    const totalLessons = await Lesson.count();
    const totalComments = await Comment.count();
    const totalTopics = await DiscussionTopic.count();
    
    // Active users (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const activeUsers = await User.count({
      where: { lastActivity: { [Op.gte]: sevenDaysAgo } }
    });
    
    // Completed lessons
    const completedLessons = await UserProgress.count({
      where: { completed: true }
    });
    
    // Total XP earned
    const totalXp = await User.sum('totalXp') || 0;
    
    // Course completion stats
    const courseStats = await Promise.all((await Course.findAll()).map(async (course) => {
      const lessons = await Lesson.findAll({ where: { courseId: course.id } });
      const lessonIds = lessons.map(l => l.id);
      const completed = await UserProgress.count({
        where: { lessonId: lessonIds, completed: true }
      });
      const totalStudents = await UserProgress.count({
        where: { lessonId: lessonIds },
        distinct: true,
        col: 'userId'
      });
      
      return {
        id: course.id,
        title: course.title,
        totalLessons: lessons.length,
        totalCompletions: completed,
        totalStudents,
        completionRate: totalStudents > 0 ? Math.round((completed / (totalStudents * lessons.length)) * 100) : 0
      };
    }));
    
    // Recent activity
    const recentActivities = await User.findAll({
      order: [['lastActivity', 'DESC']],
      limit: 10,
      attributes: ['id', 'username', 'lastActivity', 'totalXp', 'level']
    });
    
    res.json({
      stats: {
        totalUsers,
        activeUsers,
        totalCourses,
        totalLessons,
        totalComments,
        totalTopics,
        completedLessons,
        totalXp
      },
      courseStats,
      recentActivities
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
});

// ========== USERS MANAGEMENT ==========
router.get('/users', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { limit = 50, offset = 0, search = '' } = req.query;
    
    const where = {};
    if (search) {
      where[Op.or] = [
        { username: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    const { count, rows: users } = await User.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      attributes: { exclude: ['password'] }
    });
    
    // Get badge counts for users
    const userIds = users.map(u => u.id);
    const badgeCounts = await UserBadge.findAll({
      where: { userId: userIds },
      attributes: ['userId'],
      group: ['userId']
    });
    
    const badgeCountMap = {};
    badgeCounts.forEach(bc => {
      badgeCountMap[bc.userId] = bc.count;
    });
    
    const usersWithBadgeCount = users.map(user => ({
      ...user.toJSON(),
      badgeCount: badgeCountMap[user.id] || 0
    }));
    
    res.json({
      users: usersWithBadgeCount,
      total: count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// ========== USER DETAIL ==========
router.get('/users/:userId', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
      include: [
        { model: UserBadge, include: [{ model: Badge }] },
        { model: UserProgress, where: { completed: true }, required: false }
      ]
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Admin user detail error:', error);
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
});

// ========== COURSES MANAGEMENT ==========
router.get('/courses', authenticateToken, isAdmin, async (req, res) => {
  try {
    const courses = await Course.findAll({
      include: [{ model: Lesson }],
      order: [['order', 'ASC']]
    });
    
    const courseStats = await Promise.all(courses.map(async (course) => {
      const lessonIds = course.Lessons.map(l => l.id);
      const completed = await UserProgress.count({
        where: { lessonId: lessonIds, completed: true }
      });
      const totalStudents = await UserProgress.count({
        where: { lessonId: lessonIds },
        distinct: true,
        col: 'userId'
      });
      
      return {
        ...course.toJSON(),
        totalCompletions: completed,
        totalStudents,
        completionRate: totalStudents > 0 ? Math.round((completed / (totalStudents * course.Lessons.length)) * 100) : 0
      };
    }));
    
    res.json(courseStats);
  } catch (error) {
    console.error('Admin courses error:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// ========== ACTIVITY LOGS ==========
router.get('/activities', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    const activities = await User.findAll({
      attributes: ['id', 'username', 'email', 'lastActivity', 'totalXp', 'level', 'createdAt'],
      order: [['lastActivity', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json({
      activities,
      total: await User.count(),
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Admin activities error:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

export default router;