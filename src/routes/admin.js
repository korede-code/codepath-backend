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

// ========== GET ALL COMMENTS ==========
router.get('/comments', authenticateToken, isAdmin, async (req, res) => {
  try {
    const comments = await Comment.findAll({
      include: [
        { model: User, attributes: ['id', 'username', 'avatar'] },
        { model: Lesson, attributes: ['id', 'title'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(comments);
  } catch (error) {
    console.error('Admin comments error:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// ========== DELETE COMMENT ==========
router.delete('/comments/:commentId', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { commentId } = req.params;
    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    await comment.destroy();
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Admin delete comment error:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

// ========== FIX LEADERBOARD XP - ONE TIME ==========
// Call: https://codepath-api-qje4.onrender.com/api/admin/fix-xp?secret=kore123
router.get('/fix-xp', async (req, res) => {
  // Allow either secret OR your admin token
  const isSecretOk = req.query.secret === 'kore123';
  
  if (!isSecretOk) {
    // If no secret, require normal admin auth
    try {
      await new Promise((resolve, reject) => {
        authenticateToken(req, res, (err) => err ? reject(err) : resolve());
      });
      await new Promise((resolve, reject) => {
        isAdmin(req, res, (err) => err ? reject(err) : resolve());
      });
    } catch {
      return res.status(403).json({ error: 'Forbidden - need secret or admin token' });
    }
  }

  try {
    const users = await User.findAll();
    let fixed = [];
    
    for (const u of users) {
      const sum = await UserProgress.sum('xpEarned', { 
        where: { userId: u.id, completed: true } 
      }) || 0;
      
      if (u.totalXp !== sum) {
        const oldXp = u.totalXp;
        u.totalXp = sum;
        u.level = Math.floor(sum / 100) + 1;
        if (sum > 0 && !u.lastActivity) u.lastActivity = new Date();
        await u.save();
        fixed.push({ username: u.username, oldXp, newXp: sum });
        console.log(`🔧 Fixed ${u.username}: ${oldXp} -> ${sum}`);
      }
    }
    
    res.json({ 
      success: true, 
      fixed, 
      totalChecked: users.length,
      message: `Fixed ${fixed.length} users. Leaderboard will now show correct XP.` 
    });
  } catch (e) {
    console.error('Fix XP error:', e);
    res.status(500).json({ error: e.message });
  }
});

export default router;