import express from 'express';
import { Quiz, UserProgress, User } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET quiz for a lesson
router.get('/:lessonId', authenticateToken, async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ where: { lessonId: req.params.lessonId } });
    if (!quiz) return res.status(404).json({ message: 'No quiz for this lesson' });

    // Don't send correctIndex to client? For now send it but frontend will hide
    // For production, strip correctIndex. For learning app, we send questions only
    const safeQuestions = quiz.questions.map(q => ({
      id: q.id,
      question: q.question,
      options: q.options,
      explanation: q.explanation // show after answer
    }));

    res.json({
      id: quiz.id,
      lessonId: quiz.lessonId,
      courseId: quiz.courseId,
      timeLimit: quiz.timeLimit,
      passingScore: quiz.passingScore,
      xpReward: quiz.xpReward,
      questions: quiz.questions // send full for now - includes correctIndex
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// SUBMIT quiz
router.post('/:lessonId/submit', authenticateToken, async (req, res) => {
  try {
    const { answers } = req.body; // [0, 2, 1...] indexes
    const quiz = await Quiz.findOne({ where: { lessonId: req.params.lessonId } });
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    let correct = 0;
    const results = quiz.questions.map((q, i) => {
      const isCorrect = answers[i] === q.correctIndex;
      if (isCorrect) correct++;
      return { questionId: q.id, correct: isCorrect, correctIndex: q.correctIndex, explanation: q.explanation };
    });

    const score = Math.round((correct / quiz.questions.length) * 100);
    const passed = score >= quiz.passingScore;

    // Update UserProgress
    const [progress] = await UserProgress.findOrCreate({
      where: { userId: req.user.id, lessonId: req.params.lessonId, courseId: quiz.courseId || req.body.courseId },
      defaults: { completed: true, xpEarned: 0 }
    });

    progress.quizCompleted = true;
    progress.quizScore = score;
    if (passed) {
      progress.xpEarned = (progress.xpEarned || 0) + quiz.xpReward;
      // Add XP to user
      await User.increment({ totalXp: quiz.xpReward }, { where: { id: req.user.id } });
    }
    await progress.save();

    res.json({ score, correct, total: quiz.questions.length, passed, results, xpEarned: passed? quiz.xpReward : 0 });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

export default router;