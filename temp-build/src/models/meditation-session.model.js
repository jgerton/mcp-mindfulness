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
/**
 * Schema for the MeditationSession model
 */
const MeditationSessionSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
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
    duration: {
        type: Number,
        required: [true, 'Session duration is required'],
        min: [1, 'Session duration must be at least 1 second']
    },
    completed: {
        type: Boolean,
        default: false
    },
    startTime: {
        type: Date,
        required: [true, 'Session start time is required']
    },
    endTime: {
        type: Date,
        validate: {
            validator: function (value) {
                return !value || value > this.startTime;
            },
            message: 'End time must be after start time'
        }
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
    tags: [{
            type: String,
            trim: true,
            maxlength: [30, 'Tag cannot be more than 30 characters']
        }],
    mood: {
        before: {
            type: String,
            enum: {
                values: ['very_negative', 'negative', 'neutral', 'positive', 'very_positive'],
                message: 'Mood must be one of: very_negative, negative, neutral, positive, very_positive'
            }
        },
        after: {
            type: String,
            enum: {
                values: ['very_negative', 'negative', 'neutral', 'positive', 'very_positive'],
                message: 'Mood must be one of: very_negative, negative, neutral, positive, very_positive'
            }
        }
    },
    notes: {
        type: String,
        trim: true,
        maxlength: [1000, 'Notes cannot be more than 1000 characters']
    },
    feedback: {
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        comments: {
            type: String
        },
        improvements: {
            type: [String]
        }
    }
}, {
    timestamps: true
});
// Create indexes for better query performance
// Compound indexes - MongoDB will automatically create an index on the first field (userId)
// so we don't need a separate index just for userId
MeditationSessionSchema.index({ userId: 1, startTime: -1 }, { name: 'user_startTime_idx', background: true, sparse: false });
MeditationSessionSchema.index({ userId: 1, completed: 1 }, { name: 'user_completed_idx', background: true, sparse: false });
// Single field indexes for other query patterns
MeditationSessionSchema.index({ tags: 1 }, { name: 'tags_idx', background: true });
MeditationSessionSchema.index({ guidedMeditationId: 1 }, { name: 'guidedMeditation_idx', background: true });
// Virtual for calculating session duration in minutes
MeditationSessionSchema.virtual('durationMinutes').get(function () {
    return Math.round(this.duration / 60);
});
// Method to mark session as completed
MeditationSessionSchema.methods.completeSession = function (endTime = new Date()) {
    this.completed = true;
    this.endTime = endTime;
    // Calculate actual duration if it differs from planned duration
    const actualDuration = Math.round((endTime.getTime() - this.startTime.getTime()) / 1000);
    if (actualDuration > 0) {
        this.duration = actualDuration;
    }
    return this.save();
};
// Add meditation-specific methods
MeditationSessionSchema.methods.processAchievements = function () {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        if (!this.completed) {
            return;
        }
        const achievementData = {
            userId: this.userId,
            sessionId: new mongoose_1.default.Types.ObjectId(this._id.toString()),
            meditationId: this.guidedMeditationId ? this.guidedMeditationId : new mongoose_1.default.Types.ObjectId(), // Provide a default ObjectId if undefined
            duration: this.duration,
            focusRating: ((_a = this.mood) === null || _a === void 0 ? void 0 : _a.after) && ((_b = this.mood) === null || _b === void 0 ? void 0 : _b.before) ? getMoodImprovement(this.mood.before, this.mood.after) : 0, // Cast to any to bypass type check
            interruptions: 0,
            streakMaintained: false,
            streakDay: 0,
            moodImprovement: ((_c = this.mood) === null || _c === void 0 ? void 0 : _c.after) && ((_d = this.mood) === null || _d === void 0 ? void 0 : _d.before) ? getMoodImprovement(this.mood.before, this.mood.after) : 0 // Cast to any to bypass type check
        };
        yield achievement_service_1.AchievementService.processMeditationAchievements(achievementData);
    });
};
// Add virtual fields
MeditationSessionSchema.virtual('completionPercentage').get(function () {
    return Math.round((this.duration / this.duration) * 100);
});
MeditationSessionSchema.virtual('isStreakEligible').get(function () {
    return this.completed;
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
// Create the model
exports.MeditationSession = mongoose_1.default.model('MeditationSession', MeditationSessionSchema);
exports.default = exports.MeditationSession;
