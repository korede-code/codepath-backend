import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Create Sequelize instance
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// ============ DEFINE MODELS ============

// User Model
const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true
  },
  googleId: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  avatar: {
    type: DataTypes.STRING,
    defaultValue: 'default-avatar.png'
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  level: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  totalXp: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  rank: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  streak: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lastActivity: {
    type: DataTypes.DATE,
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: true,
  tableName: 'users'
});

// Course Model
const Course = sequelize.define('Course', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  pathId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  icon: {
    type: DataTypes.STRING,
    allowNull: true
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true
  },
  difficulty: {
    type: DataTypes.ENUM('Beginner', 'Intermediate', 'Advanced'),
    defaultValue: 'Beginner'
  },
  totalLessons: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  totalXp: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isLocked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  order: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'courses'
});

// Lesson Model
const Lesson = sequelize.define('Lesson', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  xpValue: {
    type: DataTypes.INTEGER,
    defaultValue: 10
  },
  order: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('lesson', 'project', 'quiz'),
    defaultValue: 'lesson'
  },
  codeExample: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  solution: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isLocked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: true,
  tableName: 'lessons'
});

// UserProgress Model
const UserProgress = sequelize.define('UserProgress', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  lessonId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  courseId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  xpEarned: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  timeSpent: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  timestamps: true,
  tableName: 'user_progress',
  indexes: [
    { unique: true, fields: ['userId', 'lessonId'] }
  ]
});

// Badge Model
const Badge = sequelize.define('Badge', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true
  },
  image: {
    type: DataTypes.STRING,
    allowNull: false
  },
  requirement: {
    type: DataTypes.STRING,
    allowNull: false
  },
  requirementType: {
    type: DataTypes.ENUM('lessons_completed', 'xp_earned', 'streak_days', 'projects_completed'),
    allowNull: false
  },
  requirementValue: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM('beginner', 'intermediate', 'advanced', 'special'),
    defaultValue: 'beginner'
  },
  xpBonus: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  icon: {
    type: DataTypes.STRING,
    defaultValue: '🏆'
  }
}, {
  timestamps: true,
  tableName: 'badges'
});

// UserBadge Model
const UserBadge = sequelize.define('UserBadge', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  badgeId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'badges',
      key: 'id'
    }
  },
  earnedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: false,
  tableName: 'user_badges',
  indexes: [
    {
      unique: true,
      fields: ['userId', 'badgeId']
    }
  ]
});

// ============ ASSOCIATIONS ============

// User associations
User.hasMany(UserProgress, { foreignKey: 'userId', onDelete: 'CASCADE' });
UserProgress.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(UserBadge, { foreignKey: 'userId', onDelete: 'CASCADE' });
UserBadge.belongsTo(User, { foreignKey: 'userId' });

// Course associations
Course.hasMany(Lesson, { foreignKey: 'courseId', onDelete: 'CASCADE' });
Lesson.belongsTo(Course, { foreignKey: 'courseId' });

// Lesson associations
Lesson.hasMany(UserProgress, { foreignKey: 'lessonId', onDelete: 'CASCADE' });
UserProgress.belongsTo(Lesson, { foreignKey: 'lessonId' });

// Badge associations
Badge.hasMany(UserBadge, { foreignKey: 'badgeId', onDelete: 'CASCADE' });
UserBadge.belongsTo(Badge, { foreignKey: 'badgeId' });

// UserProgress additional associations
UserProgress.belongsTo(Course, { foreignKey: 'courseId' });

// ============ INSTANCE METHODS ============

User.prototype.calculateLevel = function() {
  const xp = this.totalXp || 0;
  if (xp < 100) return 1;
  if (xp < 300) return 2;
  if (xp < 600) return 3;
  return Math.floor(Math.sqrt(xp / 10)) + 1;
};

User.prototype.updateLevel = function() {
  this.level = this.calculateLevel();
  return this.level;
};

// ============ EXPORTS ============

export {
  sequelize,
  User,
  Course,
  Lesson,
  UserProgress,
  Badge,
  UserBadge
};