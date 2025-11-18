"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionAnalyticsService = void 0;
const session_analytics_model_1 = require("../models/session-analytics.model");
const mongoose_1 = __importDefault(require("mongoose"));
class SessionAnalyticsService {
    // Create analytics entry for a new meditation session
    async createSessionAnalytics(data) {
        const existingAnalytics = await session_analytics_model_1.SessionAnalytics.findOne({
            userId: data.userId,
            sessionId: data.sessionId
        });
        if (existingAnalytics) {
            return await session_analytics_model_1.SessionAnalytics.findOneAndUpdate({ _id: existingAnalytics._id }, { $set: data }, { new: true });
        }
        const analytics = new session_analytics_model_1.SessionAnalytics(data);
        return await analytics.save();
    }
    // Update analytics when session ends
    async updateSessionAnalytics(sessionId, data) {
        return await session_analytics_model_1.SessionAnalytics.findOneAndUpdate({ sessionId: new mongoose_1.default.Types.ObjectId(sessionId) }, { $set: data }, { new: true });
    }
    // Get user's session history with pagination
    async getUserSessionHistory(userId, options) {
        const { page = 1, limit = 10 } = options;
        const skip = (page - 1) * limit;
        const [sessions, totalCount] = await Promise.all([
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
    }
    // Get user's meditation stats for a time period
    async getUserStats(userId) {
        const stats = await session_analytics_model_1.SessionAnalytics.aggregate([
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
    }
    // Get mood improvement stats
    async getMoodImprovementStats(userId, startTime) {
        const sessions = await session_analytics_model_1.SessionAnalytics.find({
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
    }
    // Find a single session analytics document
    async findOne(filter) {
        return await session_analytics_model_1.SessionAnalytics.findOne(filter);
    }
}
exports.SessionAnalyticsService = SessionAnalyticsService;
