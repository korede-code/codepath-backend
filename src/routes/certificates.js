import express from 'express';
import { DataTypes } from 'sequelize';
import { Course, Lesson, User, sequelize } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Define model WITHOUT sync - prevents crash
const Certificate = sequelize.define('Certificate', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  courseId: { type: DataTypes.UUID, allowNull: false },
  certificateId: { type: DataTypes.STRING, unique: true },
  courseTitle: { type: DataTypes.STRING },
  issuedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'certificates', timestamps: true });

// VERIFY FIRST - must be before :courseId
router.get('/verify/:certificateId', async (req, res) => {
  try {
    const cert = await Certificate.findOne({ where: { certificateId: req.params.certificateId } });
    if (!cert) return res.status(404).json({ valid: false, error: 'Not found' });
    const user = await User.findByPk(cert.userId, { attributes: ['username'] });
    res.json({ valid: true, certificateId: cert.certificateId, courseTitle: cert.courseTitle, username: user?.username, issuedAt: cert.issuedAt });
  } catch (e) {
    res.status(500).json({ valid: false, error: e.message });
  }
});

router.get('/:courseId', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    console.log(`📜 CERT REQUEST: ${courseId} by ${req.user.id}`);
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(courseId);

    let course = isUUID 
      ? await Course.findByPk(courseId)
      : await Course.findOne({ where: { pathId: courseId } });

    if (!course) {
      console.log('Course not found:', courseId);
      return res.status(404).json({ error: 'Course not found', id: courseId });
    }

    const lessons = await Lesson.findAll({ where: { courseId: course.id } });
    const user = await User.findByPk(req.user.id);

    // Ensure table exists lazily
    await sequelize.sync().catch(()=>{});

    let cert = await Certificate.findOne({ where: { userId: req.user.id, courseId: course.id } }).catch(()=>null);
    
    if (!cert) {
      const certId = `CP-${course.pathId.toUpperCase()}-${Date.now().toString(36).toUpperCase()}-${req.user.id.slice(0,4).toUpperCase()}`;
      try {
        cert = await Certificate.create({
          userId: req.user.id,
          courseId: course.id,
          certificateId: certId,
          courseTitle: course.title
        });
      } catch (e) {
        console.log('Create cert error:', e.message);
        // Try again with sync
        await Certificate.sync({ alter: true }).catch(()=>{});
        cert = await Certificate.create({
          userId: req.user.id,
          courseId: course.id,
          certificateId: certId,
          courseTitle: course.title
        });
      }
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
      verificationUrl: `https://codepath-api-qje4.onrender.com/api/certificates/verify/${cert.certificateId}`
    });
  } catch (e) {
    console.error('Cert error:', e);
    res.status(500).json({ error: 'Failed to generate certificate', details: e.message, stack: e.stack });
  }
});

export default router;