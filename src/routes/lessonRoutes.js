import express from 'express';
import { Lesson, Question } from '../models/index.js';

const router = express.Router();

// GET /api/lessons/debug/questions  <- NOW IT WILL WORK
router.get('/debug/questions', async (req, res) => {
  try {
    const count = await Question.count();
    const all = await Question.findAll({ order: [['order','ASC']] });
    res.json({ total: count, questions: all });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/lessons/:id/questions  <- THIS IS YOUR 40 QUESTIONS
router.get('/:id/questions', async (req, res) => {
  try {
    const questions = await Question.findAll({
      where: { lessonId: req.params.id },
      order: [['order', 'ASC']]
    });
    res.json(questions);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/lessons - list all lessons (optional)
router.get('/', async (req, res) => {
  const lessons = await Lesson.findAll({ order: [['order','ASC']] });
  res.json(lessons);
});

export default router;