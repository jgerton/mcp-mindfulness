import mongoose from 'mongoose';

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
    required: true
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
  }
}, {
  timestamps: true
});

// Index for querying user's sessions and recent sessions
meditationSessionSchema.index({ userId: 1, startTime: -1 });
// Index for querying sessions by meditation
meditationSessionSchema.index({ meditationId: 1 });

export const MeditationSession = mongoose.model('MeditationSession', meditationSessionSchema); 