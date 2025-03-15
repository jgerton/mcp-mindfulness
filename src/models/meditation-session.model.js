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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeditationSession = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const achievement_service_1 = require("../services/achievement.service");
const base_wellness_session_model_1 = require("./base-wellness-session.model");
// Define meditation-specific fields
const meditationFields = {
    meditationId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Meditation',
        required: true
    },
    durationCompleted: {
        type: Number,
        required: true,
        min: [0, 'Completed duration cannot be negative'],
        validate: {
            validator: function (value) {
                return value <= this.duration;
            },
            message: 'Completed duration cannot exceed planned duration'
        }
    },
    interruptions: {
        type: Number,
        required: true,
        default: 0,
        min: [0, 'Interruptions cannot be negative']
    },
    streakDay: {
        type: Number,
        min: [1, 'Streak day must be positive']
    },
    maintainedStreak: {
        type: Boolean,
        default: false
    },
    focusRating: {
        type: Number,
        min: [1, 'Focus rating must be between 1 and 5'],
        max: [5, 'Focus rating must be between 1 and 5']
    },
    guidanceFollowed: {
        type: Boolean
    },
    completed: {
        type: Boolean,
        default: false
    }
};
// Create schema using base wellness session
const meditationSessionSchema = (0, base_wellness_session_model_1.createWellnessSessionSchema)(meditationFields);
// Add indexes
meditationSessionSchema.index({ userId: 1 });
meditationSessionSchema.index({ meditationId: 1 });
// Add meditation-specific methods
meditationSessionSchema.methods.processAchievements = function () {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.isCompleted && this.status !== base_wellness_session_model_1.WellnessSessionStatus.Completed) {
            return;
        }
        const achievementData = {
            userId: this.userId,
            sessionId: new mongoose_1.default.Types.ObjectId(this._id.toString()),
            meditationId: this.meditationId,
            duration: this.durationCompleted,
            focusRating: this.focusRating,
            interruptions: this.interruptions,
            streakMaintained: this.maintainedStreak,
            streakDay: this.streakDay,
            moodImprovement: this.moodAfter && this.moodBefore ?
                getMoodImprovement(this.moodBefore, this.moodAfter) : undefined
        };
        yield achievement_service_1.AchievementService.processMeditationAchievements(achievementData);
    });
};
// Add virtual fields
meditationSessionSchema.virtual('completionPercentage').get(function () {
    return Math.round((this.durationCompleted / this.duration) * 100);
});
meditationSessionSchema.virtual('isStreakEligible').get(function () {
    const completionPercentage = Math.round((this.durationCompleted / this.duration) * 100);
    return (this.isCompleted || this.status === base_wellness_session_model_1.WellnessSessionStatus.Completed) &&
        completionPercentage >= 80 && // At least 80% completed
        (this.focusRating === undefined || this.focusRating >= 3); // Good focus if rated
});
// Add getter for isCompleted for backward compatibility
meditationSessionSchema.virtual('isCompleted').get(function () {
    return this.status === base_wellness_session_model_1.WellnessSessionStatus.Completed || this.completed === true;
});
// Override complete method to handle meditation-specific logic
meditationSessionSchema.methods.complete = function (moodAfter, focusRating) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.canTransitionTo(base_wellness_session_model_1.WellnessSessionStatus.Completed)) {
            throw new Error(`Cannot complete session in ${this.status} status`);
        }
        this.status = base_wellness_session_model_1.WellnessSessionStatus.Completed;
        this.completed = true;
        this.endTime = new Date();
        this.durationCompleted = this.getActualDuration();
        if (moodAfter) {
            this.moodAfter = moodAfter;
        }
        if (focusRating !== undefined) {
            this.focusRating = focusRating;
        }
        yield this.save();
        yield this.processAchievements();
    });
};
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
exports.MeditationSession = mongoose_1.default.model('MeditationSession', meditationSessionSchema);
