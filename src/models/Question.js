import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Question = sequelize.define('Question', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    lessonId: { type: DataTypes.UUID, allowNull: false },
    question: { type: DataTypes.TEXT, allowNull: false },
    options: { type: DataTypes.JSON, allowNull: false },
    correctIndex: { type: DataTypes.INTEGER, allowNull: false },
    explanation: { type: DataTypes.TEXT },
    xpValue: { type: DataTypes.INTEGER, defaultValue: 5 },
    order: { type: DataTypes.INTEGER, defaultValue: 1 }
  }, {
    tableName: 'questions',
    timestamps: true
  });
  return Question;
};

