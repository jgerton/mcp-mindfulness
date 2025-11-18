import mongoose, { Schema, Document } from 'mongoose';
import { AchievementService, AchievementData } from '../services/achievement.service';
import { 
  IBaseWellnessSession, 
  WellnessMoodState, 
  WellnessSessionStatus,
  baseWellnessSessionSchema 
} from './base-wellness-session.model';

/**
 * Interface representing a MeditationSession document in MongoDB
 */
export interface IMeditationSession extends IBaseWellnessSession {
  title: string;
  description?: string;
  type: 'guided' | 'unguided' | 'timed';
  guidedMeditationId?: mongoose.Types.ObjectId;
  tags?: string[];
  durationCompleted?: number;
  interruptions?: number;
  meditationId?: mongoose.Types.ObjectId;
  completed?: boolean;
  notes?: string;
  
  durationMinutes: number;
  completionPercentage: number;
  isStreakEligible: boolean;
  
  completeSession(endTime?: Date): Promise<IMeditationSession>;
  processAchievements(): Promise<void>;
}

/**
 * Schema for the MeditationSession model
 */
const MeditationSessionSchema = new Schema(
  {
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
    completed: {
      type: Boolean,
      default: false
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
    meditationId: {
      type: Schema.Types.ObjectId,
      ref: 'Meditation'
    },
    tags: [{
      type: String,
      trim: true,
      maxlength: [30, 'Tag cannot be more than 30 characters']
    }],
    durationCompleted: {
      type: Number,
      default: 0
    },
    interruptions: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
    discriminatorKey: 'sessionType',
  }
);

// Create the model using the base schema
const BaseWellnessSession = mongoose.model('BaseWellnessSession', baseWellnessSessionSchema);
export const MeditationSession = BaseWellnessSession.discriminator<IMeditationSession>(
  'MeditationSession', 
  MeditationSessionSchema
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
  this.status = WellnessSessionStatus.Completed;
  
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
    sessionId: new mongoose.Types.ObjectId((this._id as any).toString()),
    meditationId: this.meditationId || this.guidedMeditationId || new mongoose.Types.ObjectId(),
    duration: this.duration,
    focusRating: this.moodAfter && this.moodBefore ? getMoodImprovement(this.moodBefore as any, this.moodAfter as any) : 0,
    interruptions: this.interruptions || 0,
    streakMaintained: false,
    streakDay: 0,
    moodImprovement: this.moodAfter && this.moodBefore ? getMoodImprovement(this.moodBefore as any, this.moodAfter as any) : 0
  };

  await AchievementService.processMeditationAchievements(achievementData);
};

// Add virtual fields
MeditationSessionSchema.virtual('completionPercentage').get(function(this: IMeditationSession) {
  if (!this.duration) return 0;
  return Math.round((this.durationCompleted || 0) / this.duration * 100);
});

MeditationSessionSchema.virtual('isStreakEligible').get(function(this: IMeditationSession) {
  return this.status === WellnessSessionStatus.Completed;
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

export default MeditationSession; 