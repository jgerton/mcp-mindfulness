import mongoose, { Schema, Document } from 'mongoose';

export interface IUserPreferences extends Document {
  userId: string;
  preferredTechniques: string[];
  preferredDuration: number;
  avoidedTechniques: string[];
}

const userPreferencesSchema = new Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  preferredTechniques: {
    type: [String],
    default: []
  },
  preferredDuration: {
    type: Number,
    default: 5
  },
  avoidedTechniques: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

export const UserPreferences = mongoose.models.UserPreferences || mongoose.model<IUserPreferences>('UserPreferences', userPreferencesSchema); 