"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserPreferences = exports.StressAssessment = void 0;
var mongoose_1 = require("mongoose");
var stressAssessmentSchema = new mongoose_1.Schema({
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
var userPreferencesSchema = new mongoose_1.Schema({
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
exports.StressAssessment = (0, mongoose_1.model)('StressAssessment', stressAssessmentSchema);
exports.UserPreferences = (0, mongoose_1.model)('UserPreferences', userPreferencesSchema);
