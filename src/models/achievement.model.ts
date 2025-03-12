import mongoose from 'mongoose';

export interface IAchievement {
  _id?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId | string;
  type: string;
  title: string;
  description: string;
  points: number;
  progress: number;
  completed: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const achievementSchema = new mongoose.Schema<IAchievement>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  points: {
    type: Number,
    required: true
  },
  progress: {
    type: Number,
    default: 0
  },
  completed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export const Achievement = mongoose.model<IAchievement>('Achievement', achievementSchema);

// Achievement configurations
export const ACHIEVEMENT_CONFIGS: Record<string, { maxProgress: number, points: number }> = {
  early_bird: { maxProgress: 5, points: 100 },
  night_owl: { maxProgress: 5, points: 100 },
  consistency_master: { maxProgress: 7, points: 150 },
  marathon_meditator: { maxProgress: 1, points: 200 },
  quick_zen: { maxProgress: 10, points: 100 },
  balanced_practice: { maxProgress: 3, points: 150 },
  week_warrior: { maxProgress: 7, points: 200 },
  monthly_master: { maxProgress: 30, points: 500 },
  zen_master: { maxProgress: 100, points: 1000 },
  mood_lifter: { maxProgress: 10, points: 150 },
  zen_state: { maxProgress: 5, points: 200 },
  emotional_growth: { maxProgress: 20, points: 300 }
}; 