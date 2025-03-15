import mongoose, { Schema, Document } from 'mongoose';

export interface IUserPoints extends Document {
  userId: mongoose.Types.ObjectId;
  total: number;
  achievements: number;
  streaks: number;
  recent: number;
  history: {
    date: Date;
    points: number;
    source: string;
    description: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
  
  // Aliases for backward compatibility
  totalPoints: number;
  achievementPoints: number;
  streakPoints: number;
  recentPoints: number;
  pointsHistory: {
    date: Date;
    points: number;
    source: string;
    description: string;
  }[];
  
  // Methods
  addPoints(points: number, source: string, description: string): Promise<void>;
}

const userPointsSchema = new Schema<IUserPoints>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    total: {
      type: Number,
      default: 0,
      min: 0
    },
    achievements: {
      type: Number,
      default: 0,
      min: 0
    },
    streaks: {
      type: Number,
      default: 0,
      min: 0
    },
    recent: {
      type: Number,
      default: 0,
      min: 0
    },
    history: [
      {
        date: {
          type: Date,
          default: Date.now
        },
        points: {
          type: Number,
          required: true
        },
        source: {
          type: String,
          required: true,
          enum: ['achievement', 'streak', 'session', 'challenge', 'other']
        },
        description: {
          type: String,
          required: true
        }
      }
    ]
  },
  { timestamps: true }
);

// Create virtual properties for backward compatibility
userPointsSchema.virtual('totalPoints').get(function(this: IUserPoints) {
  return this.total;
});

userPointsSchema.virtual('achievementPoints').get(function(this: IUserPoints) {
  return this.achievements;
});

userPointsSchema.virtual('streakPoints').get(function(this: IUserPoints) {
  return this.streaks;
});

userPointsSchema.virtual('recentPoints').get(function(this: IUserPoints) {
  return this.recent;
});

userPointsSchema.virtual('pointsHistory').get(function(this: IUserPoints) {
  return this.history;
});

// Add methods
userPointsSchema.methods.addPoints = async function(
  this: IUserPoints,
  points: number,
  source: string,
  description: string
): Promise<void> {
  // Update the appropriate category
  if (source === 'achievement') {
    this.achievements += points;
  } else if (source === 'streak') {
    this.streaks += points;
  } else {
    // Other sources go to recent
    this.recent += points;
  }
  
  // Update total
  this.total += points;
  
  // Add to history
  this.history.push({
    date: new Date(),
    points,
    source,
    description
  });
  
  // Save the changes
  await this.save();
};

// Create indexes for efficient querying
userPointsSchema.index({ userId: 1 });
userPointsSchema.index({ total: -1 });
userPointsSchema.index({ 'history.date': -1 });

export const UserPoints = mongoose.model<IUserPoints>('UserPoints', userPointsSchema); 