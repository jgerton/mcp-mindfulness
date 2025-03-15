import mongoose, { Schema, Document } from 'mongoose';

export enum WellnessMoodState {
  Stressed = 'stressed',
  Anxious = 'anxious',
  Neutral = 'neutral',
  Calm = 'calm',
  Peaceful = 'peaceful',
  Energized = 'energized'
}

export enum WellnessSessionStatus {
  Active = 'active',
  Paused = 'paused',
  Completed = 'completed',
  Abandoned = 'abandoned'
}

export interface IBaseWellnessSession extends Document {
  userId: mongoose.Types.ObjectId;
  startTime: Date;
  endTime?: Date;
  duration: number; // in seconds
  status: WellnessSessionStatus;
  moodBefore?: WellnessMoodState;
  moodAfter?: WellnessMoodState;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  processAchievements(): Promise<void>;
  getActualDuration(): number;
  complete(moodAfter?: WellnessMoodState): Promise<void>;
  abandon(): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  canTransitionTo(newStatus: WellnessSessionStatus): boolean;
}

const baseFields = {
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    validate: {
      validator: function(this: IBaseWellnessSession, endTime: Date) {
        return !endTime || endTime > this.startTime;
      },
      message: 'End time must be after start time'
    }
  },
  duration: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: Object.values(WellnessSessionStatus),
    required: true,
    default: WellnessSessionStatus.Active
  },
  moodBefore: {
    type: String,
    enum: Object.values(WellnessMoodState)
  },
  moodAfter: {
    type: String,
    enum: Object.values(WellnessMoodState)
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  }
};

export const baseWellnessSessionSchema = new Schema(baseFields, {
  timestamps: true,
  discriminatorKey: 'sessionType'
});

// Add virtual fields
baseWellnessSessionSchema.virtual('isCompleted').get(function(this: IBaseWellnessSession) {
  return this.status === WellnessSessionStatus.Completed;
});

// Add instance methods
baseWellnessSessionSchema.methods.processAchievements = async function(this: IBaseWellnessSession) {
  throw new Error('Achievement processing must be implemented by session type');
};

baseWellnessSessionSchema.methods.getActualDuration = function(this: IBaseWellnessSession): number {
  if (!this.endTime) {
    return Math.floor((Date.now() - this.startTime.getTime()) / 1000);
  }
  return Math.floor((this.endTime.getTime() - this.startTime.getTime()) / 1000);
};

baseWellnessSessionSchema.methods.complete = async function(
  this: IBaseWellnessSession,
  moodAfter?: WellnessMoodState
): Promise<void> {
  if (!this.canTransitionTo(WellnessSessionStatus.Completed)) {
    throw new Error(`Cannot complete session in ${this.status} status`);
  }

  this.status = WellnessSessionStatus.Completed;
  this.endTime = new Date();
  if (moodAfter) {
    this.moodAfter = moodAfter;
  }
  await this.save();
};

baseWellnessSessionSchema.methods.abandon = async function(
  this: IBaseWellnessSession
): Promise<void> {
  if (!this.canTransitionTo(WellnessSessionStatus.Abandoned)) {
    throw new Error(`Cannot abandon session in ${this.status} status`);
  }

  this.status = WellnessSessionStatus.Abandoned;
  this.endTime = new Date();
  await this.save();
};

baseWellnessSessionSchema.methods.canTransitionTo = function(
  this: IBaseWellnessSession,
  newStatus: WellnessSessionStatus
): boolean {
  const currentStatus = this.status;
  
  // Define valid transitions
  const validTransitions: Record<WellnessSessionStatus, WellnessSessionStatus[]> = {
    [WellnessSessionStatus.Active]: [WellnessSessionStatus.Paused, WellnessSessionStatus.Completed, WellnessSessionStatus.Abandoned],
    [WellnessSessionStatus.Paused]: [WellnessSessionStatus.Active, WellnessSessionStatus.Abandoned],
    [WellnessSessionStatus.Completed]: [], // Terminal state
    [WellnessSessionStatus.Abandoned]: []  // Terminal state
  };

  return validTransitions[currentStatus]?.includes(newStatus) ?? false;
};

baseWellnessSessionSchema.methods.pause = async function(
  this: IBaseWellnessSession
): Promise<void> {
  if (!this.canTransitionTo(WellnessSessionStatus.Paused)) {
    throw new Error(`Cannot pause session in ${this.status} status`);
  }
  
  this.status = WellnessSessionStatus.Paused;
  await this.save();
};

baseWellnessSessionSchema.methods.resume = async function(
  this: IBaseWellnessSession
): Promise<void> {
  if (!this.canTransitionTo(WellnessSessionStatus.Active)) {
    throw new Error(`Cannot resume session in ${this.status} status`);
  }
  
  this.status = WellnessSessionStatus.Active;
  await this.save();
};

// Add middleware
baseWellnessSessionSchema.pre('validate', function(this: IBaseWellnessSession, next) {
  // If session is completed, ensure endTime is set
  if (this.status === WellnessSessionStatus.Completed && !this.endTime) {
    this.endTime = new Date();
  }
  next();
});

// Helper function to create extended schemas
export function createWellnessSessionSchema<T extends IBaseWellnessSession>(
  additionalFields: Record<string, any>
): Schema {
  return new Schema({
    ...baseFields,
    ...additionalFields
  }, {
    timestamps: true
  });
} 