import { sequelize, Course, Lesson, Badge, User, Question } from '../models/index.js';
import bcrypt from 'bcryptjs';

async function forceSeed() {
  try {
    await sequelize.sync({ force: true });
    console.log('✅ Database reset');

    await Badge.bulkCreate([
      { name: 'First Steps', description: 'Complete your first lesson', image: 'badge-first-steps.png', requirement: 'Complete 1 lesson', requirementType: 'lessons_completed', requirementValue: 1, category: 'beginner', xpBonus: 10 },
      { name: '7 Day Streak', description: 'Maintain a 7-day learning streak', image: 'badge-streak.png', requirement: '7 day streak', requirementType: 'streak_days', requirementValue: 7, category: 'intermediate', xpBonus: 25 },
      { name: 'Project Builder', description: 'Complete 3 projects', image: 'badge-project-builder.png', requirement: 'Complete 3 projects', requirementType: 'projects_completed', requirementValue: 3, category: 'intermediate', xpBonus: 30 }
    ]);
    console.log('✅ Badges created');

    const courses = await Course.bulkCreate([
      { pathId: 'web-dev-fundamentals', title: 'Web Development Fundamentals', description: 'Learn HTML, CSS, and JavaScript', icon: '🌐', category: 'Web Development', difficulty: 'Beginner', order: 1 },
      { pathId: 'python-essentials', title: 'Python Essentials', description: 'Start coding with Python', icon: '🐍', category: 'Programming', difficulty: 'Beginner', order: 2 },
      { pathId: 'javascript-mastery', title: 'JavaScript Mastery', description: 'Deepen your JavaScript skills', icon: '⚡', category: 'Web Development', difficulty: 'Intermediate', order: 3 },
      { pathId: 'zero-to-developer', title: 'From Zero to Developer', description: 'Complete roadmap', icon: '🚀', category: 'Full Stack', difficulty: 'Beginner', order: 4 }
    ]);
    console.log('✅ Courses created');

    const getCourse = (pathId) => courses.find(c => c.pathId === pathId);

    // FIXED IDs - never change again
    const lessonData = [
      { id: 'a9564270-b532-4a87-bd66-2376b1f1fed6', courseId: getCourse('zero-to-developer').id, title: 'Development Environment Setup', content: '# Dev Setup', xpValue: 10, order: 1, type: 'lesson' },
      { id: '03fa1637-a979-4f53-bf4b-c2cf3f6bec15', courseId: getCourse('zero-to-developer').id, title: 'Git and GitHub Basics', content: '# Git Basics', xpValue: 10, order: 2, type: 'lesson' },
      { id: '45513aa1-a64c-4e0b-8acd-42c360f0747f', courseId: getCourse('zero-to-developer').id, title: 'Deploy Your First App', content: '# Deploy', xpValue: 15, order: 3, type: 'lesson' },
      { id: '45b3329d-9816-48f5-bf58-41edce7eb72c', courseId: getCourse('zero-to-developer').id, title: 'Build a Portfolio Website', content: '# Portfolio', xpValue: 25, order: 4, type: 'project' },
      { id: '7b9c9961-2588-4a6b-b157-2b986ad0a602', courseId: getCourse('web-dev-fundamentals').id, title: 'Introduction to HTML', content: '# HTML', xpValue: 10, order: 1, type: 'lesson' },
      { id: '8fc1266d-14bf-4db3-a048-8d1ff42754da', courseId: getCourse('web-dev-fundamentals').id, title: 'CSS Styling Basics', content: '# CSS', xpValue: 10, order: 2, type: 'lesson' },
      { id: 'c1fde0ed-7f42-4659-84da-160bb22de6a6', courseId: getCourse('web-dev-fundamentals').id, title: 'JavaScript Fundamentals', content: '# JS', xpValue: 10, order: 3, type: 'lesson' },
      { id: 'c2b5fb67-1622-431d-94b2-14b503528143', courseId: getCourse('web-dev-fundamentals').id, title: 'Build a Calculator', content: '# Calculator', xpValue: 25, order: 4, type: 'project' },
      { id: '50b8d062-5112-4348-b0d6-6918467df7c9', courseId: getCourse('javascript-mastery').id, title: 'Advanced JavaScript', content: '# Adv JS', xpValue: 15, order: 1, type: 'lesson' },
      { id: '142552c3-7c04-4a95-a608-0d29c96c987d', courseId: getCourse('javascript-mastery').id, title: 'DOM Manipulation', content: '# DOM', xpValue: 15, order: 2, type: 'lesson' },
      { id: 'afe58df5-56aa-4793-a104-d352c7fa7b82', courseId: getCourse('javascript-mastery').id, title: 'Build a Weather App', content: '# Weather', xpValue: 25, order: 3, type: 'project' },
      { id: '8a2050c3-eb06-474a-9725-9d4b465f49ce', courseId: getCourse('python-essentials').id, title: 'Python Introduction', content: '# Python Intro', xpValue: 10, order: 1, type: 'lesson' },
      { id: '0089ea1d-8a32-452d-b510-aa452ec10d43', courseId: getCourse('python-essentials').id, title: 'Python Functions', content: '# Functions', xpValue: 10, order: 2, type: 'lesson' },
      { id: '9e54cb2c-9741-4637-add0-a5f7e7d5e063', courseId: getCourse('python-essentials').id, title: 'Data Structures in Python', content: '# Data Structures', xpValue: 10, order: 3, type: 'lesson' },
    ];
    await Lesson.bulkCreate(lessonData);
    console.log('✅ Lessons created with FIXED IDs');

    for (const course of courses) {
      const lessonCount = await Lesson.count({ where: { courseId: course.id } });
      const totalXp = await Lesson.sum('xpValue', { where: { courseId: course.id } });
      await course.update({ totalLessons: lessonCount, totalXp: totalXp || 0 });
    }

    // 40 QUESTIONS - THIS WAS MISSING
    const q = (lessonTitle, question, options, correctIndex, explanation, order) => {
      const lesson = lessonData.find(l => l.title === lessonTitle);
      return { lessonId: lesson.id, question, options, correctIndex, explanation, order };
    };

    await Question.bulkCreate([
      q('Development Environment Setup', 'What is VS Code?', ['Browser','Code editor','Database','OS'], 1, 'VS Code is a code editor', 1),
      q('Development Environment Setup', 'What does IDE stand for?', ['Internet Dev Env','Integrated Dev Env','Internal Data Engine','Interface Design Editor'], 1, '', 2),
      q('Development Environment Setup', 'Which command lists files?', ['cd','ls','mkdir','rm'], 1, '', 3),
      q('Git and GitHub Basics', 'What is Git?', ['Language','Version control','Framework','Cloud'], 1, 'Git tracks changes', 1),
      q('Git and GitHub Basics', 'What command initializes Git?', ['git start','git init','git create','git new'], 1, '', 2),
      q('Git and GitHub Basics', 'What is GitHub?', ['Local tool','Cloud hosting for Git','JS library','CSS framework'], 1, '', 3),
      q('Git and GitHub Basics', 'What is a commit?', ['Delete','Snapshot of changes','Push','Branch'], 1, '', 4),
      q('Deploy Your First App', 'What is Vercel used for?', ['Writing code','Deploying apps','Designing logos','DB'], 1, '', 1),
      q('Deploy Your First App', 'What does DNS do?', ['Styles sites','Domain to IP','Writes JS','Stores passwords'], 1, '', 2),
      q('Build a Portfolio Website', 'What should portfolio contain?', ['Only text','Projects, skills, contact','Only photo','Only resume'], 1, '', 1),

      q('Introduction to HTML', 'What does HTML stand for?', ['Hyper Text Markup Language','High Tech Modern','Hyper Transfer','Home Tool Markup'], 0, '', 1),
      q('Introduction to HTML', 'Which tag creates heading?', ['<head>','<h1>','<header>','<title>'], 1, '', 2),
      q('Introduction to HTML', 'Which tag creates link?', ['<link>','<a>','<href>','<url>'], 1, '', 3),
      q('CSS Styling Basics', 'What does CSS stand for?', ['Creative Style','Cascading Style Sheets','Colorful Style','Computer Style'], 1, '', 1),
      q('CSS Styling Basics', 'How to select by ID in CSS?', ['.id','#id','*id','id'], 1, '', 2),
      q('CSS Styling Basics', 'What is flexbox for?', ['DB queries','Layout and alignment','Animations','Color'], 1, '', 3),
      q('JavaScript Fundamentals', 'Which adds interactivity?', ['HTML','CSS','JavaScript','SQL'], 2, '', 1),
      q('JavaScript Fundamentals', 'How to get element by ID in JS?', ['getElementById','getElement','querySelectorAll','getId'], 0, '', 2),
      q('JavaScript Fundamentals', 'What is array in JS?', ['Single value','List of values','Function','Style'], 1, '', 3),
      q('Build a Calculator', 'What does DOM stand for?', ['Document Object Model','Data Object Management','Document Order Model','Display Object Method'], 0, '', 1),

      q('Advanced JavaScript', 'What is closure?', ['Function with outer scope access','Loop','CSS prop','DB'], 0, '', 1),
      q('Advanced JavaScript', 'What does async/await handle?', ['Styling','Async operations','DB only','Images'], 1, '', 2),
      q('Advanced JavaScript', 'What is Promise?', ['Guaranteed value','Object for async result','Loop','Array type'], 1, '', 3),
      q('Advanced JavaScript', 'What is destructuring?', ['Breaking arrays/objects into vars','Deleting code','Styling','Compiling'], 0, '', 4),
      q('Advanced JavaScript', 'What does === check?', ['Value only','Value and type','Type only','Nothing'], 1, '=== strict equality', 5),
      q('DOM Manipulation', 'What does querySelector do?', ['Selects first match','Selects all','Creates element','Deletes'], 0, '', 1),
      q('DOM Manipulation', 'What is event bubbling?', ['Event goes up DOM','Goes down','Stops','Loops'], 0, '', 2),
      q('DOM Manipulation', 'What is localStorage?', ['Server storage','Browser storage persists','RAM','CSS storage'], 1, '', 3),
      q('Build a Weather App', 'What is fetch API for?', ['Fetching styles','HTTP requests','Images only','Styling'], 1, '', 1),
      q('Build a Weather App', 'What is API key?', ['Password for API','CSS key','HTML tag','Git command'], 0, '', 2),

      q('Python Introduction', 'How to print in Python?', ['console.log','print()','echo','printf'], 1, '', 1),
      q('Python Introduction', 'How to create variable in Python?', ['var x=5','x=5','let x=5','const x=5'], 1, '', 2),
      q('Python Introduction', 'How to comment in Python?', ['//','/* */','#','--'], 2, '', 3),
      q('Python Functions', 'How to define function?', ['function()','def myFunc():','func()','def(){}'], 1, '', 1),
      q('Python Functions', 'What does return do?', ['Prints','Sends value back','Stops program','Deletes'], 1, '', 2),
      q('Python Functions', 'What is len() for?', ['Length','Delete','Create','Print'], 0, '', 3),
      q('Data Structures in Python', 'Which is Python list?', ['{1,2,3}','[1,2,3]','(1,2,3)','<1,2,3>'], 1, '', 1),
      q('Data Structures in Python', 'What is dict?', ['Ordered list','Key-value pairs','Only numbers','Only strings'], 1, '', 2),
      q('Data Structures in Python', 'What does append() do?', ['Removes last','Adds to end','Sorts','Reverses'], 1, '', 3),
      q('Data Structures in Python', 'What is pip?', ['Snake','Package manager','Function','Variable'], 1, '', 4),
    ]);
    console.log('✅ 40 Questions created');

    const hashedPassword = await bcrypt.hash('test123', 10);
    await User.create({ email: 'alex@codepath.com', username: 'Alex', password: hashedPassword, level: 20, totalXp: 820, streak: 7, avatar: 'alex-avatar.png', bio: 'Passionate developer', lastActivity: new Date() });
    console.log('✅ Test user created');

    console.log('🎉 Database seeded! Test user: alex@codepath.com / test123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

forceSeed();