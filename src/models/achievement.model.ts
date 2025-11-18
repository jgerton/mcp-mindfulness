import mongoose, { Schema, Document } from 'mongoose';

/**
 * Achievement categories
 */
export enum AchievementCategory {
  MEDITATION = 'meditation',
  STREAK = 'streak',
  SOCIAL = 'social',
  MILESTONE = 'milestone',
  CHALLENGE = 'challenge',
  WELLNESS = 'wellness',
  JOURNAL = 'journal',
  TIME = 'time',
  DURATION = 'duration',
  SPECIAL = 'special'
}

/**
 * Achievement types
 */
export enum AchievementType {
  TOTAL_SESSIONS = 'total_sessions',
  TOTAL_TIME = 'total_time',
  LONGEST_SESSION = 'longest_session',
  LONGEST_STREAK = 'longest_streak',
  CURRENT_STREAK = 'current_streak',
  COMPLETED_CHALLENGES = 'completed_challenges',
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  STREAK = 'streak'
}

/**
 * Interface representing an Achievement document in MongoDB
 */
export interface IAchievement extends Document {
  name: string;
  description: string;
  category: string | AchievementCategory;
  criteria: {
    type: string;
    value: any;
  };
  icon: string;
  points: number;
  // Add missing properties used in achievement service
  progress?: number;
  target?: number;
  completed?: boolean;
  completedAt?: Date;
  type?: string | AchievementType;
  userId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create an extended interface for Mongoose documents with achievement properties
 */
export interface IAchievementDocument extends mongoose.Document, IAchievement {
  progress: number;
  target: number;
  completed: boolean;
  completedAt?: Date;
  type: string | AchievementType;
  userId: mongoose.Types.ObjectId;
}

/**
 * Schema for the Achievement model
 */
const AchievementSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Achievement name is required'],
      trim: true,
      maxlength: [100, 'Achievement name cannot be more than 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Achievement description is required'],
      trim: true,
      maxlength: [500, 'Achievement description cannot be more than 500 characters']
    },
    category: {
      type: String,
      required: [true, 'Achievement category is required'],
      enum: {
        values: ['time', 'duration', 'streak', 'milestone', 'special'],
        message: 'Achievement category must be one of: time, duration, streak, milestone, special'
      }
    },
    criteria: {
      type: {
        type: String,
        required: [true, 'Criteria type is required']
      },
      value: {
        type: Schema.Types.Mixed,
        required: [true, 'Criteria value is required']
      }
    },
    icon: {
      type: String,
      required: [true, 'Achievement icon is required'],
      trim: true
    },
    points: {
      type: Number,
      required: [true, 'Achievement points are required'],
      min: [0, 'Achievement points cannot be negative']
    },
    // Add fields used by the achievement service
    type: {
      type: String,
      index: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    progress: {
      type: Number,
      default: 0
    },
    target: {
      type: Number,
      default: 0
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

/**
 * Interface representing a UserAchievement document in MongoDB
 */
export interface IUserAchievement extends Document {
  userId: mongoose.Types.ObjectId;
  achievementId: mongoose.Types.ObjectId;
  progress: number;
  isCompleted: boolean;
  dateEarned?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Schema for the UserAchievement model
 */
const UserAchievementSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },
    achievementId: {
      type: Schema.Types.ObjectId,
      ref: 'Achievement',
      required: [true, 'Achievement ID is required']
    },
    progress: {
      type: Number,
      required: [true, 'Achievement progress is required'],
      min: [0, 'Achievement progress cannot be negative'],
      max: [100, 'Achievement progress cannot exceed 100']
    },
    isCompleted: {
      type: Boolean,
      default: false
    },
    dateEarned: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Create indexes for better query performance
UserAchievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true });
UserAchievementSchema.index({ userId: 1, isCompleted: 1 });

// Create the models
export const Achievement = mongoose.model<IAchievement>('Achievement', AchievementSchema);
export const UserAchievement = mongoose.model<IUserAchievement>('UserAchievement', UserAchievementSchema);

export default {
  Achievement,
  UserAchievement
}; 