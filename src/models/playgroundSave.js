import { DataTypes } from 'sequelize';
import { sequelize } from './index.js';

const PlaygroundSave = sequelize.define('PlaygroundSave', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  lessonId: { type: DataTypes.STRING, allowNull: false },
  code: { type: DataTypes.TEXT, allowNull: false },
  language: { type: DataTypes.STRING, defaultValue: 'javascript' },
  lastOutput: { type: DataTypes.TEXT },
  passed: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  indexes: [{ unique: true, fields: ['userId', 'lessonId'] }],
  updatedAt: true,
});

export default PlaygroundSave;