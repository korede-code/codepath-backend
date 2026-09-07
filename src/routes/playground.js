import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { PlaygroundSave } from '../models/index.js';

const router = express.Router();

// GET saved code for a lesson
router.get('/:lessonId', authenticate, async (req, res) => {
  try {
    const { lessonId } = req.params;
    if (!lessonId) return res.json({ save: null });
    
    const save = await PlaygroundSave.findOne({
      where: { userId: req.user.id, lessonId: String(lessonId) }
    });
    res.json({ save: save || null });
  } catch (e) {
    console.error('Get playground error:', e.message);
    res.json({ save: null }); // don't crash frontend
  }
});

// POST save code
router.post('/save', authenticate, async (req, res) => {
  try {
    const { lessonId, code, language, lastOutput, passed } = req.body;
    
    if (!lessonId || !code) {
      return res.status(400).json({ error: 'lessonId and code required' });
    }

    const lessonIdStr = String(lessonId);
    
    // try update else create
    let save = await PlaygroundSave.findOne({
      where: { userId: req.user.id, lessonId: lessonIdStr }
    });

    if (save) {
      await save.update({
        code,
        language: language || 'javascript',
        lastOutput: lastOutput || '',
        passed: !!passed
      });
    } else {
      save = await PlaygroundSave.create({
        userId: req.user.id,
        lessonId: lessonIdStr,
        code,
        language: language || 'javascript',
        lastOutput: lastOutput || '',
        passed: !!passed
      });
    }

    res.json({ save, message: 'Saved' });
  } catch (e) {
    console.error('Playground save error:', e);
    res.status(500).json({ error: e.message });
  }
});

export default router;