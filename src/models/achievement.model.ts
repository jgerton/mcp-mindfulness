import mongoose from 'mongoose';

export interface IAchievement {
  _id?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId | string;
  type: string;
  title: string;
  description: string;
  points: number;
  progress: number;
  target: number;
  completed: boolean;
  completedAt?: Date;
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
  target: {
    type: Number,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
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
  emotional_growth: { maxProgress: 20, points: 300 },
  social_butterfly: { maxProgress: 10, points: 200 },
  group_guide: { maxProgress: 5, points: 300 },
  community_pillar: { maxProgress: 20, points: 400 },
  synchronized_souls: { maxProgress: 3, points: 250 },
  meditation_circle: { maxProgress: 1, points: 150 },
  friend_zen: { maxProgress: 5, points: 200 },
  group_streak: { maxProgress: 7, points: 350 },
  mindful_mentor: { maxProgress: 10, points: 400 },
  harmony_seeker: { maxProgress: 15, points: 300 },
  zen_network: { maxProgress: 30, points: 500 }
}; 