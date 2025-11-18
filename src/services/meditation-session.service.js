"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeditationSessionService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const session_analytics_service_1 = require("./session-analytics.service");
const meditation_session_model_1 = require("../models/meditation-session.model");
const errors_1 = require("../utils/errors");
const base_wellness_session_model_1 = require("../models/base-wellness-session.model");
const mongoose_2 = require("mongoose");
const moodMap = {
    stressed: base_wellness_session_model_1.WellnessMoodState.Stressed,
    anxious: base_wellness_session_model_1.WellnessMoodState.Anxious,
    neutral: base_wellness_session_model_1.WellnessMoodState.Neutral,
    calm: base_wellness_session_model_1.WellnessMoodState.Calm,
    peaceful: base_wellness_session_model_1.WellnessMoodState.Peaceful,
    energized: base_wellness_session_model_1.WellnessMoodState.Energized,
};
const moodValues = {
    [base_wellness_session_model_1.WellnessMoodState.Stressed]: 1,
    [base_wellness_session_model_1.WellnessMoodState.Anxious]: 2,
    [base_wellness_session_model_1.WellnessMoodState.Neutral]: 3,
    [base_wellness_session_model_1.WellnessMoodState.Calm]: 4,
    [base_wellness_session_model_1.WellnessMoodState.Peaceful]: 5,
    [base_wellness_session_model_1.WellnessMoodState.Energized]: 6,
};
class MeditationSessionService {
    constructor() {
        this.sessionAnalyticsService = new session_analytics_service_1.SessionAnalyticsService();
    }
    async startSession(userId, data) {
        const activeSession = await this.getActiveSession(userId);
        if (activeSession) {
            throw new errors_1.ValidationError('Active session already exists');
        }
        const session = await meditation_session_model_1.MeditationSession.create({
            userId: new mongoose_1.default.Types.ObjectId(userId),
            meditationId: new mongoose_1.default.Types.ObjectId(data.meditationId),
            startTime: new Date(),
            duration: data.duration,
            durationCompleted: data.durationCompleted || 0,
            interruptions: 0,
            completed: data.completed,
            moodBefore: this.convertMoodType(data.moodBefore),
            title: data.title,
            type: data.type,
            status: base_wellness_session_model_1.WellnessSessionStatus.Active
        });
        // Initialize analytics
        await this.sessionAnalyticsService.createSessionAnalytics({
            userId: new mongoose_1.default.Types.ObjectId(userId),
            sessionId: session._id,
            meditationId: new mongoose_1.default.Types.ObjectId(data.meditationId),
            startTime: session.startTime,
            duration: data.duration,
            durationCompleted: data.durationCompleted || 0,
            completed: data.completed,
            moodBefore: data.moodBefore,
            interruptions: 0,
            maintainedStreak: false
        });
        return {
            sessionId: session._id.toString(),
            status: session.status || base_wellness_session_model_1.WellnessSessionStatus.Active
        };
    }
    async recordInterruption(sessionId) {
        const session = await meditation_session_model_1.MeditationSession.findById(sessionId);
        if (!session) {
            throw new errors_1.NotFoundError('Session not found');
        }
        if (session.status !== base_wellness_session_model_1.WellnessSessionStatus.Active) {
            throw new errors_1.BadRequestError('Session is not active');
        }
        session.interruptions = (session.interruptions || 0) + 1;
        await session.save();
        await this.sessionAnalyticsService.updateSessionAnalytics(sessionId, {
            interruptions: session.interruptions
        });
    }
    async endSession(sessionId, moodAfter, notes) {
        const session = await meditation_session_model_1.MeditationSession.findById(sessionId);
        if (!session) {
            throw new errors_1.NotFoundError('Session not found');
        }
        if (session.status !== base_wellness_session_model_1.WellnessSessionStatus.Active) {
            throw new errors_1.BadRequestError('Session is not active');
        }
        const endTime = new Date();
        const durationCompleted = Math.floor((endTime.getTime() - session.startTime.getTime()) / 60000);
        session.status = base_wellness_session_model_1.WellnessSessionStatus.Completed;
        session.endTime = endTime;
        session.durationCompleted = durationCompleted;
        await session.save();
        const focusScore = this.calculateFocusScore(session);
        await this.sessionAnalyticsService.updateSessionAnalytics(sessionId, {
            endTime,
            moodAfter,
            notes,
            completed: true,
            focusScore,
            durationCompleted
        });
    }
    async getActiveSession(userId) {
        return meditation_session_model_1.MeditationSession.findOne({
            userId: new mongoose_1.default.Types.ObjectId(userId),
            status: base_wellness_session_model_1.WellnessSessionStatus.Active
        });
    }
    calculateFocusScore(session) {
        const baseScore = 100;
        const interruptionPenalty = 5;
        const score = baseScore - (session.interruptions || 0) * interruptionPenalty;
        return Math.max(0, Math.min(100, score));
    }
    async completeSession(sessionId, data) {
        const session = await meditation_session_model_1.MeditationSession.findById(sessionId);
        if (!session) {
            throw new errors_1.NotFoundError('Session not found');
        }
        if (session.status === base_wellness_session_model_1.WellnessSessionStatus.Completed) {
            throw new errors_1.ValidationError('Session is already completed');
        }
        const endTime = new Date();
        const focusScore = this.calculateFocusScore(session);
        session.endTime = endTime;
        session.status = base_wellness_session_model_1.WellnessSessionStatus.Completed;
        session.completed = data.completed;
        session.duration = data.duration;
        session.durationCompleted = data.durationCompleted;
        session.moodAfter = this.convertMoodType(data.moodAfter);
        session.interruptions = data.interruptions || session.interruptions;
        session.notes = data.notes;
        await session.save();
        // Update analytics
        await this.sessionAnalyticsService.updateSessionAnalytics(sessionId, {
            endTime,
            duration: data.duration,
            durationCompleted: data.durationCompleted,
            moodBefore: data.moodBefore,
            moodAfter: data.moodAfter,
            interruptions: session.interruptions,
            notes: data.notes,
            completed: data.completed,
            focusScore
        });
        return session;
    }
    // Helper method to convert between mood types
    convertMoodType(mood) {
        if (!mood)
            return undefined;
        return moodMap[mood.toLowerCase()];
    }
    async createSession(data) {
        const userId = typeof data.userId === 'string' ? new mongoose_1.default.Types.ObjectId(data.userId) : data.userId;
        const meditationId = data.meditationId ?
            (typeof data.meditationId === 'string' ? new mongoose_1.default.Types.ObjectId(data.meditationId) : data.meditationId) :
            undefined;
        const session = await meditation_session_model_1.MeditationSession.create({
            userId,
            meditationId,
            startTime: new Date(),
            duration: data.duration,
            type: data.type,
            title: data.title,
            moodBefore: this.convertMoodType(data.moodBefore),
            status: base_wellness_session_model_1.WellnessSessionStatus.Active
        });
        return session;
    }
    async getUserSessions(userId, limit = 10) {
        if (!mongoose_2.Types.ObjectId.isValid(userId)) {
            throw new errors_1.BadRequestError('Invalid user ID');
        }
        return await meditation_session_model_1.MeditationSession.find({ userId })
            .sort({ startTime: -1 })
            .limit(limit)
            .exec();
    }
    static async createSession(data) {
        const service = new MeditationSessionService();
        return service.createSession(data);
    }
    static async getUserSessions(userId, limit = 10) {
        const service = new MeditationSessionService();
        return service.getUserSessions(userId, limit);
    }
    static async recordInterruption(sessionId) {
        const service = new MeditationSessionService();
        await service.recordInterruption(sessionId);
        return meditation_session_model_1.MeditationSession.findById(sessionId);
    }
    async getAllSessions(userId, query) {
        if (!mongoose_2.Types.ObjectId.isValid(userId)) {
            throw new errors_1.BadRequestError('Invalid user ID');
        }
        const filter = { userId: new mongoose_1.default.Types.ObjectId(userId) };
        // Apply filters based on query parameters
        if (query.status) {
            filter.status = query.status;
        }
        if (query.type) {
            filter.type = query.type;
        }
        if (query.startDate || query.endDate) {
            filter.startTime = {};
            if (query.startDate) {
                filter.startTime.$gte = new Date(query.startDate);
            }
            if (query.endDate) {
                filter.startTime.$lte = new Date(query.endDate);
            }
        }
        // Apply sorting
        const sort = {};
        if (query.sortBy) {
            sort[query.sortBy] = query.sortOrder === 'desc' ? -1 : 1;
        }
        else {
            sort.startTime = -1; // Default sort by start time descending
        }
        // Apply pagination
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 10;
        const skip = (page - 1) * limit;
        return await meditation_session_model_1.MeditationSession.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .exec();
    }
    async getSessionById(sessionId) {
        if (!mongoose_2.Types.ObjectId.isValid(sessionId)) {
            throw new errors_1.BadRequestError('Invalid session ID');
        }
        const session = await meditation_session_model_1.MeditationSession.findById(sessionId);
        if (!session) {
            throw new errors_1.NotFoundError('Session not found');
        }
        return session;
    }
    async updateSession(sessionId, userId, data) {
        if (!mongoose_2.Types.ObjectId.isValid(sessionId)) {
            throw new errors_1.BadRequestError('Invalid session ID');
        }
        if (!mongoose_2.Types.ObjectId.isValid(userId)) {
            throw new errors_1.BadRequestError('Invalid user ID');
        }
        const session = await meditation_session_model_1.MeditationSession.findOne({
            _id: sessionId,
            userId: userId
        });
        if (!session) {
            throw new errors_1.NotFoundError('Session not found');
        }
        // Update allowed fields
        if (data.duration)
            session.duration = data.duration;
        if (data.type)
            session.type = data.type;
        if (data.title)
            session.title = data.title;
        if (data.notes)
            session.notes = data.notes;
        if (data.moodBefore)
            session.moodBefore = this.convertMoodType(data.moodBefore);
        if (data.moodAfter)
            session.moodAfter = this.convertMoodType(data.moodAfter);
        await session.save();
        return session;
    }
    async getUserStats(userId) {
        if (!mongoose_2.Types.ObjectId.isValid(userId)) {
            throw new errors_1.BadRequestError('Invalid user ID');
        }
        const sessions = await meditation_session_model_1.MeditationSession.find({
            userId: new mongoose_1.default.Types.ObjectId(userId),
            status: base_wellness_session_model_1.WellnessSessionStatus.Completed
        });
        if (!sessions.length) {
            return {
                totalSessions: 0,
                totalMinutes: 0,
                averageDuration: 0,
                currentStreak: 0,
                longestStreak: 0,
                completionRate: 0,
                mostCommonType: null,
                moodImprovementRate: 0
            };
        }
        const totalSessions = sessions.length;
        const totalMinutes = sessions.reduce((acc, session) => acc + session.duration, 0);
        const averageDuration = totalMinutes / totalSessions;
        const currentStreak = await this.calculateStreak(userId);
        // Calculate completion rate
        const allSessions = await meditation_session_model_1.MeditationSession.find({ userId: new mongoose_1.default.Types.ObjectId(userId) });
        const completionRate = (sessions.length / allSessions.length) * 100;
        // Find most common type
        const typeCount = {};
        sessions.forEach(session => {
            if (session.type) {
                typeCount[session.type] = (typeCount[session.type] || 0) + 1;
            }
        });
        const mostCommonType = Object.entries(typeCount).reduce((a, b) => a[1] > b[1] ? a : b)[0];
        // Calculate mood improvement rate
        const sessionsWithMood = sessions.filter(session => session.moodBefore && session.moodAfter);
        const improvedSessions = sessionsWithMood.filter(session => this.hasMoodImproved(session));
        const moodImprovementRate = sessionsWithMood.length > 0
            ? (improvedSessions.length / sessionsWithMood.length) * 100
            : 0;
        return {
            totalSessions,
            totalMinutes,
            averageDuration,
            currentStreak,
            completionRate,
            mostCommonType,
            moodImprovementRate
        };
    }
    async updateSessionStatus(sessionId, status) {
        if (!mongoose_2.Types.ObjectId.isValid(sessionId)) {
            throw new errors_1.BadRequestError('Invalid session ID');
        }
        const session = await meditation_session_model_1.MeditationSession.findById(sessionId);
        if (!session) {
            throw new errors_1.NotFoundError('Session not found');
        }
        session.status = status;
        await session.save();
        return session;
    }
    async deleteSession(sessionId) {
        if (!mongoose_2.Types.ObjectId.isValid(sessionId)) {
            throw new errors_1.BadRequestError('Invalid session ID');
        }
        const session = await meditation_session_model_1.MeditationSession.findById(sessionId);
        if (!session) {
            throw new errors_1.NotFoundError('Session not found');
        }
        await session.deleteOne();
    }
    async calculateStreak(userId) {
        if (!mongoose_2.Types.ObjectId.isValid(userId)) {
            throw new errors_1.BadRequestError('Invalid user ID');
        }
        const sessions = await meditation_session_model_1.MeditationSession.find({
            userId,
            status: base_wellness_session_model_1.WellnessSessionStatus.Completed
        })
            .sort({ startTime: -1 })
            .exec();
        if (sessions.length === 0)
            return 0;
        let streak = 1;
        let currentDate = new Date(sessions[0].startTime);
        currentDate.setHours(0, 0, 0, 0);
        for (let i = 1; i < sessions.length; i++) {
            const sessionDate = new Date(sessions[i].startTime);
            sessionDate.setHours(0, 0, 0, 0);
            const dayDifference = Math.floor((currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
            if (dayDifference === 1) {
                streak++;
                currentDate = sessionDate;
            }
            else if (dayDifference > 1) {
                break;
            }
        }
        return streak;
    }
    hasMoodImproved(session) {
        if (!session.moodBefore || !session.moodAfter)
            return false;
        return moodValues[session.moodAfter] > moodValues[session.moodBefore];
    }
}
exports.MeditationSessionService = MeditationSessionService;
