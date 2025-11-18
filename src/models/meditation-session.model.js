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
exports.MeditationSession = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const achievement_service_1 = require("../services/achievement.service");
const base_wellness_session_model_1 = require("./base-wellness-session.model");
/**
 * Schema for the MeditationSession model
 */
const MeditationSessionSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: [true, 'Session title is required'],
        trim: true,
        maxlength: [100, 'Session title cannot be more than 100 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Session description cannot be more than 500 characters']
    },
    completed: {
        type: Boolean,
        default: false
    },
    type: {
        type: String,
        required: [true, 'Session type is required'],
        enum: {
            values: ['guided', 'unguided', 'timed'],
            message: 'Session type must be one of: guided, unguided, timed'
        }
    },
    guidedMeditationId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'GuidedMeditation',
        validate: {
            validator: function (value) {
                return this.type !== 'guided' || (this.type === 'guided' && value);
            },
            message: 'Guided meditation ID is required for guided sessions'
        }
    },
    meditationId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Meditation'
    },
    tags: [{
            type: String,
            trim: true,
            maxlength: [30, 'Tag cannot be more than 30 characters']
        }],
    durationCompleted: {
        type: Number,
        default: 0
    },
    interruptions: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
    discriminatorKey: 'sessionType',
});
// Create the model using the base schema
const BaseWellnessSession = mongoose_1.default.model('BaseWellnessSession', base_wellness_session_model_1.baseWellnessSessionSchema);
exports.MeditationSession = BaseWellnessSession.discriminator('MeditationSession', MeditationSessionSchema);
// Create indexes for better query performance
MeditationSessionSchema.index({ userId: 1, startTime: -1 });
MeditationSessionSchema.index({ userId: 1, completed: 1 });
MeditationSessionSchema.index({ tags: 1 });
// Virtual for calculating session duration in minutes
MeditationSessionSchema.virtual('durationMinutes').get(function () {
    return Math.round(this.duration / 60);
});
// Method to mark session as completed
MeditationSessionSchema.methods.completeSession = function (endTime = new Date()) {
    this.completed = true;
    this.endTime = endTime;
    this.status = base_wellness_session_model_1.WellnessSessionStatus.Completed;
    // Calculate actual duration if it differs from planned duration
    const actualDuration = Math.round((endTime.getTime() - this.startTime.getTime()) / 1000);
    if (actualDuration > 0) {
        this.duration = actualDuration;
    }
    return this.save();
};
// Add indexes
MeditationSessionSchema.index({ userId: 1 });
MeditationSessionSchema.index({ guidedMeditationId: 1 });
// Add meditation-specific methods
MeditationSessionSchema.methods.processAchievements = async function () {
    if (!this.completed) {
        return;
    }
    const achievementData = {
        userId: this.userId,
        sessionId: new mongoose_1.default.Types.ObjectId(this._id.toString()),
        meditationId: this.meditationId || this.guidedMeditationId || new mongoose_1.default.Types.ObjectId(),
        duration: this.duration,
        focusRating: this.moodAfter && this.moodBefore ? getMoodImprovement(this.moodBefore, this.moodAfter) : 0,
        interruptions: this.interruptions || 0,
        streakMaintained: false,
        streakDay: 0,
        moodImprovement: this.moodAfter && this.moodBefore ? getMoodImprovement(this.moodBefore, this.moodAfter) : 0
    };
    await achievement_service_1.AchievementService.processMeditationAchievements(achievementData);
};
// Add virtual fields
MeditationSessionSchema.virtual('completionPercentage').get(function () {
    if (!this.duration)
        return 0;
    return Math.round((this.durationCompleted || 0) / this.duration * 100);
});
MeditationSessionSchema.virtual('isStreakEligible').get(function () {
    return this.status === base_wellness_session_model_1.WellnessSessionStatus.Completed;
});
// Add helper function for mood improvement calculation
function getMoodImprovement(before, after) {
    const moodValues = {
        [base_wellness_session_model_1.WellnessMoodState.Stressed]: 1,
        [base_wellness_session_model_1.WellnessMoodState.Anxious]: 2,
        [base_wellness_session_model_1.WellnessMoodState.Neutral]: 3,
        [base_wellness_session_model_1.WellnessMoodState.Calm]: 4,
        [base_wellness_session_model_1.WellnessMoodState.Peaceful]: 5,
        [base_wellness_session_model_1.WellnessMoodState.Energized]: 5
    };
    return moodValues[after] - moodValues[before];
}
exports.default = exports.MeditationSession;
