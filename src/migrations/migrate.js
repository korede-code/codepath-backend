import { sequelize, User, Course, Lesson, Badge } from '../models/index.js';
import { seedDatabase } from '../seed/seedData.js';

async function migrate() {
  try {
    // Sync database (creates tables if they don't exist)
    await sequelize.sync({ force: true });
    console.log('✅ Database tables created');

    // Seed data
    await seedDatabase();
    console.log('✅ Database seeded');

    console.log('🎉 Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();