import express from 'express';
import { Comment, User, Lesson, Activity } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get comments for a lesson
router.get('/lesson/:lessonId', authenticateToken, async (req, res) => {
  try {
    const { lessonId } = req.params;
    
    const comments = await Comment.findAll({
      where: { lessonId, parentId: null },
      include: [
        { model: User, attributes: ['id', 'username', 'avatar'] },
        { 
          model: Comment, 
          as: 'Replies',
          include: [{ model: User, attributes: ['id', 'username', 'avatar'] }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.json(comments);
  } catch (error) {
    console.error('❌ Get comments error:', error);
    res.status(500).json({ error: 'Failed to get comments' });
  }
});

// Create a comment
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { content, lessonId, parentId } = req.body;
    const userId = req.user.id;
    
    if (!content || !lessonId) {
      return res.status(400).json({ error: 'Content and lessonId are required' });
    }
    
    const comment = await Comment.create({
      content,
      userId,
      lessonId,
      parentId: parentId || null
    });
    
    // Create activity
    await Activity.create({
      userId,
      type: 'posted_comment',
      targetId: comment.id,
      targetType: 'comment',
      metadata: { lessonId, content: content.substring(0, 100) }
    });
    
    const commentWithUser = await Comment.findByPk(comment.id, {
      include: [{ model: User, attributes: ['id', 'username', 'avatar'] }]
    });
    
    res.status(201).json(commentWithUser);
  } catch (error) {
    console.error('❌ Create comment error:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

// Like a comment
router.post('/:commentId/like', authenticateToken, async (req, res) => {
  try {
    const { commentId } = req.params;
    
    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    
    comment.likes = (comment.likes || 0) + 1;
    await comment.save();
    
    res.json({ likes: comment.likes });
  } catch (error) {
    console.error('❌ Like comment error:', error);
    res.status(500).json({ error: 'Failed to like comment' });
  }
});

export default router;