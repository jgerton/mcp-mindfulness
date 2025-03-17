import mongoose, { Schema, Document } from 'mongoose';
import { AchievementService, AchievementData } from '../services/achievement.service';
import { 
  IBaseWellnessSession, 
  WellnessMoodState, 
  WellnessSessionStatus,
  createWellnessSessionSchema 
} from './base-wellness-session.model';

/**
 * Interface representing a MeditationSession document in MongoDB
 */
export interface IMeditationSession extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  duration: number; // in seconds
  completed: boolean;
  startTime: Date;
  endTime?: Date;
  type: 'guided' | 'unguided' | 'timed';
  guidedMeditationId?: mongoose.Types.ObjectId;
  tags?: string[];
  mood?: {
    before?: 'very_negative' | 'negative' | 'neutral' | 'positive' | 'very_positive';
    after?: 'very_negative' | 'negative' | 'neutral' | 'positive' | 'very_positive';
  };
  moodBefore?: string;
  moodAfter?: string;
  durationCompleted?: number;
  status?: string;
  interruptions?: number;
  meditationId?: mongoose.Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  
  durationMinutes: number;
  completionPercentage: number;
  isStreakEligible: boolean;
  
  completeSession(endTime?: Date): Promise<IMeditationSession>;
  processAchievements(): Promise<void>;
}

/**
 * Schema for the MeditationSession model
 */
const MeditationSessionSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },
    title: {
      type: String,
      required: [true, 'Session title is required'],
      trim: true,
      maxlength: [100, 'Session title cannot be more than 100 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Session description cannot be more than 500 characters']
    },
    duration: {
      type: Number,
      required: [true, 'Session duration is required'],
      min: [1, 'Session duration must be at least 1 second']
    },
    completed: {
      type: Boolean,
      default: false
    },
    startTime: {
      type: Date,
      required: [true, 'Session start time is required']
    },
    endTime: {
      type: Date,
      validate: {
        validator: function(this: IMeditationSession, value: Date) {
          return !value || value > this.startTime;
        },
        message: 'End time must be after start time'
      }
    },
    type: {
      type: String,
      required: [true, 'Session type is required'],
      enum: {
        values: ['guided', 'unguided', 'timed'],
        message: 'Session type must be one of: guided, unguided, timed'
      }
    },
    guidedMeditationId: {
      type: Schema.Types.ObjectId,
      ref: 'GuidedMeditation',
      validate: {
        validator: function(this: IMeditationSession, value: mongoose.Types.ObjectId) {
          return this.type !== 'guided' || (this.type === 'guided' && value);
        },
        message: 'Guided meditation ID is required for guided sessions'
      }
    },
    tags: [{
      type: String,
      trim: true,
      maxlength: [30, 'Tag cannot be more than 30 characters']
    }],
    mood: {
      before: {
        type: String,
        enum: {
          values: ['very_negative', 'negative', 'neutral', 'positive', 'very_positive'],
          message: 'Mood must be one of: very_negative, negative, neutral, positive, very_positive'
        }
      },
      after: {
        type: String,
        enum: {
          values: ['very_negative', 'negative', 'neutral', 'positive', 'very_positive'],
          message: 'Mood must be one of: very_negative, negative, neutral, positive, very_positive'
        }
      }
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot be more than 1000 characters']
    }
  },
  {
    timestamps: true
  }
);

// Create indexes for better query performance
MeditationSessionSchema.index({ userId: 1, startTime: -1 });
MeditationSessionSchema.index({ userId: 1, completed: 1 });
MeditationSessionSchema.index({ tags: 1 });

// Virtual for calculating session duration in minutes
MeditationSessionSchema.virtual('durationMinutes').get(function(this: IMeditationSession) {
  return Math.round(this.duration / 60);
});

// Method to mark session as completed
MeditationSessionSchema.methods.completeSession = function(this: IMeditationSession, endTime: Date = new Date()) {
  this.completed = true;
  this.endTime = endTime;
  
  // Calculate actual duration if it differs from planned duration
  const actualDuration = Math.round((endTime.getTime() - this.startTime.getTime()) / 1000);
  if (actualDuration > 0) {
    this.duration = actualDuration;
  }
  
  return this.save();
};

// Add indexes
MeditationSessionSchema.index({ userId: 1 });
MeditationSessionSchema.index({ guidedMeditationId: 1 });

// Add meditation-specific methods
MeditationSessionSchema.methods.processAchievements = async function(this: IMeditationSession): Promise<void> {
  if (!this.completed) {
    return;
  }

  const achievementData: AchievementData = {
    userId: this.userId,
    sessionId: new mongoose.Types.ObjectId((this._id as mongoose.Types.ObjectId).toString()),
    meditationId: this.guidedMeditationId ? this.guidedMeditationId : new mongoose.Types.ObjectId(), // Provide a default ObjectId if undefined
    duration: this.duration,
    focusRating: this.mood?.after && this.mood?.before ? getMoodImprovement(this.mood.before as any, this.mood.after as any) : 0, // Cast to any to bypass type check
    interruptions: 0,
    streakMaintained: false,
    streakDay: 0,
    moodImprovement: this.mood?.after && this.mood?.before ? getMoodImprovement(this.mood.before as any, this.mood.after as any) : 0 // Cast to any to bypass type check
  };

  await AchievementService.processMeditationAchievements(achievementData);
};

// Add virtual fields
MeditationSessionSchema.virtual('completionPercentage').get(function(this: IMeditationSession) {
  return Math.round((this.duration / this.duration) * 100);
});

MeditationSessionSchema.virtual('isStreakEligible').get(function(this: IMeditationSession) {
  return this.completed;
});

// Add helper function for mood improvement calculation
function getMoodImprovement(before: WellnessMoodState, after: WellnessMoodState): number {
  const moodValues = {
    [WellnessMoodState.Stressed]: 1,
    [WellnessMoodState.Anxious]: 2,
    [WellnessMoodState.Neutral]: 3,
    [WellnessMoodState.Calm]: 4,
    [WellnessMoodState.Peaceful]: 5,
    [WellnessMoodState.Energized]: 5
  };

  return moodValues[after] - moodValues[before];
}

// Create the model
export const MeditationSession = mongoose.model<IMeditationSession>('MeditationSession', MeditationSessionSchema);

export default MeditationSession; 