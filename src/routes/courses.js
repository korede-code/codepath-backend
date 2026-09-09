import express from 'express';
import { Op } from 'sequelize';
import { Course, Lesson, UserProgress } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all courses with progress
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const courses = await Course.findAll({
      order: [['order', 'ASC']],
      include: [{ model: Lesson }] // <-- NO as:
    });
    
    const progress = await UserProgress.findAll({ 
      where: { userId, completed: true } 
    });
    const completedIds = new Set(progress.map(p => p.lessonId.toString()));
    
    const coursesWithProgress = courses.map(course => {
      const lessons = course.Lessons || [];
      const completedCount = lessons.filter(l => completedIds.has(l.id.toString())).length;
      const progressPercent = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;
      
      return {
        ...course.toJSON(),
        progress: progressPercent,
        completedLessons: completedCount,
        totalLessons: lessons.length,
        totalXp: lessons.reduce((s,l) => s + (l.xpValue||0), 0)
      };
    });
    
    res.json(coursesWithProgress);
  } catch (error) {
    console.error('❌ Get courses error:', error);
    res.status(500).json({ error: 'Failed to fetch courses', details: error.message });
  }
});

// Get course by ID - FIXED
router.get('/:courseId', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;
    console.log(`📚 Fetching course: ${courseId}`);

    // Find by pathId OR id - both work
    let course = await Course.findOne({
      where: {
        [Op.or]: [
          { pathId: courseId },
          { id: courseId }
        ]
      },
      include: [{ model: Lesson }] // <-- NO as:
    });

    if (!course) {
      // try findByPk for UUID
      course = await Course.findByPk(courseId, {
        include: [{ model: Lesson }]
      });
    }
    
    if (!course) {
      return res.status(404).json({ error: 'Course not found', id: courseId });
    }

    const lessons = (course.Lessons || []).sort((a,b) => a.order - b.order);
    const lessonIds = lessons.map(l => l.id);
    
    const progress = await UserProgress.findAll({
      where: { userId, lessonId: { [Op.in]: lessonIds } }
    });
    
    const progressMap = {};
    progress.forEach(p => {
      progressMap[p.lessonId.toString()] = p;
    });

    const lessonsWithProgress = lessons.map(lesson => {
      const p = progressMap[lesson.id.toString()];
      return {
        ...lesson.toJSON(),
        completed: p ? p.completed : false,
        xpEarned: p ? p.xpEarned : 0,
        quizCompleted: p ? p.quizCompleted : false,
        quizScore: p ? p.quizScore : 0
      };
    });

    const completedCount = lessonsWithProgress.filter(l => l.completed).length;
    const progressPercent = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

    console.log(`✅ ${course.pathId}: ${completedCount}/${lessons.length} = ${progressPercent}%`);
    console.log(`📖 Lessons:`, lessonsWithProgress.map(l => `${l.title}: ${l.completed}`));

    res.json({
      ...course.toJSON(),
      Lessons: lessonsWithProgress, // keep both for compatibility
      lessons: lessonsWithProgress,
      progress: progressPercent,
      completedLessons: completedCount,
      totalLessons: lessons.length,
      totalXp: lessons.reduce((s,l) => s + (l.xpValue||0), 0)
    });
  } catch (error) {
    console.error('❌ Get course detail error:', error);
    res.status(500).json({ error: 'Failed to fetch course details', details: error.message });
  }
});

// Get lesson by ID
router.get('/lesson/:lessonId', authenticateToken, async (req, res) => {
  try {
    const { lessonId } = req.params;
    if (!lessonId || lessonId === 'undefined') {
      return res.status(400).json({ error: 'Invalid lesson ID' });
    }
    const lesson = await Lesson.findByPk(lessonId);
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' });
    
    const progress = await UserProgress.findOne({
      where: { userId: req.user.id, lessonId }
    });
    
    res.json({
      ...lesson.toJSON(),
      completed: progress ? progress.completed : false,
      xpEarned: progress ? progress.xpEarned : 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch lesson' });
  }
});

export default router;