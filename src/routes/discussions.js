import express from 'express';
import { DiscussionTopic, DiscussionReply, User, Activity } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all topics
router.get('/topics', authenticateToken, async (req, res) => {
  try {
    const { category, limit = 20, offset = 0 } = req.query;
    
    const where = {};
    if (category && category !== 'all') {
      where.category = category;
    }
    
    const topics = await DiscussionTopic.findAll({
      where,
      include: [{ model: User, attributes: ['id', 'username', 'avatar'] }],
      order: [
        ['isPinned', 'DESC'],
        ['createdAt', 'DESC']
      ],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    const total = await DiscussionTopic.count({ where });
    
    res.json({ topics, total });
  } catch (error) {
    console.error('❌ Get topics error:', error);
    res.status(500).json({ error: 'Failed to get topics' });
  }
});

// Create a topic
router.post('/topics', authenticateToken, async (req, res) => {
  try {
    const { title, content, category } = req.body;
    const userId = req.user.id;
    
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }
    
    const topic = await DiscussionTopic.create({
      title,
      content,
      userId,
      category: category || 'general'
    });
    
    // Create activity
    await Activity.create({
      userId,
      type: 'created_topic',
      targetId: topic.id,
      targetType: 'discussion_topic',
      metadata: { title }
    });
    
    const topicWithUser = await DiscussionTopic.findByPk(topic.id, {
      include: [{ model: User, attributes: ['id', 'username', 'avatar'] }]
    });
    
    res.status(201).json(topicWithUser);
  } catch (error) {
    console.error('❌ Create topic error:', error);
    res.status(500).json({ error: 'Failed to create topic' });
  }
});

// Get a topic with replies
router.get('/topics/:topicId', authenticateToken, async (req, res) => {
  try {
    const { topicId } = req.params;
    
    const topic = await DiscussionTopic.findByPk(topicId, {
      include: [{ model: User, attributes: ['id', 'username', 'avatar'] }]
    });
    
    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }
    
    // Increment views
    topic.views = (topic.views || 0) + 1;
    await topic.save();
    
    const replies = await DiscussionReply.findAll({
      where: { topicId },
      include: [{ model: User, attributes: ['id', 'username', 'avatar'] }],
      order: [['createdAt', 'ASC']]
    });
    
    res.json({ topic, replies });
  } catch (error) {
    console.error('❌ Get topic error:', error);
    res.status(500).json({ error: 'Failed to get topic' });
  }
});

// Reply to a topic
router.post('/topics/:topicId/replies', authenticateToken, async (req, res) => {
  try {
    const { topicId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;
    
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }
    
    const topic = await DiscussionTopic.findByPk(topicId);
    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }
    
    const reply = await DiscussionReply.create({
      content,
      userId,
      topicId
    });
    
    // Create activity
    await Activity.create({
      userId,
      type: 'replied_topic',
      targetId: reply.id,
      targetType: 'discussion_reply',
      metadata: { topicId, topicTitle: topic.title }
    });
    
    const replyWithUser = await DiscussionReply.findByPk(reply.id, {
      include: [{ model: User, attributes: ['id', 'username', 'avatar'] }]
    });
    
    res.status(201).json(replyWithUser);
  } catch (error) {
    console.error('❌ Create reply error:', error);
    res.status(500).json({ error: 'Failed to create reply' });
  }
});

export default router;