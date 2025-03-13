import mongoose from 'mongoose';
import { AchievementService } from '../services/achievement.service';

export interface IMeditationSession {
  _id?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  meditationId: mongoose.Types.ObjectId;
  startTime: Date;
  endTime?: Date;
  durationCompleted: number;
  completed: boolean;
  streakDay?: number;
  maintainedStreak?: boolean;
  moodBefore?: 'very_bad' | 'bad' | 'neutral' | 'good' | 'very_good';
  moodAfter?: 'very_bad' | 'bad' | 'neutral' | 'good' | 'very_good';
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const meditationSessionSchema = new mongoose.Schema<IMeditationSession>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  meditationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meditation',
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date
  },
  durationCompleted: {
    type: Number,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  streakDay: {
    type: Number
  },
  maintainedStreak: {
    type: Boolean,
    default: false
  },
  moodBefore: {
    type: String,
    enum: ['very_bad', 'bad', 'neutral', 'good', 'very_good']
  },
  moodAfter: {
    type: String,
    enum: ['very_bad', 'bad', 'neutral', 'good', 'very_good']
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Post-save hook to process achievements
meditationSessionSchema.post('save', async function(doc) {
  if (doc.completed) {
    await AchievementService.processSession(doc.toObject());
  }
});

export const MeditationSession = mongoose.model<IMeditationSession>('MeditationSession', meditationSessionSchema); 