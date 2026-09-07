import { sequelize, DailyChallenge } from './src/models/index.js';

async function checkChallenges() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    const allChallenges = await DailyChallenge.findAll();
    console.log(`📊 Total challenges: ${allChallenges.length}`);
    
    if (allChallenges.length === 0) {
      console.log('❌ No challenges found in database!');
      console.log('💡 You need to seed the production database.');
      console.log('   Run: node src/seed/gamificationSeed.js');
    } else {
      console.log('📋 All challenges:');
      allChallenges.forEach(c => {
        console.log(`  - ${c.title} (dayOfWeek: ${c.dayOfWeek === null ? 'any' : c.dayOfWeek}, active: ${c.isActive})`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkChallenges();