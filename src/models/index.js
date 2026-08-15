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

// Comment Model
const Comment = sequelize.define('Comment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  lessonId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'lessons',
      key: 'id'
    }
  },
  parentId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'comments',
      key: 'id'
    }
  },
  likes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isEdited: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: true,
  tableName: 'comments'
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

// Discussion Topic Model
const DiscussionTopic = sequelize.define('DiscussionTopic', {
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
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  category: {
    type: DataTypes.ENUM('general', 'help', 'projects', 'career', 'announcements'),
    defaultValue: 'general'
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isPinned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isLocked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: true,
  tableName: 'discussion_topics'
});

// Discussion Reply Model
const DiscussionReply = sequelize.define('DiscussionReply', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  topicId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'discussion_topics',
      key: 'id'
    }
  },
  likes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isBestAnswer: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: true,
  tableName: 'discussion_replies'
});

// Follow Model
const Follow = sequelize.define('Follow', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  followerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  followingId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  timestamps: true,
  tableName: 'follows',
  indexes: [
    {
      unique: true,
      fields: ['followerId', 'followingId']
    }
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

// Activity Feed Model
const Activity = sequelize.define('Activity', {
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
  type: {
    type: DataTypes.ENUM(
      'completed_lesson',
      'earned_badge',
      'level_up',
      'posted_comment',
      'created_topic',
      'replied_topic',
      'liked_comment',
      'followed_user'
    ),
    allowNull: false
  },
  targetId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  targetType: {
    type: DataTypes.STRING,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  timestamps: true,
  tableName: 'activities'
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

// Comment associations
Comment.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Comment, { foreignKey: 'userId' });

Comment.belongsTo(Lesson, { foreignKey: 'lessonId' });
Lesson.hasMany(Comment, { foreignKey: 'lessonId' });

Comment.belongsTo(Comment, { as: 'Parent', foreignKey: 'parentId' });
Comment.hasMany(Comment, { as: 'Replies', foreignKey: 'parentId' });

// Discussion associations
DiscussionTopic.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(DiscussionTopic, { foreignKey: 'userId' });

DiscussionTopic.hasMany(DiscussionReply, { foreignKey: 'topicId' });
DiscussionReply.belongsTo(DiscussionTopic, { foreignKey: 'topicId' });

DiscussionReply.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(DiscussionReply, { foreignKey: 'userId' });

// Follow associations
Follow.belongsTo(User, { as: 'Follower', foreignKey: 'followerId' });
Follow.belongsTo(User, { as: 'Following', foreignKey: 'followingId' });

// Activity associations
Activity.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Activity, { foreignKey: 'userId' });

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
  UserBadge,
};