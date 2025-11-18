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
exports.MeditationSessionService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const session_analytics_service_1 = require("./session-analytics.service");
const meditation_session_model_1 = require("../models/meditation-session.model");
const session_analytics_model_1 = require("../models/session-analytics.model");
const errors_1 = require("../utils/errors");
const error_codes_1 = require("../utils/error-codes");
const base_wellness_session_model_1 = require("../models/base-wellness-session.model");
class MeditationSessionService {
    constructor() {
        this.sessionAnalyticsService = new session_analytics_service_1.SessionAnalyticsService();
    }
    startSession(userId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const activeSession = yield this.getActiveSession(userId);
            if (activeSession) {
                throw new errors_1.SessionError('Active session already exists', error_codes_1.ErrorCodes.SESSION_ALREADY_EXISTS, { userId });
            }
            const session = yield meditation_session_model_1.MeditationSession.create({
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
            yield this.sessionAnalyticsService.createSessionAnalytics({
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
        });
    }
    recordInterruption(sessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield meditation_session_model_1.MeditationSession.findById(sessionId);
            if (!session) {
                throw new errors_1.NotFoundError('Session not found', { sessionId });
            }
            if (session.status !== base_wellness_session_model_1.WellnessSessionStatus.Active) {
                throw new errors_1.SessionError('Session is not active', error_codes_1.ErrorCodes.SESSION_NOT_ACTIVE, { sessionId, currentStatus: session.status });
            }
            session.interruptions = (session.interruptions || 0) + 1;
            yield session.save();
            yield this.sessionAnalyticsService.updateSessionAnalytics(sessionId, {
                interruptions: session.interruptions
            });
        });
    }
    endSession(sessionId, moodAfter, notes) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield meditation_session_model_1.MeditationSession.findById(sessionId);
            if (!session) {
                throw new Error('Session not found');
            }
            if (session.status !== base_wellness_session_model_1.WellnessSessionStatus.Active) {
                throw new Error('Session is not active');
            }
            const endTime = new Date();
            const durationCompleted = Math.floor((endTime.getTime() - session.startTime.getTime()) / 60000);
            session.status = base_wellness_session_model_1.WellnessSessionStatus.Completed;
            session.endTime = endTime;
            session.durationCompleted = durationCompleted;
            yield session.save();
            const focusScore = this.calculateFocusScore(session);
            yield this.sessionAnalyticsService.updateSessionAnalytics(sessionId, {
                endTime,
                moodAfter,
                notes,
                completed: true,
                focusScore,
                durationCompleted
            });
        });
    }
    getActiveSession(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return meditation_session_model_1.MeditationSession.findOne({
                userId: new mongoose_1.default.Types.ObjectId(userId),
                status: base_wellness_session_model_1.WellnessSessionStatus.Active
            });
        });
    }
    calculateFocusScore(session) {
        const baseScore = 100;
        const interruptionPenalty = 5;
        const score = baseScore - (session.interruptions || 0) * interruptionPenalty;
        return Math.max(0, Math.min(100, score));
    }
    completeSession(sessionId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield meditation_session_model_1.MeditationSession.findById(sessionId);
            if (!session) {
                throw new errors_1.NotFoundError('Session not found', { sessionId });
            }
            if (session.status === base_wellness_session_model_1.WellnessSessionStatus.Completed) {
                throw new errors_1.SessionError('Session is already completed', error_codes_1.ErrorCodes.SESSION_ALREADY_COMPLETED, { sessionId });
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
            yield session.save();
            // Update analytics
            yield this.sessionAnalyticsService.updateSessionAnalytics(sessionId, {
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
        });
    }
    // Helper method to convert between mood types
    convertMoodType(mood) {
        if (!mood)
            return undefined;
        const moodMap = {
            'anxious': base_wellness_session_model_1.WellnessMoodState.Anxious,
            'stressed': base_wellness_session_model_1.WellnessMoodState.Stressed,
            'neutral': base_wellness_session_model_1.WellnessMoodState.Neutral,
            'calm': base_wellness_session_model_1.WellnessMoodState.Calm,
            'peaceful': base_wellness_session_model_1.WellnessMoodState.Peaceful
        };
        return moodMap[mood];
    }
    // Add these methods to fix the test failures
    createSession(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield meditation_session_model_1.MeditationSession.create({
                userId: data.userId,
                title: data.title || 'Meditation Session',
                type: data.type,
                startTime: new Date(),
                duration: data.duration,
                durationCompleted: 0,
                status: base_wellness_session_model_1.WellnessSessionStatus.Active,
                interruptions: 0,
                completed: false,
                // Add any other required fields
            });
            return session;
        });
    }
    getUserSessions(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return meditation_session_model_1.MeditationSession.find({ userId });
        });
    }
    static recordInterruption(sessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield meditation_session_model_1.MeditationSession.findById(sessionId);
            if (!session)
                return null;
            session.interruptions = (session.interruptions || 0) + 1;
            yield session.save();
            yield session_analytics_model_1.SessionAnalytics.findOneAndUpdate({ sessionId: session._id }, { $inc: { interruptions: 1 } });
            return session;
        });
    }
    getAllSessions(userId, query) {
        return __awaiter(this, void 0, void 0, function* () {
            const filter = {
                userId: new mongoose_1.default.Types.ObjectId(userId)
            };
            if (query.completed !== undefined) {
                filter.completed = query.completed;
            }
            if (query.meditationId) {
                filter.meditationId = new mongoose_1.default.Types.ObjectId(query.meditationId);
            }
            if (query.type) {
                filter.type = query.type;
            }
            if (query.category) {
                filter.category = query.category;
            }
            if (query.startDate) {
                filter.startTime = { $gte: new Date(query.startDate) };
            }
            if (query.endDate) {
                filter.endTime = { $lte: new Date(query.endDate) };
            }
            if (query.minDuration) {
                filter.duration = { $gte: query.minDuration };
            }
            if (query.maxDuration) {
                filter.duration = Object.assign(Object.assign({}, filter.duration), { $lte: query.maxDuration });
            }
            if (query.moodBefore) {
                filter.moodBefore = query.moodBefore;
            }
            if (query.moodAfter) {
                filter.moodAfter = query.moodAfter;
            }
            const sort = {};
            if (query.sortBy) {
                sort[query.sortBy] = query.sortOrder === 'desc' ? -1 : 1;
            }
            else {
                sort.startTime = -1; // Default sort by start time descending
            }
            return meditation_session_model_1.MeditationSession.find(filter).sort(sort).limit(query.limit || 50);
        });
    }
    getSessionById(sessionId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return meditation_session_model_1.MeditationSession.findOne({
                _id: new mongoose_1.default.Types.ObjectId(sessionId),
                userId: new mongoose_1.default.Types.ObjectId(userId)
            });
        });
    }
    updateSession(sessionId, userId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield meditation_session_model_1.MeditationSession.findOneAndUpdate({
                _id: new mongoose_1.default.Types.ObjectId(sessionId),
                userId: new mongoose_1.default.Types.ObjectId(userId)
            }, { $set: data }, { new: true });
            if (!session) {
                return null;
            }
            // Update analytics if session is completed
            if (data.completed) {
                yield session_analytics_model_1.SessionAnalytics.findOneAndUpdate({ sessionId: new mongoose_1.default.Types.ObjectId(sessionId) }, { $set: data });
            }
            return session;
        });
    }
    getUserStats(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const totalSessions = yield meditation_session_model_1.MeditationSession.countDocuments({
                userId: new mongoose_1.default.Types.ObjectId(userId)
            });
            const completedSessions = yield meditation_session_model_1.MeditationSession.countDocuments({
                userId: new mongoose_1.default.Types.ObjectId(userId),
                completed: true
            });
            const totalDuration = yield meditation_session_model_1.MeditationSession.aggregate([
                {
                    $match: {
                        userId: new mongoose_1.default.Types.ObjectId(userId),
                        completed: true
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: '$duration' }
                    }
                }
            ]);
            const averageDuration = yield meditation_session_model_1.MeditationSession.aggregate([
                {
                    $match: {
                        userId: new mongoose_1.default.Types.ObjectId(userId),
                        completed: true
                    }
                },
                {
                    $group: {
                        _id: null,
                        average: { $avg: '$duration' }
                    }
                }
            ]);
            return {
                totalSessions,
                completedSessions,
                totalDuration: ((_a = totalDuration[0]) === null || _a === void 0 ? void 0 : _a.total) || 0,
                averageDuration: ((_b = averageDuration[0]) === null || _b === void 0 ? void 0 : _b.average) || 0
            };
        });
    }
}
exports.MeditationSessionService = MeditationSessionService;
