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
exports.UserAchievement = exports.Achievement = void 0;
const mongoose_1 = __importStar(require("mongoose"));
/**
 * Schema for the Achievement model
 */
const AchievementSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Achievement name is required'],
        trim: true,
        maxlength: [100, 'Achievement name cannot be more than 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Achievement description is required'],
        trim: true,
        maxlength: [500, 'Achievement description cannot be more than 500 characters']
    },
    category: {
        type: String,
        required: [true, 'Achievement category is required'],
        enum: {
            values: ['time', 'duration', 'streak', 'milestone', 'special'],
            message: 'Achievement category must be one of: time, duration, streak, milestone, special'
        }
    },
    criteria: {
        type: {
            type: String,
            required: [true, 'Criteria type is required']
        },
        value: {
            type: mongoose_1.Schema.Types.Mixed,
            required: [true, 'Criteria value is required']
        }
    },
    icon: {
        type: String,
        required: [true, 'Achievement icon is required'],
        trim: true
    },
    points: {
        type: Number,
        required: [true, 'Achievement points are required'],
        min: [0, 'Achievement points cannot be negative']
    },
    // Add fields used by the achievement service
    type: {
        type: String,
        index: true
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    progress: {
        type: Number,
        default: 0
    },
    target: {
        type: Number,
        default: 0
    },
    completed: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Date
    }
}, {
    timestamps: true
});
/**
 * Schema for the UserAchievement model
 */
const UserAchievementSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    achievementId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Achievement',
        required: [true, 'Achievement ID is required']
    },
    progress: {
        type: Number,
        required: [true, 'Achievement progress is required'],
        min: [0, 'Achievement progress cannot be negative'],
        max: [100, 'Achievement progress cannot exceed 100']
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    dateEarned: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});
// Create indexes for better query performance
UserAchievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true });
UserAchievementSchema.index({ userId: 1, isCompleted: 1 });
// Create the models
exports.Achievement = mongoose_1.default.model('Achievement', AchievementSchema);
exports.UserAchievement = mongoose_1.default.model('UserAchievement', UserAchievementSchema);
exports.default = {
    Achievement: exports.Achievement,
    UserAchievement: exports.UserAchievement
};
