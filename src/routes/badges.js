import express from 'express';
import { Badge, UserBadge, User, UserProgress, Lesson } from '../models/index.js';
import { Op } from 'sequelize';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all badges with user progress
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get all badges
    const badges = await Badge.findAll({
      order: [
        ['category', 'ASC'],
        ['requirementValue', 'ASC']
      ]
    });
    
    // Get user's earned badges
    const userBadges = await UserBadge.findAll({
      where: { userId }
    });
    const earnedBadgeIds = userBadges.map(ub => ub.badgeId);
    const earnedAtMap = {};
    userBadges.forEach(ub => {
      earnedAtMap[ub.badgeId] = ub.earnedAt;
    });
    
    // Get user stats for progress calculation
    const user = await User.findByPk(userId);
    const completedLessons = await UserProgress.count({
      where: { userId, completed: true }
    });
    
    const projectLessons = await Lesson.findAll({ where: { type: 'project' } });
    const projectIds = projectLessons.map(l => l.id);
    const completedProjects = await UserProgress.count({
      where: { 
        userId, 
        lessonId: projectIds,
        completed: true 
      }
    });
    
    // Build badge list with progress
    const badgesWithProgress = badges.map(badge => {
      const earned = earnedBadgeIds.includes(badge.id);
      let progress = 0;
      let currentValue = 0;
      
      switch (badge.requirementType) {
        case 'lessons_completed':
          currentValue = completedLessons;
          progress = Math.min(100, Math.round((completedLessons / badge.requirementValue) * 100));
          break;
        case 'xp_earned':
          currentValue = user?.totalXp || 0;
          progress = Math.min(100, Math.round((user?.totalXp || 0) / badge.requirementValue * 100));
          break;
        case 'streak_days':
          currentValue = user?.streak || 0;
          progress = Math.min(100, Math.round((user?.streak || 0) / badge.requirementValue * 100));
          break;
        case 'projects_completed':
          currentValue = completedProjects;
          progress = Math.min(100, Math.round((completedProjects / badge.requirementValue) * 100));
          break;
      }
      
      return {
        ...badge.toJSON(),
        earned,
        earnedAt: earnedAtMap[badge.id] || null,
        progress,
        currentValue,
        requiredValue: badge.requirementValue
      };
    });
    
    // Group by category
    const categories = {
      beginner: [],
      intermediate: [],
      advanced: [],
      special: []
    };
    
    badgesWithProgress.forEach(badge => {
      if (categories[badge.category]) {
        categories[badge.category].push(badge);
      }
    });
    
    // Calculate totals
    const totalBadges = badges.length;
    const earnedBadges = badgesWithProgress.filter(b => b.earned).length;
    
    res.json({
      badges: badgesWithProgress,
      categories,
      stats: {
        total: totalBadges,
        earned: earnedBadges,
        remaining: totalBadges - earnedBadges,
        progress: totalBadges > 0 ? Math.round((earnedBadges / totalBadges) * 100) : 0
      }
    });
  } catch (error) {
    console.error('❌ Get badges error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch badges',
      details: error.message 
    });
  }
});

// Get user's earned badges - FIXED to return unique badges
router.get('/user', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const userBadges = await UserBadge.findAll({
      where: { userId },
      include: [{ model: Badge }],
      order: [['earnedAt', 'DESC']],
      attributes: ['earnedAt'],
      // Group by badgeId to avoid duplicates
      group: ['badgeId', 'earnedAt', 'Badge.id', 'Badge.name', 'Badge.description', 'Badge.image', 'Badge.requirement', 'Badge.requirementType', 'Badge.requirementValue', 'Badge.category', 'Badge.xpBonus', 'Badge.icon', 'Badge.createdAt', 'Badge.updatedAt']
    });
    
    // Deduplicate by badgeId
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
    
    res.json(uniqueBadges);
  } catch (error) {
    console.error('❌ Get user badges error:', error);
    res.status(500).json({ error: 'Failed to fetch user badges' });
  }
});

// Get next badge to work toward
router.get('/next', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('🎯 Fetching next badge for user:', userId);
    
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const completedLessons = await UserProgress.count({
      where: { userId, completed: true }
    });
    
    const projectLessons = await Lesson.findAll({ where: { type: 'project' } });
    const projectIds = projectLessons.map(l => l.id);
    const completedProjects = await UserProgress.count({
      where: { 
        userId, 
        lessonId: projectIds,
        completed: true 
      }
    });
    
    // Get all badges
    const allBadges = await Badge.findAll({
      order: [
        ['category', 'ASC'],
        ['requirementValue', 'ASC']
      ]
    });
    
    // Get earned badge IDs - ONLY store userId and badgeId
    const userBadges = await UserBadge.findAll({ 
      where: { userId } 
    });
    const earnedBadgeIds = userBadges.map(ub => ub.badgeId);
    
    console.log(`✅ User has ${earnedBadgeIds.length} badges out of ${allBadges.length}`);
    
    // Check for badges that should be earned but aren't
    let newlyEarned = [];
    for (const badge of allBadges) {
      if (earnedBadgeIds.includes(badge.id)) continue;
      
      let qualifies = false;
      switch (badge.requirementType) {
        case 'lessons_completed':
          qualifies = completedLessons >= badge.requirementValue;
          break;
        case 'xp_earned':
          qualifies = (user?.totalXp || 0) >= badge.requirementValue;
          break;
        case 'streak_days':
          qualifies = (user?.streak || 0) >= badge.requirementValue;
          break;
        case 'projects_completed':
          qualifies = completedProjects >= badge.requirementValue;
          break;
      }
      
      if (qualifies) {
        console.log(`🎖️ Awarding badge: ${badge.name}`);
        await UserBadge.create({
          userId,
          badgeId: badge.id,
          earnedAt: new Date()
        });
        newlyEarned.push(badge);
      }
    }
    
    // Find the next badge to work toward
    let nextBadge = null;
    const updatedEarnedIds = [...earnedBadgeIds, ...newlyEarned.map(b => b.id)];
    
    for (const badge of allBadges) {
      if (updatedEarnedIds.includes(badge.id)) continue;
      
      nextBadge = badge;
      break;
    }
    
    if (nextBadge) {
      let currentValue = 0;
      switch (nextBadge.requirementType) {
        case 'lessons_completed':
          currentValue = completedLessons;
          break;
        case 'xp_earned':
          currentValue = user?.totalXp || 0;
          break;
        case 'streak_days':
          currentValue = user?.streak || 0;
          break;
        case 'projects_completed':
          currentValue = completedProjects;
          break;
      }
      
      console.log(`🎯 Next badge: ${nextBadge.name}, Progress: ${Math.min(100, Math.round((currentValue / nextBadge.requirementValue) * 100))}%`);
      
      res.json({
        badge: nextBadge,
        progress: Math.min(100, Math.round((currentValue / nextBadge.requirementValue) * 100)),
        currentValue,
        requiredValue: nextBadge.requirementValue
      });
    } else {
      console.log('🎉 All badges earned!');
      res.json({ 
        badge: null, 
        message: 'All badges earned! 🎉',
        newlyEarned: newlyEarned.length
      });
    }
  } catch (error) {
    console.error('❌ Get next badge error:', error);
    res.status(500).json({ 
      error: 'Failed to get next badge',
      details: error.message 
    });
  }
});

export default router;