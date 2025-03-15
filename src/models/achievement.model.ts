import mongoose, { Schema, Document } from 'mongoose';

export enum AchievementType {
  EARLY_BIRD = 'early_bird',
  NIGHT_OWL = 'night_owl',
  CONSISTENCY_MASTER = 'consistency_master',
  MARATHON_MEDITATOR = 'marathon_meditator',
  QUICK_ZEN = 'quick_zen',
  BALANCED_PRACTICE = 'balanced_practice',
  WEEK_WARRIOR = 'week_warrior',
  MONTHLY_MASTER = 'monthly_master',
  ZEN_MASTER = 'zen_master',
  MOOD_LIFTER = 'mood_lifter',
  ZEN_STATE = 'zen_state',
  EMOTIONAL_GROWTH = 'emotional_growth',
  SOCIAL_BUTTERFLY = 'social_butterfly',
  GROUP_GUIDE = 'group_guide',
  COMMUNITY_PILLAR = 'community_pillar',
  SYNCHRONIZED_SOULS = 'synchronized_souls',
  MEDITATION_CIRCLE = 'meditation_circle',
  FRIEND_ZEN = 'friend_zen',
  GROUP_STREAK = 'group_streak',
  MINDFUL_MENTOR = 'mindful_mentor',
  HARMONY_SEEKER = 'harmony_seeker',
  ZEN_NETWORK = 'zen_network',
  // Additional types used in tests
  BEGINNER_MEDITATOR = 'beginner_meditator',
  INTERMEDIATE_MEDITATOR = 'intermediate_meditator',
  ADVANCED_MEDITATOR = 'advanced_meditator',
  MINDFUL_MONTH = 'mindful_month'
}

export interface IAchievement extends Document {
  userId: mongoose.Types.ObjectId;
  type: string;
  title: string;
  description: string;
  points: number;
  progress: number;
  target: number;
  completed: boolean;
  completedAt?: Date;
}

const achievementSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
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
    required: true,
    min: 0
  },
  progress: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  target: {
    type: Number,
    required: true,
    min: 1
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

// Create compound index for efficient querying
achievementSchema.index({ userId: 1, type: 1 }, { unique: true });

// Add virtual for progress percentage
achievementSchema.virtual('progressPercentage').get(function(this: IAchievement) {
  return Math.round((this.progress / this.target) * 100);
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