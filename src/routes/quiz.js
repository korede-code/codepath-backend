import express from 'express';
import { Lesson, Quiz, UserProgress, User } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/quiz/:lessonId - get quiz for a lesson
router.get('/:lessonId', authenticateToken, async (req, res) => {
  try {
    const { lessonId } = req.params;
    let quiz = await Quiz.findOne({ where: { lessonId } });

    // If no quiz in DB, generate from lesson.quiz JSON or return default
    if (!quiz) {
      const lesson = await Lesson.findByPk(lessonId);
      if (lesson?.quiz && Array.isArray(lesson.quiz) && lesson.quiz.length > 0) {
        quiz = { lessonId, questions: lesson.quiz };
      } else {
        // Fallback demo quiz
        quiz = {
          lessonId,
          questions: [
            {
              id: 1,
              question: `What did you learn in "${lesson?.title || 'this lesson'}"?`,
              options: ["Variable declaration", "Loop syntax", "Function return", "All of the above"],
              correctIndex: 3,
              explanation: "This lesson covered all these concepts!"
            }
          ]
        };
      }
    } else {
      quiz = quiz.toJSON();
    }

    // Don't send correct answers to client
    const safeQuestions = quiz.questions.map(q => ({
      id: q.id,
      question: q.question,
      options: q.options,
      explanation: q.explanation // optional, show after answer
    }));

    res.json({ lessonId, questions: safeQuestions, total: safeQuestions.length });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// POST /api/quiz/:lessonId/submit
router.post('/:lessonId/submit', authenticateToken, async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { answers } = req.body; // [{questionId, selectedIndex}]
    const userId = req.user.id;

    const quizRecord = await Quiz.findOne({ where: { lessonId } });
    const lesson = await Lesson.findByPk(lessonId);
    const questions = quizRecord?.questions || lesson?.quiz || [];

    let correct = 0;
    const results = questions.map((q, idx) => {
      const userAns = answers.find(a => a.questionId === q.id || a.questionId === idx+1 || a.questionId === idx);
      const isCorrect = userAns?.selectedIndex === q.correctIndex;
      if (isCorrect) correct++;
      return {
        questionId: q.id,
        correct: isCorrect,
        correctIndex: q.correctIndex,
        selectedIndex: userAns?.selectedIndex,
        explanation: q.explanation
      };
    });

    const score = Math.round((correct / questions.length) * 100);
    const passed = score >= 60;
    const xpEarned = passed? (lesson?.xpValue || 10) + (score === 100? 20 : 10) : 0;

    if (passed) {
      // Award bonus XP (don't double count if lesson already completed)
      const user = await User.findByPk(userId);
      const existing = await UserProgress.findOne({ where: { userId, lessonId } });

      if (existing?.quizCompleted) {
        // already did quiz, no extra XP
      } else {
        if (existing) {
          existing.quizCompleted = true;
          existing.quizScore = score;
          await existing.save();
        }
        user.totalXp = (user.totalXp || 0) + xpEarned;
        user.level = Math.floor(user.totalXp / 500) + 1;
        await user.save();
      }
    }

    res.json({
      success: true,
      score,
      correct,
      total: questions.length,
      passed,
      xpEarned: passed? xpEarned : 0,
      results
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

export default router;