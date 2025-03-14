import mongoose, { Document, Schema } from 'mongoose';
import { AchievementService } from '../services/achievement.service';

export interface IMeditationSession extends Document {
  userId: mongoose.Types.ObjectId;
  meditationId: mongoose.Types.ObjectId;
  startTime: Date;
  endTime?: Date;
  duration: number;
  durationCompleted?: number;
  status: 'active' | 'completed' | 'cancelled';
  interruptions: number;
  completed: boolean;
  streakDay?: number;
  maintainedStreak?: boolean;
  moodBefore?: 'anxious' | 'stressed' | 'neutral' | 'calm' | 'peaceful';
  moodAfter?: 'anxious' | 'stressed' | 'neutral' | 'calm' | 'peaceful';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const meditationSessionSchema = new Schema<IMeditationSession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    meditationId: { type: Schema.Types.ObjectId, ref: 'Meditation', required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    duration: { type: Number, required: true },
    durationCompleted: { type: Number },
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      required: true
    },
    interruptions: { type: Number, required: true },
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
      enum: ['anxious', 'stressed', 'neutral', 'calm', 'peaceful']
    },
    moodAfter: {
      type: String,
      enum: ['anxious', 'stressed', 'neutral', 'calm', 'peaceful']
    },
    notes: {
      type: String
    }
  },
  { timestamps: true }
);

// Post-save hook to process achievements
meditationSessionSchema.post('save', async function(doc) {
  if (doc.completed) {
    await AchievementService.processSession(doc.toObject());
  }
});

export const MeditationSession = mongoose.model<IMeditationSession>('MeditationSession', meditationSessionSchema); 