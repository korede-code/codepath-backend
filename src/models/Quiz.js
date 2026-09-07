import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Quiz = sequelize.define('Quiz', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  lessonId: { type: DataTypes.UUID, allowNull: false },
  questions: { type: DataTypes.JSON, allowNull: false } // [{id, question, options:[], correctIndex, explanation}]
});

export default Quiz;