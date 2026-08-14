import { Course, Lesson, User, sequelize } from './src/models/index.js';

async function testModels() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Test Course model
    console.log('📚 Testing Course model...');
    const courses = await Course.findAll();
    console.log(`✅ Found ${courses.length} courses`);

    // Test Lesson model
    console.log('📖 Testing Lesson model...');
    const lessons = await Lesson.findAll();
    console.log(`✅ Found ${lessons.length} lessons`);

    // Test User model
    console.log('👤 Testing User model...');
    const users = await User.findAll();
    console.log(`✅ Found ${users.length} users`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testModels();