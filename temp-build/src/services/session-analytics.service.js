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
    // Static method to get user analytics for recommendation engine
    static getUserAnalytics(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Get all user sessions
                const sessions = yield session_analytics_model_1.SessionAnalytics.find({
                    userId: new mongoose_1.default.Types.ObjectId(userId),
                    completed: true
                });
                if (sessions.length === 0) {
                    return {
                        moodImprovementByDuration: {
                            longerSessions: 0,
                            shorterSessions: 0
                        },
                        completionRateByTimeOfDay: {
                            morning: 0,
                            afternoon: 0,
                            evening: 0
                        }
                    };
                }
                // Calculate mood improvement by duration
                const longSessions = sessions.filter(s => (s.durationCompleted || 0) >= 15);
                const shortSessions = sessions.filter(s => (s.durationCompleted || 0) < 15);
                const moodValues = {
                    anxious: 1,
                    stressed: 2,
                    neutral: 3,
                    calm: 4,
                    peaceful: 5
                };
                const calculateMoodImprovement = (sessionList) => {
                    if (sessionList.length === 0)
                        return 0;
                    let totalImprovement = 0;
                    let countWithMoodData = 0;
                    sessionList.forEach(session => {
                        if (session.moodBefore && session.moodAfter) {
                            const before = moodValues[session.moodBefore] || 3;
                            const after = moodValues[session.moodAfter] || 3;
                            totalImprovement += (after - before);
                            countWithMoodData++;
                        }
                    });
                    return countWithMoodData > 0 ? totalImprovement / countWithMoodData : 0;
                };
                // Calculate completion rate by time of day
                const getMorningSessions = () => sessions.filter(s => {
                    const hour = new Date(s.startTime).getHours();
                    return hour >= 5 && hour < 12;
                });
                const getAfternoonSessions = () => sessions.filter(s => {
                    const hour = new Date(s.startTime).getHours();
                    return hour >= 12 && hour < 18;
                });
                const getEveningSessions = () => sessions.filter(s => {
                    const hour = new Date(s.startTime).getHours();
                    return hour >= 18 || hour < 5;
                });
                const calculateCompletionRate = (sessionList) => {
                    if (sessionList.length === 0)
                        return 0;
                    const completed = sessionList.filter(s => s.completed).length;
                    return completed / sessionList.length;
                };
                // Get preferred session types - using tags instead of type since type doesn't exist
                const sessionTags = [];
                sessions.forEach(session => {
                    if (session.tags && session.tags.length > 0) {
                        sessionTags.push(...session.tags);
                    }
                });
                const tagCounts = {};
                sessionTags.forEach(tag => {
                    if (tag)
                        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                });
                const preferredTypes = Object.entries(tagCounts)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 3)
                    .map(([type]) => type);
                // Calculate average focus score
                const focusScores = sessions.map(s => s.focusScore).filter(Boolean);
                const averageFocus = focusScores.length > 0
                    ? focusScores.reduce((sum, score) => sum + score, 0) / focusScores.length
                    : 0;
                return {
                    moodImprovementByDuration: {
                        longerSessions: calculateMoodImprovement(longSessions),
                        shorterSessions: calculateMoodImprovement(shortSessions)
                    },
                    completionRateByTimeOfDay: {
                        morning: calculateCompletionRate(getMorningSessions()),
                        afternoon: calculateCompletionRate(getAfternoonSessions()),
                        evening: calculateCompletionRate(getEveningSessions())
                    },
                    preferredSessionTypes: preferredTypes,
                    averageFocusScore: averageFocus
                };
            }
            catch (error) {
                console.error('Error getting user analytics:', error);
                return {
                    moodImprovementByDuration: {
                        longerSessions: 0,
                        shorterSessions: 0
                    },
                    completionRateByTimeOfDay: {
                        morning: 0,
                        afternoon: 0,
                        evening: 0
                    }
                };
            }
        });
    }
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
