import mongoose, { Schema, Document } from 'mongoose';

/**
 * Interface representing a StressAssessment document in MongoDB
 */
export interface IStressAssessment extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  stressLevel: number; // 1-10 scale
  physicalSymptoms: string[];
  emotionalSymptoms: string[];
  triggers: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Schema for the StressAssessment model
 */
const StressAssessmentSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },
    date: {
      type: Date,
      required: [true, 'Assessment date is required'],
      default: Date.now
    },
    stressLevel: {
      type: Number,
      required: [true, 'Stress level is required'],
      min: [1, 'Stress level must be at least 1'],
      max: [10, 'Stress level cannot exceed 10']
    },
    physicalSymptoms: {
      type: [{
        type: String,
        trim: true,
        maxlength: [50, 'Physical symptom cannot be more than 50 characters']
      }],
      validate: {
        validator: function(symptoms: string[]) {
          return symptoms.length <= 10;
        },
        message: 'Cannot have more than 10 physical symptoms'
      }
    },
    emotionalSymptoms: {
      type: [{
        type: String,
        trim: true,
        maxlength: [50, 'Emotional symptom cannot be more than 50 characters']
      }],
      validate: {
        validator: function(symptoms: string[]) {
          return symptoms.length <= 10;
        },
        message: 'Cannot have more than 10 emotional symptoms'
      }
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
StressAssessmentSchema.index({ userId: 1, date: -1 });
StressAssessmentSchema.index({ userId: 1, stressLevel: 1 });

// Virtual for stress category
StressAssessmentSchema.virtual('stressCategory').get(function(this: IStressAssessment) {
  if (this.stressLevel <= 3) return 'low';
  if (this.stressLevel <= 7) return 'moderate';
  return 'high';
});

// Static method to get average stress level for a user over a time period
StressAssessmentSchema.statics.getAverageStressLevel = async function(
  userId: mongoose.Types.ObjectId,
  startDate: Date,
  endDate: Date = new Date()
) {
  const result = await this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        averageStressLevel: { $avg: '$stressLevel' },
        count: { $sum: 1 }
      }
    }
  ]);

  return result.length > 0 
    ? { 
        averageStressLevel: parseFloat(result[0].averageStressLevel.toFixed(1)), 
        count: result[0].count 
      } 
    : { 
        averageStressLevel: 0, 
        count: 0 
      };
};

// Create the model
export const StressAssessment = mongoose.model<IStressAssessment>('StressAssessment', StressAssessmentSchema);

export default StressAssessment; 