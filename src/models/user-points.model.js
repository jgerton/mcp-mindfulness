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
exports.UserPoints = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const userPointsSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    total: {
        type: Number,
        default: 0,
        min: 0
    },
    achievements: {
        type: Number,
        default: 0,
        min: 0
    },
    streaks: {
        type: Number,
        default: 0,
        min: 0
    },
    recent: {
        type: Number,
        default: 0,
        min: 0
    },
    history: [
        {
            date: {
                type: Date,
                default: Date.now
            },
            points: {
                type: Number,
                required: true
            },
            source: {
                type: String,
                required: true,
                enum: ['achievement', 'streak', 'session', 'challenge', 'other']
            },
            description: {
                type: String,
                required: true
            }
        }
    ]
}, { timestamps: true });
// Create virtual properties for backward compatibility
userPointsSchema.virtual('totalPoints').get(function () {
    return this.total;
});
userPointsSchema.virtual('achievementPoints').get(function () {
    return this.achievements;
});
userPointsSchema.virtual('streakPoints').get(function () {
    return this.streaks;
});
userPointsSchema.virtual('recentPoints').get(function () {
    return this.recent;
});
userPointsSchema.virtual('pointsHistory').get(function () {
    return this.history;
});
// Add methods
userPointsSchema.methods.addPoints = async function (points, source, description) {
    // Update the appropriate category
    if (source === 'achievement') {
        this.achievements += points;
    }
    else if (source === 'streak') {
        this.streaks += points;
    }
    else {
        // Other sources go to recent
        this.recent += points;
    }
    // Update total
    this.total += points;
    // Add to history
    this.history.push({
        date: new Date(),
        points,
        source,
        description
    });
    // Save the changes
    await this.save();
};
// Create indexes for efficient querying
userPointsSchema.index({ userId: 1 });
userPointsSchema.index({ total: -1 });
userPointsSchema.index({ 'history.date': -1 });
exports.UserPoints = mongoose_1.default.model('UserPoints', userPointsSchema);
