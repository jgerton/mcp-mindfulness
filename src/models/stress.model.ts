import mongoose, { Schema, Document } from 'mongoose';
import { StressLevel, TechniqueType } from '../types/stress.types';

export interface IStressAssessment extends Document {
  userId: string;
  level: StressLevel;
  timestamp: Date;
  physicalSymptoms?: number;
  emotionalSymptoms?: number;
  behavioralSymptoms?: number;
  cognitiveSymptoms?: number;
  score?: number;
  triggers?: string[];
}

export interface IUserPreferences extends Document {
  userId: string;
  preferredTechniques: TechniqueType[];
  preferredDuration: number;
  timePreferences: {
    reminderFrequency: 'DAILY' | 'WEEKLY' | 'ON_HIGH_STRESS';
    preferredTimes?: string[];
  };
}

const stressAssessmentSchema = new Schema({
  userId: {
    type: String,
    required: true
  },
  level: {
    type: String,
    enum: ['LOW', 'MODERATE', 'HIGH'],
    required: true
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  physicalSymptoms: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  emotionalSymptoms: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  behavioralSymptoms: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  cognitiveSymptoms: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  score: {
    type: Number,
    min: 0,
    max: 10
  },
  triggers: [{
    type: String
  }]
}, {
  timestamps: true
});

const userPreferencesSchema = new Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  preferredTechniques: [{
    type: String,
    enum: Object.values(TechniqueType),
    required: true
  }],
  preferredDuration: {
    type: Number,
    min: 1,
    max: 60,
    default: 15
  },
  timePreferences: {
    reminderFrequency: {
      type: String,
      enum: ['DAILY', 'WEEKLY', 'ON_HIGH_STRESS'],
      default: 'DAILY'
    },
    preferredTimes: [{
      type: String
    }]
  }
}, {
  timestamps: true
});

export const StressAssessmentLegacy = mongoose.models.StressAssessmentLegacy || mongoose.model<IStressAssessment>('StressAssessmentLegacy', stressAssessmentSchema);
export const UserPreferences = mongoose.models.UserPreferences || mongoose.model<IUserPreferences>('UserPreferences', userPreferencesSchema); 