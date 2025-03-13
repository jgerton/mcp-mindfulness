import mongoose, { Document, Schema } from 'mongoose';

export interface IMeditation extends Document {
  title: string;
  description: string;
  duration: number; // in minutes
  type: 'guided' | 'timer' | 'ambient';
  audioUrl?: string; // for guided meditations
  category: 'mindfulness' | 'breathing' | 'body-scan' | 'loving-kindness' | 'other';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  authorId?: string; // reference to User model for custom meditations
}

const meditationSchema = new Schema<IMeditation>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  duration: {
    type: Number,
    required: true,
    min: 1
  },
  type: {
    type: String,
    required: true,
    enum: ['guided', 'timer', 'ambient']
  },
  audioUrl: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['mindfulness', 'breathing', 'body-scan', 'loving-kindness', 'other']
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['beginner', 'intermediate', 'advanced']
  },
  tags: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  authorId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Add indexes for common queries
meditationSchema.index({ category: 1 });
meditationSchema.index({ difficulty: 1 });
meditationSchema.index({ type: 1 });
meditationSchema.index({ tags: 1 });

export const Meditation = mongoose.model<IMeditation>('Meditation', meditationSchema); 