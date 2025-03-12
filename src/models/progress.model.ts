import mongoose, { Document, Schema } from 'mongoose';

export interface IProgress extends Document {
  userId: string;
  meditationId: string;
  duration: number; // actual duration in minutes
  completed: boolean;
  mood?: 'very-negative' | 'negative' | 'neutral' | 'positive' | 'very-positive';
  notes?: string;
  startTime: Date;
  endTime: Date;
  createdAt: Date;
  updatedAt: Date;
}

const progressSchema = new Schema<IProgress>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  meditationId: {
    type: Schema.Types.ObjectId,
    ref: 'Meditation',
    required: true
  },
  duration: {
    type: Number,
    required: true,
    min: 0
  },
  completed: {
    type: Boolean,
    default: true
  },
  mood: {
    type: String,
    enum: ['very-negative', 'negative', 'neutral', 'positive', 'very-positive']
  },
  notes: {
    type: String,
    trim: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// Add indexes for common queries
progressSchema.index({ userId: 1, createdAt: -1 });
progressSchema.index({ meditationId: 1 });
progressSchema.index({ startTime: 1 });

// Virtual for session length
progressSchema.virtual('sessionLength').get(function() {
  return (this.endTime.getTime() - this.startTime.getTime()) / (1000 * 60); // in minutes
});

// Static method to get user's total meditation time
progressSchema.statics.getTotalMeditationTime = async function(userId: string): Promise<number> {
  const result = await this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId), completed: true } },
    { $group: { _id: null, totalDuration: { $sum: '$duration' } } }
  ]);
  return result.length > 0 ? result[0].totalDuration : 0;
};

// Static method to get user's meditation streak
progressSchema.statics.getCurrentStreak = async function(userId: string): Promise<number> {
  const sessions = await this.find({ 
    userId,
    completed: true
  }).sort({ startTime: -1 });

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (const session of sessions) {
    const sessionDate = new Date(session.startTime);
    sessionDate.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === streak) {
      streak++;
      currentDate = sessionDate;
    } else {
      break;
    }
  }

  return streak;
};

export const Progress = mongoose.model<IProgress>('Progress', progressSchema); 