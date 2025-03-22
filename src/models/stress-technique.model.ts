import mongoose, { Document, Schema } from 'mongoose';

export interface StressTechniqueDocument extends Document {
  name: string;
  description: string;
  category: string;
  difficultyLevel: string;
  durationMinutes: number;
  steps: string[];
  benefits: string[];
  tags: string[];
  effectivenessRating: number;
  recommendedFrequency: string;
  createdAt: Date;
  updatedAt: Date;
}

const stressTechniqueSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['breathing', 'meditation', 'mindfulness', 'physical', 'relaxation', 'visualization'],
      message: '{VALUE} is not a valid category'
    },
    trim: true
  },
  difficultyLevel: {
    type: String,
    required: [true, 'Difficulty level is required'],
    enum: {
      values: ['beginner', 'intermediate', 'advanced'],
      message: '{VALUE} is not a valid difficulty level'
    },
    trim: true
  },
  durationMinutes: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1 minute'],
    max: [120, 'Duration must be at most 120 minutes']
  },
  steps: {
    type: [String],
    default: []
  },
  benefits: {
    type: [String],
    default: []
  },
  tags: {
    type: [String],
    default: []
  },
  effectivenessRating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating must be at most 5'],
    default: 3
  },
  recommendedFrequency: {
    type: String,
    enum: {
      values: ['daily', 'weekly', 'as-needed'],
      message: '{VALUE} is not a valid frequency'
    },
    default: 'as-needed'
  }
}, {
  timestamps: true
});

// Add indexes for common queries
stressTechniqueSchema.index({ category: 1 });
stressTechniqueSchema.index({ difficultyLevel: 1 });
stressTechniqueSchema.index({ tags: 1 });
stressTechniqueSchema.index({ name: 'text', description: 'text', tags: 'text' });

const StressTechnique = mongoose.model<StressTechniqueDocument>('StressTechnique', stressTechniqueSchema);

export default StressTechnique; 