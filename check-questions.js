import { sequelize, Question, Lesson } from './src/models/index.js';

async function check() {
  await sequelize.authenticate();

  const count = await Question.count();
  console.log(`📝 Total questions: ${count}`);

  const sample = await Question.findAll({
    limit: 3,
    include: [{ model: Lesson, as: 'lesson' }]
  });

  sample.forEach(q => {
    console.log(`- ${q.question} (lesson: ${q.lesson?.title})`);
  });

  process.exit(0);
}

check().catch(err => { console.error(err); process.exit(1); });