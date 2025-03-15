"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionAnalyticsService = void 0;
const session_analytics_model_1 = require("../models/session-analytics.model");
const mongoose_1 = __importDefault(require("mongoose"));
class SessionAnalyticsService {
    // Create analytics entry for a new meditation session
    createSessionAnalytics(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingAnalytics = yield session_analytics_model_1.SessionAnalytics.findOne({
                userId: data.userId,
                sessionId: data.sessionId
            });
            if (existingAnalytics) {
                return yield session_analytics_model_1.SessionAnalytics.findOneAndUpdate({ _id: existingAnalytics._id }, { $set: data }, { new: true });
            }
            const analytics = new session_analytics_model_1.SessionAnalytics(data);
            return yield analytics.save();
        });
    }
    // Update analytics when session ends
    updateSessionAnalytics(sessionId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield session_analytics_model_1.SessionAnalytics.findOneAndUpdate({ sessionId: new mongoose_1.default.Types.ObjectId(sessionId) }, { $set: data }, { new: true });
        });
    }
    // Get user's session history with pagination
    getUserSessionHistory(userId, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { page = 1, limit = 10 } = options;
            const skip = (page - 1) * limit;
            const [sessions, totalCount] = yield Promise.all([
                session_analytics_model_1.SessionAnalytics.find({ userId: new mongoose_1.default.Types.ObjectId(userId) })
                    .sort({ startTime: -1 })
                    .skip(skip)
                    .limit(limit),
                session_analytics_model_1.SessionAnalytics.countDocuments({ userId: new mongoose_1.default.Types.ObjectId(userId) })
            ]);
            return {
                sessions,
                totalSessions: totalCount,
                totalPages: Math.ceil(totalCount / limit)
            };
        });
    }
    // Get user's meditation stats for a time period
    getUserStats(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const stats = yield session_analytics_model_1.SessionAnalytics.aggregate([
                { $match: { userId: new mongoose_1.default.Types.ObjectId(userId) } },
                {
                    $group: {
                        _id: null,
                        totalSessions: { $sum: 1 },
                        totalMinutes: { $sum: '$durationCompleted' },
                        averageFocusScore: { $avg: '$focusScore' },
                        totalInterruptions: { $sum: '$interruptions' }
                    }
                }
            ]);
            return stats[0] || {
                totalSessions: 0,
                totalMinutes: 0,
                averageFocusScore: 0,
                totalInterruptions: 0
            };
        });
    }
    // Get mood improvement stats
    getMoodImprovementStats(userId, startTime) {
        return __awaiter(this, void 0, void 0, function* () {
            const sessions = yield session_analytics_model_1.SessionAnalytics.find({
                userId: new mongoose_1.default.Types.ObjectId(userId),
                startTime: { $gte: startTime }
            });
            const totalSessions = sessions.length;
            const totalImproved = sessions.filter(session => {
                if (!session.moodBefore || !session.moodAfter)
                    return false;
                const moodValues = {
                    anxious: 1,
                    stressed: 2,
                    neutral: 3,
                    calm: 4,
                    peaceful: 5
                };
                return moodValues[session.moodAfter] > moodValues[session.moodBefore];
            }).length;
            return {
                totalImproved,
                totalSessions,
                improvementRate: totalSessions > 0 ? (totalImproved / totalSessions) * 100 : 0
            };
        });
    }
    // Find a single session analytics document
    findOne(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield session_analytics_model_1.SessionAnalytics.findOne(filter);
        });
    }
}
exports.SessionAnalyticsService = SessionAnalyticsService;
