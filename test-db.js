import { sequelize, Course, Lesson, User } from './src/models/index.js';

async function testDB() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Count courses
    const courseCount = await Course.count();
    console.log(`📚 Total courses: ${courseCount}`);

    if (courseCount > 0) {
      const courses = await Course.findAll();
      courses.forEach(c => {
        console.log(`- ${c.title} (${c.pathId})`);
      });
    }

    // Count users
    const userCount = await User.count();
    console.log(`👤 Total users: ${userCount}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testDB();