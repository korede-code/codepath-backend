import express from 'express';
import { Op, fn, col } from 'sequelize';
import { User, Lesson, UserProgress, Badge, UserBadge, Course } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// ========== DASHBOARD ==========
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const completedProgress = await UserProgress.findAll({
      where: { userId, completed: true },
      order: [['completedAt', 'ASC']]
    });

    const totalCompleted = completedProgress.length;

    // XP History 30 days
    const dailyXpMap = {};
    completedProgress.forEach(p => {
      if (p.completedAt) {
        const date = new Date(p.completedAt).toISOString().split('T')[0];
        dailyXpMap[date] = (dailyXpMap[date] || 0) + (p.xpEarned || 0);
      }
    });

    const xpHistory = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const str = d.toISOString().split('T')[0];
      xpHistory.push({ date: str, xp: dailyXpMap[str] || 0 });
    }

    const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const weeklyXP = completedProgress.filter(p => p.completedAt && new Date(p.completedAt) >= sevenDaysAgo)
     .reduce((s,p) => s + (p.xpEarned||0), 0);

    const projectLessons = await Lesson.findAll({ where: { type: 'project' } });
    const projectIds = projectLessons.map(l => l.id);
    const completedProjects = completedProgress.filter(p => projectIds.includes(p.lessonId)).length;

    const userBadges = await UserBadge.findAll({
      where: { userId },
      include: [{ model: Badge }],
      order: [['earnedAt', 'DESC']]
    });

    const seen = new Set(); const uniqueBadges = [];
    userBadges.forEach(ub => {
      const id = ub.Badge?.id; if (id &&!seen.has(id)) { seen.add(id); uniqueBadges.push({...ub.Badge.toJSON(), earnedAt: ub.earnedAt}); }
    });

    const recentActivity = await UserProgress.findAll({
      where: { userId, completed: true },
      include: [{ model: Lesson }],
      order: [['completedAt', 'DESC']], limit: 10
    });

    const allCourses = await Course.findAll({ include: [{ model: Lesson }] });
    const courseProgress = allCourses.map(course => {
      const lessonIds = course.Lessons.map(l => l.id);
      const completedInCourse = completedProgress.filter(p => lessonIds.includes(p.lessonId)).length;
      return {
        courseId: course.id, pathId: course.pathId, title: course.title, icon: course.icon,
        progress: course.Lessons.length? Math.round((completedInCourse / course.Lessons.length)*100) : 0,
        completedLessons: completedInCourse, totalLessons: course.Lessons.length
      };
    });

    const rank = await User.count({ where: { totalXp: { [Op.gt]: user.totalXp || 0 } } }) + 1;
    const totalLessons = await Lesson.count();

    // REAL weekly distribution from xpHistory last 7 days
    const last7 = xpHistory.slice(-7);
    const weekDays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const weeklyDistribution = last7.map(h => {
      const d = new Date(h.date); return { day: weekDays[d.getDay()], xp: h.xp };
    });

    res.json({
      stats: {
        completedCourses: courseProgress.filter(c => c.progress === 100).length,
        completedLessons: totalCompleted, completedProjects,
        totalXp: user.totalXp || 0, level: user.level || 1, rank, streak: user.streak || 0,
        badgesCount: uniqueBadges.length
      },
      weeklyXP, weeklyGoal: 200,
      weeklyProgressPercentage: Math.min(100, Math.round((weeklyXP/200)*100)),
      recentBadges: uniqueBadges.slice(0,5),
      recentActivity: recentActivity.map(ra => ({ id: ra.id, lessonTitle: ra.Lesson?.title || 'Lesson', xpEarned: ra.xpEarned || 0, completedAt: ra.completedAt })),
      currentCourse: courseProgress.find(c=>c.progress>0 && c.progress<100) || courseProgress[0],
      courseProgress, xpHistory, completionRate: totalLessons? Math.round((totalCompleted/totalLessons)*100):0,
      totalLessons, weeklyDistribution
    });
  } catch (e) { console.error(e); res.status(500).json({ error: e.message }); }
});

// ========== COMPLETE LESSON - FIXED IDEMPOTENT ==========
router.post('/complete', authenticateToken, async (req, res) => {
  try {
    const { lessonId } = req.body;
    const userId = req.user.id;
    if (!lessonId) return res.status(400).json({ error: 'Lesson ID required' });

    const lesson = await Lesson.findByPk(lessonId);
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' });

    const existing = await UserProgress.findOne({ where: { userId, lessonId } });

    // FIX: If already completed, return SUCCESS not 400 - prevents red bubble
    if (existing?.completed) {
      const user = await User.findByPk(userId);
      return res.json({ success: true, alreadyCompleted: true, totalXp: user.totalXp, newLevel: user.level, xpEarned: 0, newBadges: [] });
    }

    const xpEarned = lesson.xpValue || 10;
    let progress;
    if (existing) {
      existing.completed = true; existing.completedAt = new Date(); existing.xpEarned = xpEarned;
      await existing.save(); progress = existing;
    } else {
      progress = await UserProgress.create({ userId, lessonId, courseId: lesson.courseId, completed: true, completedAt: new Date(), xpEarned, attempts: 1 });
    }

    const user = await User.findByPk(userId);

    // FIX: Streak logic - save old date BEFORE overwrite
    const previousActive = user.lastActive? new Date(user.lastActive) : null;
    const todayStr = new Date().toDateString();
    const prevStr = previousActive? previousActive.toDateString() : null;

    let newStreak = user.streak || 0;
    if (prevStr === todayStr) {
      // already active today, keep streak
    } else if (previousActive) {
      const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
      if (previousActive.toDateString() === yesterday.toDateString()) {
        newStreak += 1;
      } else {
        // gap > 1 day
        const diffDays = Math.floor((new Date() - previousActive) / (1000*60*60*24));
        newStreak = diffDays === 0? newStreak : (diffDays === 1? newStreak + 1 : 1);
      }
    } else {
      newStreak = 1;
    }

    user.totalXp = (user.totalXp || 0) + xpEarned;
    user.lastActive = new Date();
    user.streak = newStreak;
    user.level = calculateLevel(user.totalXp);
    await user.save();

    const newBadges = await checkBadges(userId);

    console.log(`✅ Lesson ${lessonId} completed, +${xpEarned} XP, streak ${newStreak}`);
    res.json({ success: true, xpEarned, newLevel: user.level, totalXp: user.totalXp, newBadges, streak: newStreak });

  } catch (error) {
    console.error('❌ Complete error:', error);
    res.status(500).json({ error: 'Failed to complete lesson', details: error.message });
  }
});

function calculateLevel(xp) {
  if (xp < 100) return 1; if (xp < 300) return 2; if (xp < 600) return 3;
  if (xp < 1000) return 4; if (xp < 1500) return 5;
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

async function checkBadges(userId) {
  try {
    const user = await User.findByPk(userId);
    const allBadges = await Badge.findAll();
    const earned = await UserBadge.findAll({ where: { userId } });
    const earnedIds = earned.map(ub => ub.badgeId);
    const newBadges = [];
    for (const badge of allBadges) {
      if (earnedIds.includes(badge.id)) continue;
      let qualifies = false;
      switch (badge.requirementType) {
        case 'lessons_completed': qualifies = (await UserProgress.count({ where: { userId, completed: true } })) >= badge.requirementValue; break;
        case 'xp_earned': qualifies = user.totalXp >= badge.requirementValue; break;
        case 'streak_days': qualifies = user.streak >= badge.requirementValue; break;
        case 'projects_completed': {
          const projectIds = (await Lesson.findAll({ where: { type: 'project' } })).map(l=>l.id);
          qualifies = (await UserProgress.count({ where: { userId, lessonId: projectIds, completed: true } })) >= badge.requirementValue; break;
        }
      }
      if (qualifies) { await UserBadge.create({ userId, badgeId: badge.id, earnedAt: new Date() }); newBadges.push(badge); }
    }
    return newBadges;
  } catch { return []; }
}

export default router;