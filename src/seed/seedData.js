import { User, Course, Lesson, Badge, UserProgress, sequelize } from '../models/index.js';
import bcrypt from 'bcryptjs';

export async function seedDatabase() {
  try {
    const courseCount = await Course.count();
    if (courseCount > 0) {
      console.log('📚 Database already seeded');
      return;
    }

    console.log('🌱 Seeding database...');

    // Create Badges
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
        name: 'First Steps',
        description: 'Complete your first lesson',
        image: 'badge-first-steps.png',
        icon: '🌱',
        requirement: 'Complete 1 lesson',
        requirementType: 'lessons_completed',
        requirementValue: 1,
        category: 'beginner',
        xpBonus: 10
      },
      {
        name: 'Lesson Learner',
        description: 'Complete 5 lessons',
        image: 'badge-lesson-learner.png',
        icon: '📚',
        requirement: 'Complete 5 lessons',
        requirementType: 'lessons_completed',
        requirementValue: 5,
        category: 'beginner',
        xpBonus: 25
      },
      {
        name: 'Dedicated Student',
        description: 'Complete 10 lessons',
        image: 'badge-dedicated.png',
        icon: '🎯',
        requirement: 'Complete 10 lessons',
        requirementType: 'lessons_completed',
        requirementValue: 10,
        category: 'intermediate',
        xpBonus: 50
      },
      {
        name: 'Master Learner',
        description: 'Complete 25 lessons',
        image: 'badge-master.png',
        icon: '👑',
        requirement: 'Complete 25 lessons',
        requirementType: 'lessons_completed',
        requirementValue: 25,
        category: 'advanced',
        xpBonus: 100
      },
      {
        name: 'XP Collector',
        description: 'Earn 100 XP',
        image: 'badge-xp-collector.png',
        icon: '⭐',
        requirement: 'Earn 100 XP',
        requirementType: 'xp_earned',
        requirementValue: 100,
        category: 'beginner',
        xpBonus: 15
      },
      {
        name: 'XP Champion',
        description: 'Earn 500 XP',
        image: 'badge-xp-champion.png',
        icon: '🌟',
        requirement: 'Earn 500 XP',
        requirementType: 'xp_earned',
        requirementValue: 500,
        category: 'intermediate',
        xpBonus: 50
      },
      {
        name: 'XP Master',
        description: 'Earn 1000 XP',
        image: 'badge-xp-master.png',
        icon: '💎',
        requirement: 'Earn 1000 XP',
        requirementType: 'xp_earned',
        requirementValue: 1000,
        category: 'advanced',
        xpBonus: 100
      },
      {
        name: '7 Day Streak',
        description: 'Maintain a 7-day learning streak',
        image: 'badge-streak-7.png',
        icon: '🔥',
        requirement: '7 day streak',
        requirementType: 'streak_days',
        requirementValue: 7,
        category: 'intermediate',
        xpBonus: 30
      },
      {
        name: '14 Day Streak',
        description: 'Maintain a 14-day learning streak',
        image: 'badge-streak-14.png',
        icon: '🔥🔥',
        requirement: '14 day streak',
        requirementType: 'streak_days',
        requirementValue: 14,
        category: 'advanced',
        xpBonus: 60
      },
      {
        name: 'Project Builder',
        description: 'Complete 1 project',
        image: 'badge-project-builder.png',
        icon: '🔧',
        requirement: 'Complete 1 project',
        requirementType: 'projects_completed',
        requirementValue: 1,
        category: 'intermediate',
        xpBonus: 25
      },
      {
        name: 'Project Master',
        description: 'Complete 3 projects',
        image: 'badge-project-master.png',
        icon: '🚀',
        requirement: 'Complete 3 projects',
        requirementType: 'projects_completed',
        requirementValue: 3,
        category: 'advanced',
        xpBonus: 75
      },
      {
        name: 'Code Path Pioneer',
        description: 'Complete all courses',
        image: 'badge-pioneer.png',
        icon: '🏆',
        requirement: 'Complete 4 courses',
        requirementType: 'lessons_completed',
        requirementValue: 100,
        category: 'special',
        xpBonus: 200
      }
    ]);

    // Create Courses
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

    // Helper to get course
    const getCourse = (pathId) => courses.find(c => c.pathId === pathId);

    // Create Lessons for Web Development
    const webDevCourse = getCourse('web-dev-fundamentals');
    await Lesson.bulkCreate([
      {
        courseId: webDevCourse.id,
        title: 'Introduction to HTML',
        content: '# Introduction to HTML\n\nHTML is the standard markup language for creating web pages.',
        xpValue: 10,
        order: 1,
        type: 'lesson'
      },
      {
        courseId: webDevCourse.id,
        title: 'CSS Styling Basics',
        content: '# CSS Styling Basics\n\nCSS is used to style and layout web pages.',
        xpValue: 10,
        order: 2,
        type: 'lesson'
      },
      {
        courseId: webDevCourse.id,
        title: 'JavaScript Fundamentals',
        content: '# JavaScript Fundamentals\n\nJavaScript adds interactivity to web pages.',
        xpValue: 10,
        order: 3,
        type: 'lesson'
      },
      {
        courseId: webDevCourse.id,
        title: 'Build a Calculator',
        content: '# Build a Calculator Project\n\nApply your skills to build a calculator.',
        xpValue: 25,
        order: 4,
        type: 'project'
      }
    ]);

    // Create Lessons for Python
    const pythonCourse = getCourse('python-essentials');
    await Lesson.bulkCreate([
      {
        courseId: pythonCourse.id,
        title: 'Python Introduction',
        content: '# Python Introduction\n\nPython is a powerful, easy-to-learn programming language.',
        xpValue: 10,
        order: 1,
        type: 'lesson'
      },
      {
        courseId: pythonCourse.id,
        title: 'Python Functions',
        content: '# Python Functions\n\nFunctions are reusable blocks of code that perform specific tasks.',
        xpValue: 10,
        order: 2,
        type: 'lesson'
      },
      {
        courseId: pythonCourse.id,
        title: 'Data Structures in Python',
        content: '# Data Structures in Python\n\nPython provides powerful built-in data structures.',
        xpValue: 10,
        order: 3,
        type: 'lesson'
      }
    ]);

    // Create Lessons for JavaScript Mastery
    const jsCourse = getCourse('javascript-mastery');
    await Lesson.bulkCreate([
      {
        courseId: jsCourse.id,
        title: 'Advanced JavaScript',
        content: '# Advanced JavaScript\n\nDeepen your JavaScript skills with advanced concepts.',
        xpValue: 15,
        order: 1,
        type: 'lesson'
      },
      {
        courseId: jsCourse.id,
        title: 'DOM Manipulation',
        content: '# DOM Manipulation\n\nLearn how to interact with the Document Object Model.',
        xpValue: 15,
        order: 2,
        type: 'lesson'
      },
      {
        courseId: jsCourse.id,
        title: 'Build a Weather App',
        content: '# Build a Weather App Project\n\nBuild an interactive weather application using JavaScript and APIs.',
        xpValue: 25,
        order: 3,
        type: 'project'
      }
    ]);

    // Create Lessons for Zero to Developer
    const zeroCourse = getCourse('zero-to-developer');
    await Lesson.bulkCreate([
      {
        courseId: zeroCourse.id,
        title: 'Development Environment Setup',
        content: '# Development Environment Setup\n\nSet up your development environment for coding success.',
        xpValue: 10,
        order: 1,
        type: 'lesson'
      },
      {
        courseId: zeroCourse.id,
        title: 'Git and GitHub Basics',
        content: '# Git and GitHub Basics\n\nLearn how to use Git for version control and GitHub for collaboration.',
        xpValue: 10,
        order: 2,
        type: 'lesson'
      },
      {
        courseId: zeroCourse.id,
        title: 'Deploy Your First App',
        content: '# Deploy Your First App\n\nLearn how to deploy your web application to the internet.',
        xpValue: 15,
        order: 3,
        type: 'lesson'
      },
      {
        courseId: zeroCourse.id,
        title: 'Build a Portfolio Website',
        content: '# Build a Portfolio Website Project\n\nCreate a professional portfolio website to showcase your work.',
        xpValue: 25,
        order: 4,
        type: 'project'
      }
    ]);

    // Update course counts
    for (const course of courses) {
      const lessonCount = await Lesson.count({ where: { courseId: course.id } });
      const totalXp = await Lesson.sum('xpValue', { where: { courseId: course.id } });
      await course.update({
        totalLessons: lessonCount,
        totalXp: totalXp || 0
      });
    }

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

    console.log('✅ Database seeded successfully');
    console.log('📊 Test user: alex@codepath.com / test123');

  } catch (error) {
    console.error('❌ Seeding error:', error);
    throw error;
  }
}