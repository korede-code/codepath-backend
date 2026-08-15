import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

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

// ============ EXISTING MODELS ============

// User Model
const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
  username: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: true },
  googleId: { type: DataTypes.STRING, allowNull: true, unique: true },
  isAdmin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  avatar: { type: DataTypes.STRING, defaultValue: 'default-avatar.png' },
  bio: { type: DataTypes.TEXT, allowNull: true, defaultValue: '' },
  level: { type: DataTypes.INTEGER, defaultValue: 1 },
  totalXp: { type: DataTypes.INTEGER, defaultValue: 0 },
  rank: { type: DataTypes.INTEGER, defaultValue: 0 },
  streak: { type: DataTypes.INTEGER, defaultValue: 0 },
  lastActivity: { type: DataTypes.DATE, allowNull: true }
}, { timestamps: true, tableName: 'users' });

// Course Model
const Course = sequelize.define('Course', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  pathId: { type: DataTypes.STRING, allowNull: false, unique: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: DataTypes.TEXT,
  icon: DataTypes.STRING,
  category: DataTypes.STRING,
  difficulty: { type: DataTypes.ENUM('Beginner', 'Intermediate', 'Advanced'), defaultValue: 'Beginner' },
  totalLessons: { type: DataTypes.INTEGER, defaultValue: 0 },
  totalXp: { type: DataTypes.INTEGER, defaultValue: 0 },
  isLocked: { type: DataTypes.BOOLEAN, defaultValue: false },
  order: DataTypes.INTEGER
}, { timestamps: true, tableName: 'courses' });

// Lesson Model
const Lesson = sequelize.define('Lesson', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
  xpValue: { type: DataTypes.INTEGER, defaultValue: 10 },
  order: { type: DataTypes.INTEGER, allowNull: false },
  type: { type: DataTypes.ENUM('lesson', 'project', 'quiz'), defaultValue: 'lesson' },
  codeExample: DataTypes.TEXT,
  solution: DataTypes.TEXT,
  isLocked: { type: DataTypes.BOOLEAN, defaultValue: false }
}, { timestamps: true, tableName: 'lessons' });

// UserProgress Model
const UserProgress = sequelize.define('UserProgress', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  lessonId: { type: DataTypes.UUID, allowNull: false },
  courseId: { type: DataTypes.UUID, allowNull: false },
  completed: { type: DataTypes.BOOLEAN, defaultValue: false },
  completedAt: DataTypes.DATE,
  xpEarned: DataTypes.INTEGER,
  attempts: { type: DataTypes.INTEGER, defaultValue: 0 },
  timeSpent: { type: DataTypes.INTEGER, defaultValue: 0 }
}, { timestamps: true, tableName: 'user_progress' });

// Badge Model
const Badge = sequelize.define('Badge', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: DataTypes.STRING,
  image: { type: DataTypes.STRING, allowNull: false },
  requirement: { type: DataTypes.STRING, allowNull: false },
  requirementType: { type: DataTypes.ENUM('lessons_completed', 'xp_earned', 'streak_days', 'projects_completed'), allowNull: false },
  requirementValue: { type: DataTypes.INTEGER, allowNull: false },
  category: { type: DataTypes.ENUM('beginner', 'intermediate', 'advanced', 'special'), defaultValue: 'beginner' },
  xpBonus: { type: DataTypes.INTEGER, defaultValue: 0 },
  icon: { type: DataTypes.STRING, defaultValue: '🏆' }
}, { timestamps: true, tableName: 'badges' });

// UserBadge Model
const UserBadge = sequelize.define('UserBadge', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  badgeId: { type: DataTypes.UUID, allowNull: false },
  earnedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { timestamps: false, tableName: 'user_badges' });

// ============ COMMUNITY MODELS ============

// Comment Model
const Comment = sequelize.define('Comment', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  content: { type: DataTypes.TEXT, allowNull: false },
  userId: { type: DataTypes.UUID, allowNull: false },
  lessonId: { type: DataTypes.UUID, allowNull: true },
  parentId: { type: DataTypes.UUID, allowNull: true },
  likes: { type: DataTypes.INTEGER, defaultValue: 0 },
  isEdited: { type: DataTypes.BOOLEAN, defaultValue: false }
}, { timestamps: true, tableName: 'comments' });

// DiscussionTopic Model
const DiscussionTopic = sequelize.define('DiscussionTopic', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
  userId: { type: DataTypes.UUID, allowNull: false },
  category: { type: DataTypes.ENUM('general', 'help', 'projects', 'career', 'announcements'), defaultValue: 'general' },
  views: { type: DataTypes.INTEGER, defaultValue: 0 },
  isPinned: { type: DataTypes.BOOLEAN, defaultValue: false },
  isLocked: { type: DataTypes.BOOLEAN, defaultValue: false }
}, { timestamps: true, tableName: 'discussion_topics' });

// DiscussionReply Model
const DiscussionReply = sequelize.define('DiscussionReply', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  content: { type: DataTypes.TEXT, allowNull: false },
  userId: { type: DataTypes.UUID, allowNull: false },
  topicId: { type: DataTypes.UUID, allowNull: false },
  likes: { type: DataTypes.INTEGER, defaultValue: 0 },
  isBestAnswer: { type: DataTypes.BOOLEAN, defaultValue: false }
}, { timestamps: true, tableName: 'discussion_replies' });

// Follow Model
const Follow = sequelize.define('Follow', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  followerId: { type: DataTypes.UUID, allowNull: false },
  followingId: { type: DataTypes.UUID, allowNull: false }
}, { timestamps: true, tableName: 'follows' });

// Activity Model - ADD THIS
const Activity = sequelize.define('Activity', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
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
  targetId: { type: DataTypes.UUID, allowNull: true },
  targetType: { type: DataTypes.STRING, allowNull: true },
  metadata: { type: DataTypes.JSONB, defaultValue: {} }
}, { timestamps: true, tableName: 'activities' });

// Daily Challenge Model
const DailyChallenge = sequelize.define('DailyChallenge', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('complete_lesson', 'earn_xp', 'maintain_streak', 'complete_project', 'post_comment'),
    allowNull: false
  },
  requirement: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  xpReward: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  bonusXpReward: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  dayOfWeek: {
    type: DataTypes.INTEGER,
    allowNull: true // 0-6 for specific days, null for any day
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  startsAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  endsAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'daily_challenges'
});

// User Challenge Progress Model
const UserChallengeProgress = sequelize.define('UserChallengeProgress', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  challengeId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  progress: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isCompleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  claimedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'user_challenge_progress',
  indexes: [
    {
      unique: true,
      fields: ['userId', 'challengeId']
    }
  ]
});

// Quest Model
const Quest = sequelize.define('Quest', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('learning_path', 'streak', 'projects', 'community', 'special'),
    allowNull: false
  },
  steps: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  totalXpReward: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  badgeReward: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  timestamps: true,
  tableName: 'quests'
});

// User Quest Progress Model
const UserQuestProgress = sequelize.define('UserQuestProgress', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  questId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  stepProgress: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  isCompleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'user_quest_progress'
});

// XP Multiplier Model
const XPMultiplier = sequelize.define('XPMultiplier', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  multiplier: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  startsAt: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endsAt: {
    type: DataTypes.DATE,
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true,
  tableName: 'xp_multipliers'
});

// Streak Bonus Model
const StreakBonus = sequelize.define('StreakBonus', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  streakDays: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  bonusXp: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  badgeReward: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'streak_bonuses'
});

// ============ ASSOCIATIONS ============

// Existing associations
User.hasMany(UserProgress, { foreignKey: 'userId', onDelete: 'CASCADE' });
UserProgress.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(UserBadge, { foreignKey: 'userId', onDelete: 'CASCADE' });
UserBadge.belongsTo(User, { foreignKey: 'userId' });

Course.hasMany(Lesson, { foreignKey: 'courseId', onDelete: 'CASCADE' });
Lesson.belongsTo(Course, { foreignKey: 'courseId' });

Lesson.hasMany(UserProgress, { foreignKey: 'lessonId', onDelete: 'CASCADE' });
UserProgress.belongsTo(Lesson, { foreignKey: 'lessonId' });

Badge.hasMany(UserBadge, { foreignKey: 'badgeId', onDelete: 'CASCADE' });
UserBadge.belongsTo(Badge, { foreignKey: 'badgeId' });

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

// Daily Challenge associations
DailyChallenge.hasMany(UserChallengeProgress, { foreignKey: 'challengeId' });
UserChallengeProgress.belongsTo(DailyChallenge, { foreignKey: 'challengeId' });

User.hasMany(UserChallengeProgress, { foreignKey: 'userId' });
UserChallengeProgress.belongsTo(User, { foreignKey: 'userId' });

// Quest associations
Quest.hasMany(UserQuestProgress, { foreignKey: 'questId' });
UserQuestProgress.belongsTo(Quest, { foreignKey: 'questId' });

User.hasMany(UserQuestProgress, { foreignKey: 'userId' });
UserQuestProgress.belongsTo(User, { foreignKey: 'userId' });

// ============ EXPORTS ============

export {
  sequelize,
  User,
  Course,
  Lesson,
  UserProgress,
  Badge,
  UserBadge,
  Comment,
  DiscussionTopic,
  DiscussionReply,
  Follow,
  Activity
};