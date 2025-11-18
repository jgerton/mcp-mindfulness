import mongoose, { Schema, Document } from 'mongoose';

/**
 * Interface representing a StressLog document in MongoDB
 */
export interface IStressLog extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  level: number; // 1-10 scale
  triggers: string[];
  symptoms: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Schema for the StressLog model
 */
const StressLogSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },
    date: {
      type: Date,
      required: [true, 'Log date is required'],
      default: Date.now
    },
    level: {
      type: Number,
      required: [true, 'Stress level is required'],
      min: [1, 'Stress level must be at least 1'],
      max: [10, 'Stress level cannot exceed 10']
    },
    triggers: {
      type: [{
        type: String,
        trim: true,
        maxlength: [100, 'Trigger description cannot be more than 100 characters']
      }],
      validate: {
        validator: function(triggers: string[]) {
          return triggers.length <= 5;
        },
        message: 'Cannot have more than 5 triggers'
      }
    },
    symptoms: {
      type: [{
        type: String,
        trim: true,
        maxlength: [100, 'Symptom description cannot be more than 100 characters']
      }],
      validate: {
        validator: function(symptoms: string[]) {
          return symptoms.length <= 10;
        },
        message: 'Cannot have more than 10 symptoms'
      }
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot be more than 1000 characters']
    }
  },
  {
    timestamps: true
  }
);

// Create indexes for better query performance
StressLogSchema.index({ userId: 1, date: -1 });
StressLogSchema.index({ userId: 1, level: 1 });

// Create the model
export const StressLog = mongoose.model<IStressLog>('StressLog', StressLogSchema);

export default StressLog; 