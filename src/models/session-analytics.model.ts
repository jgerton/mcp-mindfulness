import mongoose, { Document, Schema } from 'mongoose';

export type MoodType = 'anxious' | 'stressed' | 'neutral' | 'calm' | 'peaceful';

export interface ISessionAnalytics extends Document {
  userId: mongoose.Types.ObjectId;
  sessionId: mongoose.Types.ObjectId;
  meditationId: mongoose.Types.ObjectId;
  startTime: Date;
  endTime: Date | null;
  duration: number;
  durationCompleted: number;
  completed: boolean;
  focusScore?: number;
  moodBefore: MoodType;
  moodAfter?: MoodType;
  interruptions: number;
  notes?: string;
  tags?: string[];
  maintainedStreak: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const sessionAnalyticsSchema = new Schema<ISessionAnalytics>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sessionId: { type: Schema.Types.ObjectId, ref: 'MeditationSession', required: true },
    meditationId: { type: Schema.Types.ObjectId, ref: 'Meditation', required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, default: null },
    duration: { type: Number, required: true },
    durationCompleted: { type: Number, required: true },
    completed: { type: Boolean, required: true },
    focusScore: { type: Number },
    moodBefore: {
      type: String,
      enum: ['anxious', 'stressed', 'neutral', 'calm', 'peaceful'],
      required: true
    },
    moodAfter: {
      type: String,
      enum: ['anxious', 'stressed', 'neutral', 'calm', 'peaceful']
    },
    interruptions: { type: Number, required: true },
    notes: { type: String },
    tags: [{ type: String }],
    maintainedStreak: { type: Boolean, required: true }
  },
  { timestamps: true }
);

// Create compound indexes for efficient querying
sessionAnalyticsSchema.index({ userId: 1, startTime: -1 });
sessionAnalyticsSchema.index({ userId: 1, completed: 1 });

export const SessionAnalytics = mongoose.model<ISessionAnalytics>('SessionAnalytics', sessionAnalyticsSchema); 