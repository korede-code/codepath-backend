import express from 'express';
const router = express.Router();

router.get('/verify/:certificateId', (req, res) => {
  res.json({ valid: false, test: 'verify route works', id: req.params.certificateId });
});

router.get('/:courseId', (req, res) => {
  res.json({
    certificateId: `CP-TEST-${Date.now()}`,
    user: { username: 'Korede', email: 'test@test.com' },
    course: { 
      id: 'test-id',
      pathId: req.params.courseId,
      title: `Course ${req.params.courseId}`,
      description: 'Test Certificate',
      totalLessons: 4,
      totalXp: 100
    },
    issuedAt: new Date(),
    verificationUrl: `https://codepath-api-qje4.onrender.com/api/certificates/verify/CP-TEST`
  });
});

export default router;