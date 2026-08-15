import express from 'express';
import { User, Follow, Activity } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Follow a user
router.post('/follow/:userId', authenticateToken, async (req, res) => {
  try {
    const followerId = req.user.id;
    const { userId: followingId } = req.params;
    
    if (followerId === followingId) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }
    
    const existing = await Follow.findOne({
      where: { followerId, followingId }
    });
    
    if (existing) {
      return res.status(400).json({ error: 'Already following this user' });
    }
    
    await Follow.create({ followerId, followingId });
    
    await Activity.create({
      userId: followerId,
      type: 'followed_user',
      targetId: followingId,
      targetType: 'user'
    });
    
    const following = await User.findByPk(followingId, {
      attributes: ['id', 'username', 'avatar']
    });
    
    res.json({ following, message: 'User followed successfully' });
  } catch (error) {
    console.error('❌ Follow user error:', error);
    res.status(500).json({ error: 'Failed to follow user' });
  }
});

// Unfollow a user
router.delete('/follow/:userId', authenticateToken, async (req, res) => {
  try {
    const followerId = req.user.id;
    const { userId: followingId } = req.params;
    
    const result = await Follow.destroy({
      where: { followerId, followingId }
    });
    
    if (result === 0) {
      return res.status(404).json({ error: 'Not following this user' });
    }
    
    res.json({ message: 'User unfollowed successfully' });
  } catch (error) {
    console.error('❌ Unfollow user error:', error);
    res.status(500).json({ error: 'Failed to unfollow user' });
  }
});

// Get followers of a user
router.get('/followers/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const followers = await Follow.findAll({
      where: { followingId: userId },
      include: [{ model: User, as: 'Follower', attributes: ['id', 'username', 'avatar'] }]
    });
    
    res.json(followers.map(f => f.Follower));
  } catch (error) {
    console.error('❌ Get followers error:', error);
    res.status(500).json({ error: 'Failed to get followers' });
  }
});

// Get users following a user
router.get('/following/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const following = await Follow.findAll({
      where: { followerId: userId },
      include: [{ model: User, as: 'Following', attributes: ['id', 'username', 'avatar'] }]
    });
    
    res.json(following.map(f => f.Following));
  } catch (error) {
    console.error('❌ Get following error:', error);
    res.status(500).json({ error: 'Failed to get following' });
  }
});

// Get activity feed
router.get('/feed', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, offset = 0 } = req.query;
    
    // Get users this user follows
    const following = await Follow.findAll({
      where: { followerId: userId },
      attributes: ['followingId']
    });
    
    const followingIds = following.map(f => f.followingId);
    
    // Include the user's own activities and followed users' activities
    const activityUsers = [userId, ...followingIds];
    
    const activities = await Activity.findAll({
      where: { userId: activityUsers },
      include: [{ model: User, attributes: ['id', 'username', 'avatar'] }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json(activities);
  } catch (error) {
    console.error('❌ Get feed error:', error);
    res.status(500).json({ error: 'Failed to get feed' });
  }
});

export default router;