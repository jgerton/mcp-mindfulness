import mongoose, { Document, Schema } from 'mongoose';

export interface BreathingPattern {
  name: string;
  inhale: number;
  hold?: number;
  exhale: number;
  postExhaleHold?: number;
  cycles: number;
}

export interface BreathingSession extends Document {
  userId: string;
  patternName: string;
  startTime: Date;
  endTime?: Date;
  completedCycles: number;
  targetCycles: number;
  stressLevelBefore?: number;
  stressLevelAfter?: number;
}

const breathingPatternSchema = new Schema<BreathingPattern>({
  name: { type: String, required: true, unique: true },
  inhale: { type: Number, required: true },
  hold: { type: Number },
  exhale: { type: Number, required: true },
  postExhaleHold: { type: Number },
  cycles: { type: Number, required: true }
});

const breathingSessionSchema = new Schema<BreathingSession>({
  userId: { type: String, required: true },
  patternName: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  completedCycles: { type: Number, required: true, default: 0 },
  targetCycles: { type: Number, required: true },
  stressLevelBefore: { type: Number, min: 0, max: 10 },
  stressLevelAfter: { type: Number, min: 0, max: 10 }
}, { timestamps: true });

export const BreathingPattern = mongoose.model<BreathingPattern>('BreathingPattern', breathingPatternSchema);
export const BreathingSession = mongoose.model<BreathingSession>('BreathingSession', breathingSessionSchema); 