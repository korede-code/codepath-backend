import { sequelize, Course, Lesson, Badge, User } from '../models/index.js';
import bcrypt from 'bcryptjs';

async function forceSeed() {
  try {
    // Force sync (drop and recreate tables)
    await sequelize.sync({ force: true });
    console.log('✅ Database reset');

    // Create badges
    await Badge.bulkCreate([
      {
        name: 'First Steps',
        description: 'Complete your first lesson',
        image: 'badge-first-steps.png',
        requirement: 'Complete 1 lesson',
        requirementType: 'lessons_completed',
        requirementValue: 1,
        category: 'beginner',
        xpBonus: 10
      },
      {
        name: '7 Day Streak',
        description: 'Maintain a 7-day learning streak',
        image: 'badge-streak.png',
        requirement: '7 day streak',
        requirementType: 'streak_days',
        requirementValue: 7,
        category: 'intermediate',
        xpBonus: 25
      },
      {
        name: 'Project Builder',
        description: 'Complete 3 projects',
        image: 'badge-project-builder.png',
        requirement: 'Complete 3 projects',
        requirementType: 'projects_completed',
        requirementValue: 3,
        category: 'intermediate',
        xpBonus: 30
      }
    ]);
    console.log('✅ Badges created');

    // Create courses
    const courses = await Course.bulkCreate([
      {
        pathId: 'web-dev-fundamentals',
        title: 'Web Development Fundamentals',
        description: 'Learn HTML, CSS, and JavaScript by building real-world projects.',
        icon: '🌐',
        category: 'Web Development',
        difficulty: 'Beginner',
        order: 1
      },
      {
        pathId: 'python-essentials',
        title: 'Python Essentials',
        description: 'Start coding with Python and solve practical problems.',
        icon: '🐍',
        category: 'Programming',
        difficulty: 'Beginner',
        order: 2
      },
      {
        pathId: 'javascript-mastery',
        title: 'JavaScript Mastery',
        description: 'Deepen your JavaScript skills and build interactive apps.',
        icon: '⚡',
        category: 'Web Development',
        difficulty: 'Intermediate',
        order: 3
      },
      {
        pathId: 'zero-to-developer',
        title: 'From Zero to Developer',
        description: 'A complete roadmap for aspiring developers.',
        icon: '🚀',
        category: 'Full Stack',
        difficulty: 'Beginner',
        order: 4
      }
    ]);
    console.log('✅ Courses created');

    const getCourse = (pathId) => courses.find(c => c.pathId === pathId);

    // Create lessons
    const lessonData = [
      // Web Development Fundamentals - 4 lessons
      { courseId: getCourse('web-dev-fundamentals').id, title: 'Introduction to HTML', content: '# Introduction to HTML\n\nHTML is the standard markup language for creating web pages.', xpValue: 10, order: 1, type: 'lesson' },
      { courseId: getCourse('web-dev-fundamentals').id, title: 'CSS Styling Basics', content: '# CSS Styling Basics\n\nCSS is used to style and layout web pages.', xpValue: 10, order: 2, type: 'lesson' },
      { courseId: getCourse('web-dev-fundamentals').id, title: 'JavaScript Fundamentals', content: '# JavaScript Fundamentals\n\nJavaScript adds interactivity to web pages.', xpValue: 10, order: 3, type: 'lesson' },
      { courseId: getCourse('web-dev-fundamentals').id, title: 'Build a Calculator', content: '# Build a Calculator Project\n\nApply your skills to build a calculator.', xpValue: 25, order: 4, type: 'project' },
      
      // Python Essentials - 3 lessons
      { courseId: getCourse('python-essentials').id, title: 'Python Introduction', content: '# Python Introduction\n\nPython is a powerful, easy-to-learn programming language.', xpValue: 10, order: 1, type: 'lesson' },
      { courseId: getCourse('python-essentials').id, title: 'Python Functions', content: '# Python Functions\n\nFunctions are reusable blocks of code that perform specific tasks.', xpValue: 10, order: 2, type: 'lesson' },
      { courseId: getCourse('python-essentials').id, title: 'Data Structures in Python', content: '# Data Structures in Python\n\nPython provides powerful built-in data structures.', xpValue: 10, order: 3, type: 'lesson' },
      
      // JavaScript Mastery - 3 lessons
      { courseId: getCourse('javascript-mastery').id, title: 'Advanced JavaScript', content: '# Advanced JavaScript\n\nDeepen your JavaScript skills with advanced concepts.', xpValue: 15, order: 1, type: 'lesson' },
      { courseId: getCourse('javascript-mastery').id, title: 'DOM Manipulation', content: '# DOM Manipulation\n\nLearn how to interact with the Document Object Model.', xpValue: 15, order: 2, type: 'lesson' },
      { courseId: getCourse('javascript-mastery').id, title: 'Build a Weather App', content: '# Build a Weather App Project\n\nBuild an interactive weather application using JavaScript and APIs.', xpValue: 25, order: 3, type: 'project' },
      
      // Zero to Developer - 4 lessons
      { courseId: getCourse('zero-to-developer').id, title: 'Development Environment Setup', content: '# Development Environment Setup\n\nSet up your development environment for coding success.', xpValue: 10, order: 1, type: 'lesson' },
      { courseId: getCourse('zero-to-developer').id, title: 'Git and GitHub Basics', content: '# Git and GitHub Basics\n\nLearn how to use Git for version control and GitHub for collaboration.', xpValue: 10, order: 2, type: 'lesson' },
      { courseId: getCourse('zero-to-developer').id, title: 'Deploy Your First App', content: '# Deploy Your First App\n\nLearn how to deploy your web application to the internet.', xpValue: 15, order: 3, type: 'lesson' },
      { courseId: getCourse('zero-to-developer').id, title: 'Build a Portfolio Website', content: '# Build a Portfolio Website Project\n\nCreate a professional portfolio website to showcase your work.', xpValue: 25, order: 4, type: 'project' }
    ];

    await Lesson.bulkCreate(lessonData);
    console.log('✅ Lessons created');

    // Update course counts
    for (const course of courses) {
      const lessonCount = await Lesson.count({ where: { courseId: course.id } });
      const totalXp = await Lesson.sum('xpValue', { where: { courseId: course.id } });
      await course.update({
        totalLessons: lessonCount,
        totalXp: totalXp || 0
      });
    }
    console.log('✅ Course counts updated');

    // Create test user
    const hashedPassword = await bcrypt.hash('test123', 10);
    await User.create({
      email: 'alex@codepath.com',
      username: 'Alex',
      password: hashedPassword,
      level: 20,
      totalXp: 820,
      streak: 7,
      avatar: 'alex-avatar.png',
      bio: 'Passionate developer learning full-stack development.',
      lastActivity: new Date()
    });
    console.log('✅ Test user created');

    console.log('🎉 Database seeded successfully!');
    console.log('📊 Test user: alex@codepath.com / test123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

forceSeed();