import express from 'express';
import { Op } from 'sequelize';
import { 
  DailyChallenge, 
  UserChallengeProgress, 
  Quest, 
  UserQuestProgress,
  XPMultiplier,
  StreakBonus,
  User,
  UserProgress,
  Lesson,
  Activity
} from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';
import { emitToUser } from '../socket.js';

const router = express.Router();

// ========== DAILY CHALLENGES ==========

// Get today's challenges
router.get('/challenges/today', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const challenges = await DailyChallenge.findAll({
      where: {
        isActive: true,
        [Op.or]: [
          { dayOfWeek: today.getDay() },
          { dayOfWeek: null }
        ],
        [Op.or]: [
          { startsAt: null },
          { startsAt: { [Op.lte]: today } }
        ],
        [Op.or]: [
          { endsAt: null },
          { endsAt: { [Op.gte]: today } }
        ]
      }
    });
    
    // Get user progress for challenges
    const challengeIds = challenges.map(c => c.id);
    const progress = await UserChallengeProgress.findAll({
      where: {
        userId,
        challengeId: challengeIds
      }
    });
    
    const progressMap = {};
    progress.forEach(p => {
      progressMap[p.challengeId] = {
        progress: p.progress,
        isCompleted: p.isCompleted,
        claimedAt: p.claimedAt
      };
    });
    
    const challengesWithProgress = challenges.map(challenge => ({
      ...challenge.toJSON(),
      progress: progressMap[challenge.id]?.progress || 0,
      isCompleted: progressMap[challenge.id]?.isCompleted || false,
      isClaimed: !!progressMap[challenge.id]?.claimedAt
    }));
    
    res.json(challengesWithProgress);
  } catch (error) {
    console.error('❌ Get challenges error:', error);
    res.status(500).json({ error: 'Failed to fetch challenges' });
  }
});

// Complete a daily challenge
router.post('/challenges/:challengeId/complete', authenticateToken, async (req, res) => {
  try {
    const { challengeId } = req.params;
    const userId = req.user.id;
    
    const challenge = await DailyChallenge.findByPk(challengeId);
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }
    
    let progress = await UserChallengeProgress.findOne({
      where: { userId, challengeId }
    });
    
    if (!progress) {
      progress = await UserChallengeProgress.create({
        userId,
        challengeId,
        progress: 0,
        isCompleted: false
      });
    }
    
    if (progress.isCompleted) {
      return res.status(400).json({ error: 'Challenge already completed' });
    }
    
    // Update progress based on challenge type
    let newProgress = progress.progress + 1;
    let isCompleted = newProgress >= challenge.requirement;
    
    await progress.update({
      progress: newProgress,
      isCompleted,
      completedAt: isCompleted ? new Date() : null
    });
    
    if (isCompleted) {
      // Award XP
      const user = await User.findByPk(userId);
      user.totalXp += challenge.xpReward;
      user.updateLevel();
      await user.save();
      
      // Check for bonus XP
      if (challenge.bonusXpReward > 0) {
        user.totalXp += challenge.bonusXpReward;
        await user.save();
      }
      
      // Socket notification
      emitToUser(userId, 'challenge-completed', {
        challenge: challenge,
        xpEarned: challenge.xpReward + challenge.bonusXpReward
      });
      
      // Create activity
      await Activity.create({
        userId,
        type: 'completed_challenge',
        targetId: challenge.id,
        targetType: 'daily_challenge',
        metadata: { title: challenge.title, xpEarned: challenge.xpReward }
      });
    }
    
    res.json({
      progress: progress.progress,
      isCompleted,
      challenge
    });
  } catch (error) {
    console.error('❌ Complete challenge error:', error);
    res.status(500).json({ error: 'Failed to complete challenge' });
  }
});

// Claim challenge reward
router.post('/challenges/:challengeId/claim', authenticateToken, async (req, res) => {
  try {
    const { challengeId } = req.params;
    const userId = req.user.id;
    
    const progress = await UserChallengeProgress.findOne({
      where: { userId, challengeId, isCompleted: true }
    });
    
    if (!progress) {
      return res.status(404).json({ error: 'Challenge not completed' });
    }
    
    if (progress.claimedAt) {
      return res.status(400).json({ error: 'Reward already claimed' });
    }
    
    await progress.update({ claimedAt: new Date() });
    
    res.json({ message: 'Reward claimed successfully!' });
  } catch (error) {
    console.error('❌ Claim challenge error:', error);
    res.status(500).json({ error: 'Failed to claim reward' });
  }
});

// ========== QUESTS ==========

// Get active quests
router.get('/quests', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const quests = await Quest.findAll({
      where: { isActive: true },
      order: [['order', 'ASC']]
    });
    
    // Get user progress
    const questIds = quests.map(q => q.id);
    const progress = await UserQuestProgress.findAll({
      where: { userId, questId: questIds }
    });
    
    const progressMap = {};
    progress.forEach(p => {
      progressMap[p.questId] = p;
    });
    
    const questsWithProgress = quests.map(quest => ({
      ...quest.toJSON(),
      progress: progressMap[quest.id] || null
    }));
    
    res.json(questsWithProgress);
  } catch (error) {
    console.error('❌ Get quests error:', error);
    res.status(500).json({ error: 'Failed to fetch quests' });
  }
});

// Update quest progress
router.post('/quests/:questId/progress', authenticateToken, async (req, res) => {
  try {
    const { questId } = req.params;
    const userId = req.user.id;
    const { step, increment = 1 } = req.body;
    
    const quest = await Quest.findByPk(questId);
    if (!quest) {
      return res.status(404).json({ error: 'Quest not found' });
    }
    
    let progress = await UserQuestProgress.findOne({
      where: { userId, questId }
    });
    
    if (!progress) {
      progress = await UserQuestProgress.create({
        userId,
        questId,
        stepProgress: {},
        isCompleted: false
      });
    }
    
    if (progress.isCompleted) {
      return res.status(400).json({ error: 'Quest already completed' });
    }
    
    // Update step progress
    const stepProgress = progress.stepProgress || {};
    stepProgress[step] = (stepProgress[step] || 0) + increment;
    
    // Check if all steps are completed
    const allStepsCompleted = quest.steps.every(s => 
      (stepProgress[s.id] || 0) >= s.requirement
    );
    
    await progress.update({
      stepProgress,
      isCompleted: allStepsCompleted,
      completedAt: allStepsCompleted ? new Date() : null
    });
    
    if (allStepsCompleted) {
      // Award XP
      const user = await User.findByPk(userId);
      user.totalXp += quest.totalXpReward;
      user.updateLevel();
      await user.save();
      
      // Award badge if applicable
      if (quest.badgeReward) {
        // Add badge logic here
      }
      
      // Socket notification
      emitToUser(userId, 'quest-completed', {
        quest: quest,
        xpEarned: quest.totalXpReward
      });
    }
    
    res.json({
      stepProgress: progress.stepProgress,
      isCompleted: progress.isCompleted
    });
  } catch (error) {
    console.error('❌ Update quest error:', error);
    res.status(500).json({ error: 'Failed to update quest progress' });
  }
});

// ========== XP MULTIPLIERS ==========

// Get active XP multipliers
router.get('/multipliers', authenticateToken, async (req, res) => {
  try {
    const now = new Date();
    
    const multipliers = await XPMultiplier.findAll({
      where: {
        isActive: true,
        startsAt: { [Op.lte]: now },
        endsAt: { [Op.gte]: now }
      }
    });
    
    res.json(multipliers);
  } catch (error) {
    console.error('❌ Get multipliers error:', error);
    res.status(500).json({ error: 'Failed to fetch multipliers' });
  }
});

// ========== STREAK BONUSES ==========

// Get streak bonuses
router.get('/streak-bonuses', authenticateToken, async (req, res) => {
  try {
    const bonuses = await StreakBonus.findAll({
      order: [['streakDays', 'ASC']]
    });
    
    res.json(bonuses);
  } catch (error) {
    console.error('❌ Get streak bonuses error:', error);
    res.status(500).json({ error: 'Failed to fetch streak bonuses' });
  }
});

// ========== GAMIFICATION SUMMARY ==========

router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get daily challenges
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const challenges = await DailyChallenge.findAll({
      where: {
        isActive: true,
        [Op.or]: [
          { dayOfWeek: today.getDay() },
          { dayOfWeek: null }
        ]
      }
    });
    
    const challengeIds = challenges.map(c => c.id);
    const challengeProgress = await UserChallengeProgress.findAll({
      where: { userId, challengeId: challengeIds }
    });
    
    const completedChallenges = challengeProgress.filter(p => p.isCompleted).length;
    const totalChallenges = challenges.length;
    
    // Get active quests
    const quests = await Quest.findAll({
      where: { isActive: true }
    });
    
    const questIds = quests.map(q => q.id);
    const questProgress = await UserQuestProgress.findAll({
      where: { userId, questId: questIds }
    });
    
    const completedQuests = questProgress.filter(p => p.isCompleted).length;
    const totalQuests = quests.length;
    
    // Get active multipliers
    const multipliers = await XPMultiplier.findAll({
      where: {
        isActive: true,
        startsAt: { [Op.lte]: new Date() },
        endsAt: { [Op.gte]: new Date() }
      }
    });
    
    res.json({
      challenges: {
        completed: completedChallenges,
        total: totalChallenges
      },
      quests: {
        completed: completedQuests,
        total: totalQuests
      },
      activeMultipliers: multipliers
    });
  } catch (error) {
    console.error('❌ Get summary error:', error);
    res.status(500).json({ error: 'Failed to fetch gamification summary' });
  }
});

export default router;