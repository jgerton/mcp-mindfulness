"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.StressManagementSession = exports.StressManagementTechnique = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const base_wellness_session_model_1 = require("./base-wellness-session.model");
const achievement_service_1 = require("../services/achievement.service");
/**
 * Enum for stress management technique types
 */
var StressManagementTechnique;
(function (StressManagementTechnique) {
    StressManagementTechnique["DeepBreathing"] = "deep_breathing";
    StressManagementTechnique["ProgressiveMuscleRelaxation"] = "progressive_muscle_relaxation";
    StressManagementTechnique["GuidedImagery"] = "guided_imagery";
    StressManagementTechnique["Mindfulness"] = "mindfulness";
    StressManagementTechnique["BodyScan"] = "body_scan";
    StressManagementTechnique["Journaling"] = "journaling";
    StressManagementTechnique["PhysicalExercise"] = "physical_exercise";
    StressManagementTechnique["Other"] = "other";
})(StressManagementTechnique || (exports.StressManagementTechnique = StressManagementTechnique = {}));
// Create a base model from the base schema
const BaseWellnessSession = mongoose_1.default.model('BaseWellnessSession', base_wellness_session_model_1.baseWellnessSessionSchema);
// Create the StressManagementSession schema as a discriminator of the base schema
const StressManagementSessionSchema = new mongoose_1.Schema({
    technique: {
        type: String,
        enum: Object.values(StressManagementTechnique),
        required: [true, 'Stress management technique is required']
    },
    stressLevelBefore: {
        type: Number,
        required: [true, 'Initial stress level is required'],
        min: [1, 'Stress level must be at least 1'],
        max: [10, 'Stress level cannot exceed 10']
    },
    stressLevelAfter: {
        type: Number,
        min: [1, 'Stress level must be at least 1'],
        max: [10, 'Stress level cannot exceed 10']
    },
    guidedSessionId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'GuidedSession'
    },
    triggers: {
        type: [{
                type: String,
                trim: true,
                maxlength: [100, 'Trigger description cannot be more than 100 characters']
            }],
        validate: {
            validator: function (triggers) {
                return triggers.length <= 5;
            },
            message: 'Cannot have more than 5 triggers'
        }
    },
    physicalSymptoms: {
        type: [{
                type: String,
                trim: true,
                maxlength: [50, 'Physical symptom cannot be more than 50 characters']
            }],
        validate: {
            validator: function (symptoms) {
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
            validator: function (symptoms) {
                return symptoms.length <= 10;
            },
            message: 'Cannot have more than 10 emotional symptoms'
        }
    },
    effectiveness: {
        type: Number,
        min: [1, 'Effectiveness rating must be at least 1'],
        max: [5, 'Effectiveness rating cannot exceed 5']
    },
    feedback: {
        effectivenessRating: {
            type: Number,
            min: [1, 'Effectiveness rating must be at least 1'],
            max: [5, 'Effectiveness rating cannot exceed 5']
        },
        stressReductionRating: {
            type: Number,
            min: [1, 'Stress reduction rating must be at least 1'],
            max: [5, 'Stress reduction rating cannot exceed 5']
        },
        comments: {
            type: String,
            trim: true,
            maxlength: [500, 'Comments cannot exceed 500 characters']
        },
        improvements: {
            type: [{
                    type: String,
                    trim: true,
                    maxlength: [100, 'Improvement suggestion cannot exceed 100 characters']
                }],
            validate: {
                validator: function (improvements) {
                    return improvements.length <= 5;
                },
                message: 'Cannot have more than 5 improvement suggestions'
            }
        }
    }
});
// Create indexes for better query performance
StressManagementSessionSchema.index({ userId: 1, startTime: -1 });
StressManagementSessionSchema.index({ userId: 1, technique: 1 });
StressManagementSessionSchema.index({ userId: 1, status: 1 });
// Virtual for stress reduction calculation
StressManagementSessionSchema.virtual('stressReduction').get(function () {
    if (this.stressLevelBefore && this.stressLevelAfter) {
        const reduction = this.stressLevelBefore - this.stressLevelAfter;
        return Math.max(0, reduction); // Ensure we don't return negative values
    }
    return 0;
});
// Method to add feedback to a completed session
StressManagementSessionSchema.methods.addFeedback = async function (feedback) {
    if (this.status !== base_wellness_session_model_1.WellnessSessionStatus.Completed) {
        throw new Error('Feedback can only be added to completed sessions');
    }
    // Check if meaningful feedback already exists
    if (this.feedback &&
        (this.feedback.effectivenessRating ||
            this.feedback.stressReductionRating ||
            this.feedback.comments ||
            (this.feedback.improvements && this.feedback.improvements.length > 0))) {
        throw new Error('Feedback has already been provided for this session');
    }
    this.feedback = feedback;
    return this.save();
};
// Override the processAchievements method
StressManagementSessionSchema.methods.processAchievements = async function () {
    try {
        const achievementService = new achievement_service_1.AchievementService();
        // Process stress management related achievements
        if (this.status === base_wellness_session_model_1.WellnessSessionStatus.Completed) {
            // TODO: Implement stress management achievements in AchievementService
            // For now, just log that we would process achievements
            console.log('Processing achievements for stress management session:', {
                userId: this.userId,
                technique: this.technique,
                stressReduction: this.stressReduction,
                duration: this.getActualDuration()
            });
            // When AchievementService is updated, uncomment this:
            // await achievementService.processStressManagementAchievements(this.userId, {
            //   technique: this.technique,
            //   stressReduction: this.stressReduction,
            //   duration: this.getActualDuration()
            // });
        }
    }
    catch (error) {
        console.error('Error processing achievements for stress management session:', error);
        // Don't throw the error to prevent blocking the session completion
    }
};
// Pre-save middleware
StressManagementSessionSchema.pre('save', function (next) {
    // If completing the session without setting stressLevelAfter, copy the before value
    if (this.status === base_wellness_session_model_1.WellnessSessionStatus.Completed && !this.stressLevelAfter) {
        this.stressLevelAfter = this.stressLevelBefore;
    }
    next();
});
// Create the model as a discriminator of the base model
exports.StressManagementSession = BaseWellnessSession.discriminator('StressManagementSession', StressManagementSessionSchema);
exports.default = exports.StressManagementSession;
