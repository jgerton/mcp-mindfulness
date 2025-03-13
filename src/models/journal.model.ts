import mongoose, { Document, Schema } from 'mongoose';

export interface IJournal extends Document {
  userId: string;
  title: string;
  content: string;
  mood: 'very-negative' | 'negative' | 'neutral' | 'positive' | 'very-positive';
  tags: string[];
  meditationId?: string; // optional reference to a meditation session
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const journalSchema = new Schema<IJournal>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  mood: {
    type: String,
    required: true,
    enum: ['very-negative', 'negative', 'neutral', 'positive', 'very-positive']
  },
  tags: [{
    type: String,
    trim: true
  }],
  meditationId: {
    type: Schema.Types.ObjectId,
    ref: 'Meditation'
  },
  isPrivate: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Add text index for search functionality
journalSchema.index({ title: 'text', content: 'text' });

// Add compound index for user's journals by date
journalSchema.index({ userId: 1, createdAt: -1 });

// Add index for meditation reference
journalSchema.index({ meditationId: 1 });

// Static method to get journal entries by mood
journalSchema.statics.getEntriesByMood = async function(userId: string, mood: string) {
  return this.find({ userId, mood })
    .sort({ createdAt: -1 })
    .populate('meditationId', 'title type category');
};

// Static method to get journal entries by date range
journalSchema.statics.getEntriesByDateRange = async function(
  userId: string,
  startDate: Date,
  endDate: Date
) {
  return this.find({
    userId,
    createdAt: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ createdAt: -1 });
};

export const Journal = mongoose.model<IJournal>('Journal', journalSchema); 