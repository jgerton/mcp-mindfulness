import mongoose from 'mongoose';

export type MoodType = 'very_bad' | 'bad' | 'neutral' | 'good' | 'very_good';

const meditationSessionSchema = new mongoose.Schema({
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
    required: true,
    default: Date.now
  },
  durationCompleted: {
    type: Number, // in minutes
    required: true,
    min: 0
  },
  completed: {
    type: Boolean,
    required: true,
    default: false
  },
  notes: {
    type: String,
    trim: true
  },
  moodBefore: {
    type: String,
    enum: ['very_bad', 'bad', 'neutral', 'good', 'very_good']
  },
  moodAfter: {
    type: String,
    enum: ['very_bad', 'bad', 'neutral', 'good', 'very_good']
  },
  streakDay: {
    type: Number,
    default: 1
  },
  maintainedStreak: {
    type: Boolean,
    default: true
  },
  streakMilestone: {
    type: String,
    enum: ['none', 'first_day', 'week', 'month', 'hundred_days'],
    default: 'none'
  }
}, {
  timestamps: true
});

// Index for querying user's sessions and recent sessions
meditationSessionSchema.index({ userId: 1, startTime: -1 });
// Index for querying sessions by meditation
meditationSessionSchema.index({ meditationId: 1 });

// Middleware to handle streak calculations
meditationSessionSchema.pre('save', async function(next) {
  if (!this.completed) {
    return next();
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Find last completed session
    const lastSession = await this.constructor.findOne({
      userId: this.userId,
      completed: true,
      startTime: { $lt: today }
    }).sort({ startTime: -1 });

    if (!lastSession) {
      // First ever session
      this.streakDay = 1;
      this.streakMilestone = 'first_day';
      this.maintainedStreak = true;
    } else {
      const lastSessionDate = new Date(lastSession.startTime);
      lastSessionDate.setHours(0, 0, 0, 0);

      if (lastSessionDate.getTime() === yesterday.getTime()) {
        // Continued streak
        this.streakDay = lastSession.streakDay + 1;
        this.maintainedStreak = true;

        // Set milestone if applicable
        if (this.streakDay === 7) {
          this.streakMilestone = 'week';
        } else if (this.streakDay === 30) {
          this.streakMilestone = 'month';
        } else if (this.streakDay === 100) {
          this.streakMilestone = 'hundred_days';
        } else {
          this.streakMilestone = 'none';
        }
      } else if (lastSessionDate.getTime() < yesterday.getTime()) {
        // Streak broken
        this.streakDay = 1;
        this.maintainedStreak = false;
        this.streakMilestone = 'first_day';
      } else {
        // Same day session, maintain previous streak info
        this.streakDay = lastSession.streakDay;
        this.maintainedStreak = lastSession.maintainedStreak;
        this.streakMilestone = lastSession.streakMilestone;
      }
    }

    next();
  } catch (error) {
    next(error as Error);
  }
});

export const MeditationSession = mongoose.model('MeditationSession', meditationSessionSchema); 