import { Schema, model, Document } from 'mongoose';

export type StressLevel = 'LOW' | 'MILD' | 'MODERATE' | 'HIGH' | 'SEVERE';
export type TechniqueType = 'MEDITATION' | 'BREATHING' | 'PHYSICAL' | 'QUICK_RELIEF';
export type BreathingTechnique = '4-7-8' | 'BOX_BREATHING' | 'ALTERNATE_NOSTRIL';
export type MeditationTechnique = 'GUIDED' | 'MINDFULNESS' | 'BODY_SCAN';
export type PhysicalTechnique = 'PROGRESSIVE_RELAXATION' | 'STRETCHING' | 'WALKING';
export type QuickReliefTechnique = 'GROUNDING' | 'VISUALIZATION' | 'QUICK_BREATH';

export interface StressAssessment extends Document {
  userId: string;
  timestamp: Date;
  physicalSymptoms: number;  // 0-10 scale
  emotionalSymptoms: number; // 0-10 scale
  behavioralSymptoms: number; // 0-10 scale
  cognitiveSymptoms: number; // 0-10 scale
  score?: number;
  level?: StressLevel;
  triggers?: string[];
  notes?: string;
}

export interface StressReduction {
  type: TechniqueType;
  duration: number; // minutes
  technique: BreathingTechnique | MeditationTechnique | PhysicalTechnique | QuickReliefTechnique;
  title: string;
  description: string;
  customInstructions?: string;
  resources?: string[];
}

export interface UserPreferences extends Document {
  userId: string;
  preferredTechniques: Array<BreathingTechnique | MeditationTechnique | PhysicalTechnique | QuickReliefTechnique>;
  preferredDuration?: number;
  triggers?: string[];
  avoidedTechniques?: string[];
  timePreferences?: {
    preferredTime?: string[];
    reminderFrequency?: 'DAILY' | 'WEEKLY' | 'ON_HIGH_STRESS';
  };
}

const stressAssessmentSchema = new Schema<StressAssessment>({
  userId: { type: String, required: true },
  timestamp: { type: Date, required: true },
  physicalSymptoms: { type: Number, required: true, min: 0, max: 10 },
  emotionalSymptoms: { type: Number, required: true, min: 0, max: 10 },
  behavioralSymptoms: { type: Number, required: true, min: 0, max: 10 },
  cognitiveSymptoms: { type: Number, required: true, min: 0, max: 10 },
  score: { type: Number },
  level: { type: String, enum: ['LOW', 'MILD', 'MODERATE', 'HIGH', 'SEVERE'] },
  triggers: [String],
  notes: String
});

const userPreferencesSchema = new Schema<UserPreferences>({
  userId: { type: String, required: true, unique: true },
  preferredTechniques: [{
    type: String,
    enum: [
      '4-7-8', 'BOX_BREATHING', 'ALTERNATE_NOSTRIL',
      'GUIDED', 'MINDFULNESS', 'BODY_SCAN',
      'PROGRESSIVE_RELAXATION', 'STRETCHING', 'WALKING',
      'GROUNDING', 'VISUALIZATION', 'QUICK_BREATH'
    ]
  }],
  preferredDuration: Number,
  triggers: [String],
  avoidedTechniques: [String],
  timePreferences: {
    preferredTime: [String],
    reminderFrequency: {
      type: String,
      enum: ['DAILY', 'WEEKLY', 'ON_HIGH_STRESS']
    }
  }
});

// Create indexes
stressAssessmentSchema.index({ userId: 1, timestamp: -1 });
userPreferencesSchema.index({ userId: 1 });

export const StressAssessment = model<StressAssessment>('StressAssessment', stressAssessmentSchema);
export const UserPreferences = model<UserPreferences>('UserPreferences', userPreferencesSchema); 