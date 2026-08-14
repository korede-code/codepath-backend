import express from 'express';
import { Op } from 'sequelize';
import { User, UserBadge, UserProgress } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get leaderboard
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { period = 'all', limit = 50 } = req.query;
    const userId = req.user.id;
    
    console.log(`🏆 Fetching leaderboard: period=${period}, limit=${limit}`);
    
    let whereClause = {};
    
    // For weekly leaderboard - get users active in last 7 days
    if (period === 'weekly') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      whereClause = {
        lastActivity: { [Op.gte]: weekAgo }
      };
    }
    
    // For monthly leaderboard
    if (period === 'monthly') {
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      whereClause = {
        lastActivity: { [Op.gte]: monthAgo }
      };
    }
    
    // Get top users
    const users = await User.findAll({
      where: whereClause,
      attributes: ['id', 'username', 'avatar', 'level', 'totalXp', 'streak'],
      order: [['totalXp', 'DESC']],
      limit: parseInt(limit)
    });
    
    console.log(`✅ Found ${users.length} users for leaderboard`);
    
    // Get badge counts for all users
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
    
    // Build leaderboard with ranks
    const leaderboard = users.map((user, index) => {
      const rank = index + 1;
      const isCurrentUser = user.id === userId;
      
      return {
        rank,
        userId: user.id,
        username: user.username,
        avatar: user.avatar || 'default-avatar.png',
        level: user.level || 1,
        totalXp: user.totalXp || 0,
        streak: user.streak || 0,
        isCurrentUser,
        badgeCount: badgeCountMap[user.id] || 0
      };
    });
    
    // Find current user's rank
    let currentUserRank = null;
    const allUsers = await User.findAll({
      where: whereClause,
      order: [['totalXp', 'DESC']]
    });
    
    const rank = allUsers.findIndex(u => u.id === userId) + 1;
    currentUserRank = rank > 0 ? rank : null;
    
    // Get current user's total XP for comparison
    const currentUser = await User.findByPk(userId);
    
    // Calculate top percentile
    let percentile = 0;
    if (currentUser) {
      const totalUsers = await User.count({ where: whereClause });
      const usersWithMoreXp = await User.count({
        where: {
          ...whereClause,
          totalXp: { [Op.gt]: currentUser.totalXp || 0 }
        }
      });
      percentile = totalUsers > 0 ? Math.round(((totalUsers - usersWithMoreXp) / totalUsers) * 100) : 0;
    }
    
    res.json({
      leaderboard,
      currentUserRank,
      currentUserStats: currentUser ? {
        username: currentUser.username,
        level: currentUser.level || 1,
        totalXp: currentUser.totalXp || 0,
        percentile: percentile,
        badgeCount: await UserBadge.count({ where: { userId } })
      } : null,
      period,
      totalUsers: await User.count({ where: whereClause })
    });
  } catch (error) {
    console.error('❌ Leaderboard error:', error);
    res.status(500).json({ 
      error: 'Failed to get leaderboard',
      details: error.message 
    });
  }
});

// Get user's rank
router.get('/rank', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const totalUsers = await User.count();
    const usersWithMoreXp = await User.count({
      where: { totalXp: { [Op.gt]: user.totalXp } }
    });
    
    const rank = usersWithMoreXp + 1;
    const percentile = totalUsers > 0 ? Math.round(((totalUsers - usersWithMoreXp) / totalUsers) * 100) : 0;
    
    res.json({
      rank,
      totalUsers,
      percentile,
      totalXp: user.totalXp,
      level: user.level
    });
  } catch (error) {
    console.error('❌ Rank error:', error);
    res.status(500).json({ error: 'Failed to get rank' });
  }
});

export default router;