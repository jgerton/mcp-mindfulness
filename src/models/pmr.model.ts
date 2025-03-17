import mongoose, { Document, Schema } from 'mongoose';

export interface MuscleGroup {
  name: string;
  description: string;
  order: number;
  durationSeconds: number;
}

export interface PMRSession extends Document {
  userId: string;
  startTime: Date;
  endTime?: Date;
  completedGroups: string[];
  stressLevelBefore?: number;
  stressLevelAfter?: number;
  duration: number;
}

const muscleGroupSchema = new Schema<MuscleGroup>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  order: { type: Number, required: true },
  durationSeconds: { type: Number, required: true }
});

const pmrSessionSchema = new Schema<PMRSession>({
  userId: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  completedGroups: [{ type: String }],
  stressLevelBefore: { type: Number, min: 0, max: 10 },
  stressLevelAfter: { type: Number, min: 0, max: 10 },
  duration: { type: Number, required: true }
}, { timestamps: true });

export const MuscleGroup = mongoose.model<MuscleGroup>('MuscleGroup', muscleGroupSchema);
export const PMRSession = mongoose.model<PMRSession>('PMRSession', pmrSessionSchema); 