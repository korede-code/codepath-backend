import express from 'express';
import { Op, fn, col } from 'sequelize';
import { User, UserBadge } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/leaderboard?period=all&limit=50
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { period = 'all', limit = 50 } = req.query;
    const userId = req.user.id;
    
    console.log(`🏆 Leaderboard: period=${period}, user=${userId}`);
    
    let whereClause = {};
    if (period === 'weekly') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      whereClause.lastActive = { [Op.gte]: weekAgo }; // your field is lastActive, not lastActivity
    }
    if (period === 'monthly') {
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      whereClause.lastActive = { [Op.gte]: monthAgo };
    }
    
    // Top users
    const users = await User.findAll({
      where: whereClause,
      attributes: ['id', 'username', 'avatar', 'level', 'totalXp', 'streak'],
      order: [['totalXp', 'DESC']],
      limit: parseInt(limit)
    });
    
    // Badge counts - FIXED: need COUNT
    const userIds = users.map(u => u.id);
    let badgeCountMap = {};
    if (userIds.length > 0) {
      const badgeCounts = await UserBadge.findAll({
        where: { userId: { [Op.in]: userIds } },
        attributes: ['userId', [fn('COUNT', col('id')), 'count']],
        group: ['userId']
      });
      badgeCounts.forEach(bc => {
        badgeCountMap[bc.userId] = parseInt(bc.get('count'));
      });
    }
    
    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      userId: user.id,
      username: user.username,
      avatar: user.avatar || null,
      level: user.level || 1,
      totalXp: user.totalXp || 0,
      streak: user.streak || 0,
      isCurrentUser: user.id === userId,
      badgeCount: badgeCountMap[user.id] || 0
    }));
    
    // My rank - FIXED: don't load all users, just count
    const currentUser = await User.findByPk(userId);
    let currentUserRank = null;
    let percentile = 0;
    let totalUsers = 0;

    if (currentUser) {
      totalUsers = await User.count({ where: whereClause });
      const usersWithMoreXp = await User.count({
        where: {
          ...whereClause,
          totalXp: { [Op.gt]: currentUser.totalXp || 0 }
        }
      });
      currentUserRank = usersWithMoreXp + 1;
      percentile = totalUsers > 0 ? Math.round(((totalUsers - usersWithMoreXp) / totalUsers) * 100) : 100;
    }
    
    res.json({
      leaderboard,
      currentUserRank,
      currentUserStats: currentUser ? {
        username: currentUser.username,
        level: currentUser.level || 1,
        totalXp: currentUser.totalXp || 0,
        percentile,
        streak: currentUser.streak || 0,
        badgeCount: await UserBadge.count({ where: { userId } })
      } : null,
      period,
      totalUsers
    });
  } catch (error) {
    console.error('❌ Leaderboard error:', error);
    res.status(500).json({ error: 'Failed to get leaderboard', details: error.message });
  }
});

router.get('/rank', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const totalUsers = await User.count();
    const usersWithMoreXp = await User.count({ where: { totalXp: { [Op.gt]: user.totalXp || 0 } } });
    
    res.json({
      rank: usersWithMoreXp + 1,
      totalUsers,
      percentile: totalUsers > 0 ? Math.round(((totalUsers - usersWithMoreXp) / totalUsers) * 100) : 100,
      totalXp: user.totalXp,
      level: user.level,
      streak: user.streak
    });
  } catch (error) {
    console.error('❌ Rank error:', error);
    res.status(500).json({ error: 'Failed to get rank' });
  }
});

export default router;