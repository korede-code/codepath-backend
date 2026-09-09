import express from 'express';
import { Op, DataTypes } from 'sequelize';
import { Course, Lesson, UserProgress, User, sequelize } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

const Certificate = sequelize.define('Certificate', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  courseId: { type: DataTypes.UUID, allowNull: false },
  certificateId: { type: DataTypes.STRING, unique: true },
  courseTitle: { type: DataTypes.STRING },
  issuedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'certificates', timestamps: true });

await Certificate.sync({ alter: true }).catch(()=>{});

router.get('/:courseId', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(courseId);

    let course;
    if (isUUID) {
      course = await Course.findByPk(courseId);
    } else {
      course = await Course.findOne({ where: { pathId: courseId } });
    }
    if (!course) return res.status(404).json({ error: 'Course not found' });

    const lessons = await Lesson.findAll({ where: { courseId: course.id }, order: [['order','ASC']] });
    if (lessons.length === 0) return res.status(404).json({ error: 'No lessons in course' });

    const lessonIds = lessons.map(l => l.id);

    // FIXED: Check by lessonIds, not courseId
    const progress = await UserProgress.findAll({
      where: { 
        userId, 
        lessonId: { [Op.in]: lessonIds },
        completed: true 
      }
    });

    console.log(`📜 Cert check: ${course.pathId} - ${progress.length}/${lessons.length}`);

    if (progress.length < lessons.length) {
      return res.status(403).json({
        error: 'Course not completed',
        completed: progress.length,
        total: lessons.length,
        progress: Math.round((progress.length / lessons.length) * 100)
      });
    }

    const user = await User.findByPk(userId);
    let cert = await Certificate.findOne({ where: { userId, courseId: course.id } });
    
    if (!cert) {
      const certId = `CP-${course.pathId.toUpperCase()}-${Date.now().toString(36).toUpperCase()}-${userId.slice(0,4).toUpperCase()}`;
      cert = await Certificate.create({
        userId,
        courseId: course.id,
        certificateId: certId,
        courseTitle: course.title
      });
    }

    res.json({
      certificateId: cert.certificateId,
      user: { username: user.username, email: user.email },
      course: {
        id: course.id,
        pathId: course.pathId,
        title: course.title,
        description: course.description,
        totalLessons: lessons.length,
        totalXp: lessons.reduce((s,l)=>s+(l.xpValue||0),0)
      },
      issuedAt: cert.issuedAt,
      completedAt: progress[0]?.completedAt || new Date(),
      verificationUrl: `https://codepath-api-qje4.onrender.com/api/certificates/verify/${cert.certificateId}`
    });

  } catch (e) {
    console.error('Cert error:', e);
    res.status(500).json({ error: 'Failed to generate certificate', details: e.message });
  }
});

router.get('/verify/:certificateId', async (req, res) => {
  try {
    const cert = await Certificate.findOne({ where: { certificateId: req.params.certificateId } });
    if (!cert) return res.status(404).json({ valid: false });
    const user = await User.findByPk(cert.userId, { attributes: ['username'] });
    res.json({ valid: true, certificateId: cert.certificateId, courseTitle: cert.courseTitle, username: user?.username, issuedAt: cert.issuedAt });
  } catch (e) {
    res.status(500).json({ valid: false });
  }
});

export default router;