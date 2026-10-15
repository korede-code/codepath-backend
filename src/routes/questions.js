import express from 'express';
import { Question } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get questions for a lesson
router.get('/lesson/:lessonId', authenticateToken, async (req, res) => {
  try {
    const { lessonId } = req.params;
    
    const questions = await Question.findAll({
      where: { lessonId },
      order: [['order', 'ASC']]
    });
    
    res.json(questions);
  } catch (error) {
    console.error('❌ Get questions error:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

export default router;