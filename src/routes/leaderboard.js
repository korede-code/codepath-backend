import express from 'express';
import { Op, fn, col } from 'sequelize';
import { User, UserBadge } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/leaderboard?period=all&limit=50 OR ?filter=allTime (mobile)
router.get('/', authenticateToken, async (req, res) => {
  try {
    // FIX: accept both period (web) and filter (mobile)
    let { period = 'all', filter, limit = 50 } = req.query;
    if (filter) {
      // map mobile filter to backend period
      if (filter === 'allTime') period = 'all';
      else if (filter === 'weekly' || filter === 'thisWeek') period = 'weekly';
      else period = filter;
    }
    
    const userId = req.user.id;
    console.log(`🏆 Leaderboard: period=${period}, user=${userId}`);
    
    let whereClause = {};
    if (period === 'weekly') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      whereClause.lastActive = { [Op.gte]: weekAgo };
    }
    if (period === 'monthly') {
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      whereClause.lastActive = { [Op.gte]: monthAgo };
    }
    
    const users = await User.findAll({
      where: whereClause,
      attributes: ['id', 'username', 'avatar', 'level', 'totalXp', 'streak'],
      order: [['totalXp', 'DESC']],
      limit: parseInt(limit)
    });
    
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
      id: user.id, // for FlatList key
      rank: index + 1,
      userId: user.id,
      username: user.username,
      name: user.username, // mobile expects name
      avatar: user.avatar || null,
      level: user.level || 1,
      totalXp: user.totalXp || 0,
      xp: user.totalXp || 0, // mobile expects xp
      streak: user.streak || 0,
      isCurrentUser: user.id === userId,
      isMe: user.id === userId,
      badgeCount: badgeCountMap[user.id] || 0
    }));
    
    const currentUser = await User.findByPk(userId);
    let currentUserRank = null;
    let percentile = 0;
    let totalUsers = 0;

    if (currentUser) {
      totalUsers = await User.count({ where: whereClause });
      const usersWithMoreXp = await User.count({
        where: { ...whereClause, totalXp: { [Op.gt]: currentUser.totalXp || 0 } }
      });
      currentUserRank = usersWithMoreXp + 1;
      percentile = totalUsers > 0 ? Math.round(((totalUsers - usersWithMoreXp) / totalUsers) * 100) : 100;
    }
    
    res.json({
      leaderboard,
      currentUserRank,
      currentUserStats: currentUser ? {
        username: currentUser.username, level: currentUser.level || 1,
        totalXp: currentUser.totalXp || 0, xp: currentUser.totalXp || 0,
        percentile, streak: currentUser.streak || 0,
        badgeCount: await UserBadge.count({ where: { userId } })
      } : null,
      period, totalUsers
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
    res.json({ rank: usersWithMoreXp + 1, totalUsers, percentile: totalUsers > 0 ? Math.round(((totalUsers - usersWithMoreXp) / totalUsers) * 100) : 100, totalXp: user.totalXp, xp: user.totalXp, level: user.level, streak: user.streak });
  } catch (error) { res.status(500).json({ error: 'Failed to get rank' }); }
});

// ALIAS for mobile: /me → same as /rank (so mobile code doesn't need to change)
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const totalUsers = await User.count();
    const usersWithMoreXp = await User.count({ where: { totalXp: { [Op.gt]: user.totalXp || 0 } } });
    res.json({ rank: usersWithMoreXp + 1, totalUsers, totalXp: user.totalXp, xp: user.totalXp, level: user.level, streak: user.streak, percentile: totalUsers > 0 ? Math.round(((totalUsers - usersWithMoreXp) / totalUsers) * 100) : 100 });
  } catch (e) { res.status(500).json({ error: 'Failed to get rank' }); }
});

// Mobile calls this, keep it harmless
router.post('/update', authenticateToken, async (req, res) => {
  res.json({ success: true });
});

export default router;