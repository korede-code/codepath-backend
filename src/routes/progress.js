import express from 'express';
import { Op } from 'sequelize';
import { User, Lesson, UserProgress, Badge, UserBadge, Course } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// ========== DASHBOARD ENDPOINT ==========
// Get user progress for dashboard
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(`📊 Fetching dashboard for user: ${userId}`);
    
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get all completed lessons
    const completedProgress = await UserProgress.findAll({
      where: { userId, completed: true },
      order: [['completedAt', 'ASC']]
    });
    
    const totalCompleted = completedProgress.length;
    const totalXp = completedProgress.reduce((sum, p) => sum + (p.xpEarned || 0), 0);
    
    // XP History (last 30 days)
    const xpHistory = [];
    const dailyXpMap = {};
    
    completedProgress.forEach(p => {
      if (p.completedAt) {
        const date = new Date(p.completedAt).toISOString().split('T')[0];
        dailyXpMap[date] = (dailyXpMap[date] || 0) + (p.xpEarned || 0);
      }
    });
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      xpHistory.push({
        date: dateStr,
        xp: dailyXpMap[dateStr] || 0
      });
    }
    
    // Weekly XP
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const weeklyProgress = completedProgress.filter(p => 
      p.completedAt && new Date(p.completedAt) >= sevenDaysAgo
    );
    const weeklyXP = weeklyProgress.reduce((sum, p) => sum + (p.xpEarned || 0), 0);
    
    // Projects completed
    const projectLessons = await Lesson.findAll({ where: { type: 'project' } });
    const projectIds = projectLessons.map(l => l.id);
    const completedProjects = completedProgress.filter(p => 
      projectIds.includes(p.lessonId)
    ).length;
    
    // User's badges
    const userBadges = await UserBadge.findAll({
      where: { userId },
      include: [{ model: Badge }],
      order: [['earnedAt', 'DESC']]
    });
    
    const seen = new Set();
    const uniqueBadges = [];
    userBadges.forEach(ub => {
      const badgeId = ub.Badge?.id;
      if (badgeId && !seen.has(badgeId)) {
        seen.add(badgeId);
        uniqueBadges.push({
          ...ub.Badge.toJSON(),
          earnedAt: ub.earnedAt
        });
      }
    });
    
    // Recent activity
    const recentActivity = await UserProgress.findAll({
      where: { userId, completed: true },
      include: [{ model: Lesson }],
      order: [['completedAt', 'DESC']],
      limit: 10
    });
    
    // Course progress
    const allCourses = await Course.findAll({
      include: [{ model: Lesson }]
    });
    
    const courseProgress = allCourses.map(course => {
      const lessonIds = course.Lessons.map(l => l.id);
      const completedInCourse = completedProgress.filter(p => 
        lessonIds.includes(p.lessonId)
      ).length;
      const progress = course.Lessons.length > 0 
        ? Math.round((completedInCourse / course.Lessons.length) * 100)
        : 0;
      
      const courseProgresses = completedProgress.filter(p => 
        lessonIds.includes(p.lessonId)
      );
      const firstCompleted = courseProgresses.length > 0 
        ? new Date(Math.min(...courseProgresses.map(p => new Date(p.completedAt).getTime())))
        : null;
      const lastCompleted = courseProgresses.length > 0 
        ? new Date(Math.max(...courseProgresses.map(p => new Date(p.completedAt).getTime())))
        : null;
      
      return {
        courseId: course.id,
        pathId: course.pathId,
        title: course.title,
        icon: course.icon,
        progress: progress,
        completedLessons: completedInCourse,
        totalLessons: course.Lessons.length,
        firstCompleted: firstCompleted,
        lastCompleted: lastCompleted
      };
    });
    
    // Current course
    let currentCourse = null;
    let maxProgress = -1;
    courseProgress.forEach(cp => {
      if (cp.progress > maxProgress && cp.progress > 0) {
        maxProgress = cp.progress;
        currentCourse = cp;
      }
    });
    if (!currentCourse && allCourses.length > 0) {
      const firstCourse = allCourses[0];
      currentCourse = {
        courseId: firstCourse.id,
        pathId: firstCourse.pathId,
        title: firstCourse.title,
        icon: firstCourse.icon,
        progress: 0,
        completedLessons: 0,
        totalLessons: firstCourse.Lessons.length
      };
    }
    
    // Rank
    const rank = await User.count({
      where: { totalXp: { [Op.gt]: user.totalXp } }
    }) + 1;
    
    // Learning statistics
    const totalLessons = await Lesson.count();
    const completionRate = totalLessons > 0 
      ? Math.round((totalCompleted / totalLessons) * 100)
      : 0;
    
    // Activity data
    const activityData = xpHistory.map(day => ({
      date: day.date,
      count: day.xp > 0 ? 1 : 0,
      xp: day.xp
    }));
    
    // Weekly goals
    const weeklyGoal = 200;
    const weeklyProgressPercentage = Math.min(100, Math.round((weeklyXP / weeklyGoal) * 100));
    
    const response = {
      stats: {
        completedCourses: courseProgress.filter(c => c.progress === 100).length,
        completedLessons: totalCompleted,
        completedProjects: completedProjects,
        totalXp: user.totalXp || totalXp,
        level: user.level || 1,
        rank: rank || 0,
        streak: user.streak || 0,
        badgesCount: uniqueBadges.length || 0
      },
      weeklyXP: weeklyXP,
      weeklyGoal: weeklyGoal,
      weeklyProgressPercentage: weeklyProgressPercentage,
      recentBadges: uniqueBadges.slice(0, 5),
      recentActivity: recentActivity.map(ra => ({
        id: ra.id,
        lessonTitle: ra.Lesson?.title || 'Unknown Lesson',
        xpEarned: ra.xpEarned || 0,
        completedAt: ra.completedAt
      })),
      currentCourse: currentCourse,
      courseProgress: courseProgress,
      xpHistory: xpHistory,
      activityData: activityData,
      completionRate: completionRate,
      totalLessons: totalLessons,
      user: {
        username: user.username,
        avatar: user.avatar,
        bio: user.bio,
        createdAt: user.createdAt
      },
      weeklyDistribution: [
        { day: 'Mon', xp: Math.floor(Math.random() * 30) + 10 },
        { day: 'Tue', xp: Math.floor(Math.random() * 30) + 10 },
        { day: 'Wed', xp: Math.floor(Math.random() * 30) + 10 },
        { day: 'Thu', xp: Math.floor(Math.random() * 30) + 10 },
        { day: 'Fri', xp: Math.floor(Math.random() * 30) + 10 },
        { day: 'Sat', xp: Math.floor(Math.random() * 30) + 10 },
        { day: 'Sun', xp: Math.floor(Math.random() * 30) + 10 }
      ]
    };
    
    console.log('✅ Advanced dashboard data sent');
    res.json(response);
  } catch (error) {
    console.error('❌ Dashboard error:', error);
    res.status(500).json({ 
      error: 'Failed to get dashboard data',
      details: error.message 
    });
  }
});

// ========== COMPLETE LESSON ENDPOINT ==========
// Complete a lesson - ADD THIS
router.post('/complete', authenticateToken, async (req, res) => {
  try {
    const { lessonId } = req.body;
    const userId = req.user.id;
    
    console.log(`📚 Completing lesson ${lessonId} for user ${userId}`);
    
    if (!lessonId) {
      return res.status(400).json({ error: 'Lesson ID is required' });
    }
    
    const lesson = await Lesson.findByPk(lessonId);
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }
    
    // Check if already completed
    const existing = await UserProgress.findOne({
      where: { userId, lessonId }
    });
    
    if (existing && existing.completed) {
      return res.status(400).json({ error: 'Lesson already completed' });
    }
    
    // Get or create progress
    let progress;
    const xpEarned = lesson.xpValue || 10;
    
    if (existing) {
      progress = existing;
      progress.completed = true;
      progress.completedAt = new Date();
      progress.xpEarned = xpEarned;
      await progress.save();
    } else {
      progress = await UserProgress.create({
        userId,
        lessonId,
        courseId: lesson.courseId,
        completed: true,
        completedAt: new Date(),
        xpEarned: xpEarned,
        attempts: 1
      });
    }
    
    // Update user
    const user = await User.findByPk(userId);
    user.totalXp = (user.totalXp || 0) + xpEarned;
    user.lastActivity = new Date();
    
    // Update streak
    const today = new Date().toDateString();
    if (user.lastActivity) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (user.lastActivity.toDateString() === yesterday.toDateString()) {
        user.streak = (user.streak || 0) + 1;
      } else if (user.lastActivity.toDateString() !== today) {
        user.streak = 1;
      }
    } else {
      user.streak = 1;
    }
    
    // Update level
    user.level = calculateLevel(user.totalXp);
    await user.save();
    
    // Check for badge unlocks
    const newBadges = await checkBadges(userId);
    
    res.json({
      success: true,
      xpEarned: xpEarned,
      newLevel: user.level,
      totalXp: user.totalXp,
      newBadges: newBadges
    });
  } catch (error) {
    console.error('❌ Complete lesson error:', error);
    res.status(500).json({ 
      error: 'Failed to complete lesson',
      details: error.message 
    });
  }
});

// ========== HELPER FUNCTIONS ==========
function calculateLevel(xp) {
  if (xp < 100) return 1;
  if (xp < 300) return 2;
  if (xp < 600) return 3;
  if (xp < 1000) return 4;
  if (xp < 1500) return 5;
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

async function checkBadges(userId) {
  try {
    const user = await User.findByPk(userId);
    const allBadges = await Badge.findAll();
    const userBadges = await UserBadge.findAll({ where: { userId } });
    const earnedBadgeIds = userBadges.map(ub => ub.badgeId);
    const newBadges = [];
    
    for (const badge of allBadges) {
      if (earnedBadgeIds.includes(badge.id)) continue;
      
      let qualifies = false;
      switch (badge.requirementType) {
        case 'lessons_completed': {
          const count = await UserProgress.count({ 
            where: { userId, completed: true } 
          });
          qualifies = count >= badge.requirementValue;
          break;
        }
        case 'xp_earned': {
          qualifies = user.totalXp >= badge.requirementValue;
          break;
        }
        case 'streak_days': {
          qualifies = user.streak >= badge.requirementValue;
          break;
        }
        case 'projects_completed': {
          const projectLessons = await Lesson.findAll({ where: { type: 'project' } });
          const projectIds = projectLessons.map(l => l.id);
          const count = await UserProgress.count({
            where: { userId, lessonId: projectIds, completed: true }
          });
          qualifies = count >= badge.requirementValue;
          break;
        }
      }
      
      if (qualifies) {
        await UserBadge.create({
          userId,
          badgeId: badge.id,
          earnedAt: new Date()
        });
        newBadges.push(badge);
      }
    }
    
    return newBadges;
  } catch (error) {
    console.error('❌ Badge check error:', error);
    return [];
  }
}

export default router;