import express from 'express';
import { Op } from 'sequelize';
import { Course, Lesson, UserProgress } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all courses
router.get('/', authenticateToken, async (req, res) => {
  try {
    console.log('📚 Fetching courses...');
    const userId = req.user.id;

    const courses = await Course.findAll({
      order: [['order', 'ASC']],
      include: [{ model: Lesson, as: 'Lessons' }] // <-- FIX: add as
    });
    
    // Get ALL user progress at once
    const allProgress = await UserProgress.findAll({ 
      where: { userId, completed: true } 
    });
    const completedIds = new Set(allProgress.map(p => p.lessonId.toString()));
    
    const coursesWithProgress = courses.map(course => {
      const lessons = course.Lessons || [];
      const completedCount = lessons.filter(l => 
        completedIds.has(l.id.toString())
      ).length;
      
      const progress = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;
      
      console.log(`📊 ${course.pathId}: ${completedCount}/${lessons.length} = ${progress}%`);

      return {
        ...course.toJSON(),
        progress,
        completedLessons: completedCount,
        totalLessons: lessons.length,
        totalXp: lessons.reduce((sum,l) => sum + (l.xpValue||0), 0)
      };
    });
    
    res.json(coursesWithProgress);
  } catch (error) {
    console.error('❌ Get courses error:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// Get course by ID with lessons
router.get('/:courseId', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;
    
    console.log(`📚 Fetching course: ${courseId}`);
    
    // FIX: Find by pathId OR by numeric/uuid id
    let course = await Course.findOne({
      where: { 
        [Op.or]: [
          { pathId: courseId },
          { id: courseId }
        ]
      },
      include: [{ model: Lesson, as: 'Lessons' }]
    });

    // If still not found, try findByPk (for uuid like your screenshot)
    if (!course) {
      course = await Course.findByPk(courseId, {
        include: [{ model: Lesson, as: 'Lessons' }]
      });
    }
    
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    // ... rest of your code stays same
    const lessonIds = course.Lessons.map(l => l.id);
    const progress = await UserProgress.findAll({
      where: { userId, lessonId: lessonIds }
    });
    
    const progressMap = {};
    progress.forEach(p => {
      progressMap[p.lessonId] = { completed: p.completed, xpEarned: p.xpEarned };
    });
    
    const lessonsWithProgress = course.Lessons
      .sort((a,b) => a.order - b.order)
      .map(lesson => ({
        ...lesson.toJSON(),
        completed: progressMap[lesson.id]?.completed || false,
        xpEarned: progressMap[lesson.id]?.xpEarned || 0,
      }));
    
    const completedCount = lessonsWithProgress.filter(l => l.completed).length;
    
    res.json({
      ...course.toJSON(),
      lessons: lessonsWithProgress,
      progress: course.Lessons.length > 0 ? Math.round((completedCount / course.Lessons.length) * 100) : 0,
      completedLessons: completedCount,
      totalLessons: course.Lessons.length
    });
  } catch (error) {
    console.error('❌ Get course detail error:', error);
    res.status(500).json({ error: 'Failed to fetch course details' });
  }
});

// Get lesson by ID
router.get('/lesson/:lessonId', authenticateToken, async (req, res) => {
  try {
    const { lessonId } = req.params;
    console.log('📚 Fetching lesson with ID:', lessonId);
    
    // Validate the ID
    if (!lessonId || lessonId === 'undefined' || lessonId === 'null') {
      console.log('❌ Invalid lesson ID');
      return res.status(400).json({ error: 'Invalid lesson ID' });
    }
    
    // Find the lesson
    const lesson = await Lesson.findByPk(lessonId);
    
    if (!lesson) {
      console.log('❌ Lesson not found with ID:', lessonId);
      
      // Log all available lesson IDs for debugging
      const allLessons = await Lesson.findAll();
      console.log('📚 Available lessons in database:');
      allLessons.forEach(l => {
        console.log(`  - ${l.title}: ${l.id}`);
      });
      
      return res.status(404).json({ 
        error: 'Lesson not found',
        requestedId: lessonId
      });
    }
    
    console.log('✅ Lesson found:', lesson.title);
    
    // Check if user has completed this lesson
    const progress = await UserProgress.findOne({
      where: { userId: req.user.id, lessonId }
    });
    
    const lessonData = {
      id: lesson.id,
      title: lesson.title,
      content: lesson.content,
      xpValue: lesson.xpValue,
      order: lesson.order,
      type: lesson.type,
      codeExample: lesson.codeExample,
      solution: lesson.solution,
      isLocked: lesson.isLocked || false,
      courseId: lesson.courseId,
      completed: progress ? progress.completed : false,
      xpEarned: progress ? progress.xpEarned : 0,
      createdAt: lesson.createdAt,
      updatedAt: lesson.updatedAt
    };
    
    res.json(lessonData);
  } catch (error) {
    console.error('❌ Get lesson error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch lesson',
      details: error.message 
    });
  }
});

export default router;