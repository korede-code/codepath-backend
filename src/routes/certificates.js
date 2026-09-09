import express from 'express';
import { DataTypes } from 'sequelize';
import { Course, Lesson, User, sequelize } from '../models/index.js';
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

// Ensure table exists on first hit
sequelize.sync().then(()=>console.log('✅ Certificates table ready')).catch(()=>{});

router.get('/verify/:certificateId', async (req, res) => {
  try {
    const cert = await Certificate.findOne({ where: { certificateId: req.params.certificateId } });
    if (!cert) return res.status(404).json({ valid: false });
    const user = await User.findByPk(cert.userId, { attributes: ['username', 'email'] });
    res.json({ valid: true, certificateId: cert.certificateId, courseTitle: cert.courseTitle, username: user?.username, issuedAt: cert.issuedAt });
  } catch (e) { res.status(500).json({ valid: false, error: e.message }); }
});

router.get('/:courseId', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(courseId);
    let course = isUUID ? await Course.findByPk(courseId) : await Course.findOne({ where: { pathId: courseId } });
    if (!course) return res.status(404).json({ error: 'Course not found' });
    
    const lessons = await Lesson.findAll({ where: { courseId: course.id } });
    const user = await User.findByPk(req.user.id);

    let cert = await Certificate.findOne({ where: { userId: req.user.id, courseId: course.id } });
    if (!cert) {
      const certId = `CP-${course.pathId.toUpperCase()}-${Date.now().toString(36).toUpperCase()}-${req.user.id.slice(0,4).toUpperCase()}`;
      cert = await Certificate.create({ userId: req.user.id, courseId: course.id, certificateId: certId, courseTitle: course.title });
    }

    res.json({
      certificateId: cert.certificateId,
      user: { username: user.username, email: user.email },
      course: { id: course.id, pathId: course.pathId, title: course.title, description: course.description, totalLessons: lessons.length, totalXp: lessons.reduce((s,l)=>s+(l.xpValue||0),0) },
      issuedAt: cert.issuedAt,
      verificationUrl: `https://codepath-api-qje4.onrender.com/api/certificates/verify/${cert.certificateId}`
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to generate certificate', details: e.message });
  }
});

export default router;