import { sequelize } from './src/models/index.js';
import { 
  DailyChallenge, 
  UserChallengeProgress, 
  Quest, 
  UserQuestProgress,
  XPMultiplier,
  StreakBonus 
} from './src/models/index.js';

async function syncGamification() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Sync only the gamification tables (without dropping existing tables)
    await DailyChallenge.sync({ alter: true });
    console.log('✅ DailyChallenge table synced');

    await UserChallengeProgress.sync({ alter: true });
    console.log('✅ UserChallengeProgress table synced');

    await Quest.sync({ alter: true });
    console.log('✅ Quest table synced');

    await UserQuestProgress.sync({ alter: true });
    console.log('✅ UserQuestProgress table synced');

    await XPMultiplier.sync({ alter: true });
    console.log('✅ XPMultiplier table synced');

    await StreakBonus.sync({ alter: true });
    console.log('✅ StreakBonus table synced');

    console.log('🎉 All gamification tables synced successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Sync error:', error);
    process.exit(1);
  }
}

syncGamification();