import mongoose, { Schema } from 'mongoose';
import { AchievementService, AchievementData } from '../services/achievement.service';
import { 
  IBaseWellnessSession, 
  WellnessMoodState, 
  WellnessSessionStatus,
  createWellnessSessionSchema 
} from './base-wellness-session.model';

export interface IMeditationSession extends IBaseWellnessSession {
  meditationId: mongoose.Types.ObjectId;
  durationCompleted: number;
  interruptions: number;
  streakDay?: number;
  maintainedStreak?: boolean;
  focusRating?: number; // 1-5 rating of focus quality
  guidanceFollowed?: boolean; // whether user followed guided meditation
  completed?: boolean; // Added for backward compatibility
  completionPercentage?: number; // Added for backward compatibility
  isCompleted?: boolean; // Added for backward compatibility
  isStreakEligible?: boolean; // Whether the session qualifies for streak counting
}

// Define meditation-specific fields
const meditationFields = {
  meditationId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Meditation', 
    required: true
  },
  durationCompleted: { 
    type: Number,
    required: true,
    min: [0, 'Completed duration cannot be negative'],
    validate: {
      validator: function(this: IMeditationSession, value: number) {
        return value <= this.duration;
      },
      message: 'Completed duration cannot exceed planned duration'
    }
  },
  interruptions: { 
    type: Number, 
    required: true,
    default: 0,
    min: [0, 'Interruptions cannot be negative']
  },
  streakDay: {
    type: Number,
    min: [1, 'Streak day must be positive']
  },
  maintainedStreak: {
    type: Boolean,
    default: false
  },
  focusRating: {
    type: Number,
    min: [1, 'Focus rating must be between 1 and 5'],
    max: [5, 'Focus rating must be between 1 and 5']
  },
  guidanceFollowed: {
    type: Boolean
  },
  completed: {
    type: Boolean,
    default: false
  }
};

// Create schema using base wellness session
const meditationSessionSchema = createWellnessSessionSchema<IMeditationSession>(meditationFields);

// Add indexes
meditationSessionSchema.index({ userId: 1 });
meditationSessionSchema.index({ meditationId: 1 });

// Add meditation-specific methods
meditationSessionSchema.methods.processAchievements = async function(this: IMeditationSession): Promise<void> {
  if (!this.isCompleted && this.status !== WellnessSessionStatus.Completed) {
    return;
  }

  const achievementData: AchievementData = {
    userId: this.userId,
    sessionId: new mongoose.Types.ObjectId((this._id as mongoose.Types.ObjectId).toString()),
    meditationId: this.meditationId,
    duration: this.durationCompleted,
    focusRating: this.focusRating,
    interruptions: this.interruptions,
    streakMaintained: this.maintainedStreak,
    streakDay: this.streakDay,
    moodImprovement: this.moodAfter && this.moodBefore ? 
      getMoodImprovement(this.moodBefore, this.moodAfter) : undefined
  };

  await AchievementService.processMeditationAchievements(achievementData);
};

// Add virtual fields
meditationSessionSchema.virtual('completionPercentage').get(function(this: IMeditationSession) {
  return Math.round((this.durationCompleted / this.duration) * 100);
});

meditationSessionSchema.virtual('isStreakEligible').get(function(this: IMeditationSession) {
  const completionPercentage = Math.round((this.durationCompleted / this.duration) * 100);
  return (this.isCompleted || this.status === WellnessSessionStatus.Completed) && 
    completionPercentage >= 80 && // At least 80% completed
    (this.focusRating === undefined || this.focusRating >= 3); // Good focus if rated
});

// Add getter for isCompleted for backward compatibility
meditationSessionSchema.virtual('isCompleted').get(function(this: IMeditationSession) {
  return this.status === WellnessSessionStatus.Completed || this.completed === true;
});

// Override complete method to handle meditation-specific logic
meditationSessionSchema.methods.complete = async function(
  this: IMeditationSession,
  moodAfter?: WellnessMoodState,
  focusRating?: number
): Promise<void> {
  if (!this.canTransitionTo(WellnessSessionStatus.Completed)) {
    throw new Error(`Cannot complete session in ${this.status} status`);
  }

  this.status = WellnessSessionStatus.Completed;
  this.completed = true;
  this.endTime = new Date();
  this.durationCompleted = this.getActualDuration();
  
  if (moodAfter) {
    this.moodAfter = moodAfter;
  }
  if (focusRating !== undefined) {
    this.focusRating = focusRating;
  }

  await this.save();
  await this.processAchievements();
};

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

export const MeditationSession = mongoose.model<IMeditationSession>('MeditationSession', meditationSessionSchema); 