import { sequelize, DailyChallenge, Quest, XPMultiplier, StreakBonus } from '../models/index.js';

async function seedGamification() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Check if challenges already exist
    const existingChallenges = await DailyChallenge.count();
    if (existingChallenges > 0) {
      console.log('📚 Gamification data already seeded');
      process.exit(0);
      return;
    }

    console.log('🌱 Seeding gamification data...');

    // ========== DAILY CHALLENGES ==========
    await DailyChallenge.bulkCreate([
      {
        title: 'Complete 3 Lessons',
        description: 'Complete 3 lessons today to earn bonus XP!',
        type: 'complete_lesson',
        requirement: 3,
        xpReward: 50,
        bonusXpReward: 25,
        dayOfWeek: null, // Any day
        isActive: true
      },
      {
        title: 'Earn 100 XP',
        description: 'Earn 100 XP today through any activity!',
        type: 'earn_xp',
        requirement: 100,
        xpReward: 75,
        bonusXpReward: 30,
        dayOfWeek: null,
        isActive: true
      },
      {
        title: 'Maintain Your Streak',
        description: 'Log in and complete at least 1 lesson to maintain your streak!',
        type: 'maintain_streak',
        requirement: 1,
        xpReward: 40,
        bonusXpReward: 20,
        dayOfWeek: null,
        isActive: true
      },
      {
        title: 'Weekend Warrior',
        description: 'Complete 5 lessons this weekend!',
        type: 'complete_lesson',
        requirement: 5,
        xpReward: 100,
        bonusXpReward: 50,
        dayOfWeek: 6, // Saturday
        isActive: true
      },
      {
        title: 'Sunday Funday',
        description: 'Complete 3 lessons on Sunday!',
        type: 'complete_lesson',
        requirement: 3,
        xpReward: 60,
        bonusXpReward: 30,
        dayOfWeek: 0, // Sunday
        isActive: true
      }
    ]);
    console.log('✅ Daily challenges created');

    // ========== QUESTS ==========
    await Quest.bulkCreate([
      {
        title: 'Learning Path: Web Development',
        description: 'Complete all Web Development Fundamentals lessons',
        type: 'learning_path',
        steps: [
          { id: 'step1', description: 'Complete Introduction to HTML', requirement: 1 },
          { id: 'step2', description: 'Complete CSS Styling Basics', requirement: 1 },
          { id: 'step3', description: 'Complete JavaScript Fundamentals', requirement: 1 },
          { id: 'step4', description: 'Complete Build a Calculator', requirement: 1 }
        ],
        totalXpReward: 200,
        badgeReward: 'Web Developer',
        isActive: true,
        order: 1
      },
      {
        title: 'Streak Master',
        description: 'Maintain a 7-day learning streak',
        type: 'streak',
        steps: [
          { id: 'step1', description: 'Complete 1 lesson for 7 days in a row', requirement: 7 }
        ],
        totalXpReward: 150,
        badgeReward: 'Streak Master',
        isActive: true,
        order: 2
      },
      {
        title: 'Project Builder',
        description: 'Complete all project lessons',
        type: 'projects',
        steps: [
          { id: 'step1', description: 'Complete Build a Calculator', requirement: 1 },
          { id: 'step2', description: 'Complete Build a Weather App', requirement: 1 },
          { id: 'step3', description: 'Complete Build a Portfolio Website', requirement: 1 }
        ],
        totalXpReward: 300,
        badgeReward: 'Project Master',
        isActive: true,
        order: 3
      }
    ]);
    console.log('✅ Quests created');

    // ========== XP MULTIPLIERS ==========
    const now = new Date();
    const twoWeeksLater = new Date(now);
    twoWeeksLater.setDate(twoWeeksLater.getDate() + 14);

    await XPMultiplier.bulkCreate([
      {
        name: 'Weekend XP Boost',
        multiplier: 1.5,
        startsAt: now,
        endsAt: twoWeeksLater,
        isActive: true
      },
      {
        name: 'New Year Special',
        multiplier: 2.0,
        startsAt: new Date('2026-01-01'),
        endsAt: new Date('2026-01-15'),
        isActive: false
      }
    ]);
    console.log('✅ XP Multipliers created');

    // ========== STREAK BONUSES ==========
    await StreakBonus.bulkCreate([
      {
        streakDays: 3,
        bonusXp: 10,
        badgeReward: '3 Day Streak'
      },
      {
        streakDays: 7,
        bonusXp: 30,
        badgeReward: '7 Day Streak'
      },
      {
        streakDays: 14,
        bonusXp: 50,
        badgeReward: '14 Day Streak'
      },
      {
        streakDays: 30,
        bonusXp: 100,
        badgeReward: '30 Day Streak'
      }
    ]);
    console.log('✅ Streak bonuses created');

    console.log('🎉 Gamification data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seedGamification();