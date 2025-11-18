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
exports.Progress = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const progressSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    meditationId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Meditation',
        required: true
    },
    duration: {
        type: Number,
        required: true,
        min: 0
    },
    completed: {
        type: Boolean,
        default: true
    },
    mood: {
        type: String,
        enum: ['very-negative', 'negative', 'neutral', 'positive', 'very-positive']
    },
    notes: {
        type: String,
        trim: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    }
}, {
    timestamps: true
});
// Add indexes for common queries
progressSchema.index({ userId: 1, createdAt: -1 });
progressSchema.index({ meditationId: 1 });
progressSchema.index({ startTime: 1 });
// Virtual for session length
progressSchema.virtual('sessionLength').get(function () {
    return (this.endTime.getTime() - this.startTime.getTime()) / (1000 * 60); // in minutes
});
// Static method to get user's total meditation time
progressSchema.statics.getTotalMeditationTime = function (userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield this.aggregate([
            { $match: { userId: new mongoose_1.default.Types.ObjectId(userId), completed: true } },
            { $group: { _id: null, totalDuration: { $sum: '$duration' } } }
        ]);
        return result.length > 0 ? result[0].totalDuration : 0;
    });
};
// Static method to get user's meditation streak
progressSchema.statics.getCurrentStreak = function (userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const sessions = yield this.find({
            userId,
            completed: true
        }).sort({ startTime: -1 });
        let streak = 0;
        let currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        for (const session of sessions) {
            const sessionDate = new Date(session.startTime);
            sessionDate.setHours(0, 0, 0, 0);
            const diffDays = Math.floor((currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays === streak) {
                streak++;
                currentDate = sessionDate;
            }
            else {
                break;
            }
        }
        return streak;
    });
};
exports.Progress = mongoose_1.default.model('Progress', progressSchema);
