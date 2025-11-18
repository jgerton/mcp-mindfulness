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
const mongoose_1 = __importDefault(require("mongoose"));
const session_analytics_model_1 = require("../models/session-analytics.model");
const db_helper_1 = require("./helpers/db.helper");
describe('SessionAnalytics Model Test', () => {
    let userId;
    let meditationId;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_helper_1.connectDB)();
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_helper_1.disconnectDB)();
    }));
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_helper_1.clearDB)();
        userId = new mongoose_1.default.Types.ObjectId();
        meditationId = new mongoose_1.default.Types.ObjectId();
    }));
    it('should create & save session analytics successfully', () => __awaiter(void 0, void 0, void 0, function* () {
        const validSessionAnalytics = {
            userId,
            sessionId: new mongoose_1.default.Types.ObjectId(),
            meditationId,
            startTime: new Date(),
            duration: 15,
            durationCompleted: 15,
            completed: true,
            moodBefore: 'neutral',
            moodAfter: 'calm',
            focusScore: 8,
            interruptions: 2,
            notes: 'Test session',
            maintainedStreak: true
        };
        const savedSessionAnalytics = yield new session_analytics_model_1.SessionAnalytics(validSessionAnalytics).save();
        expect(savedSessionAnalytics._id).toBeDefined();
        expect(savedSessionAnalytics.userId.toString()).toBe(userId.toString());
        expect(savedSessionAnalytics.moodBefore).toBe('neutral');
        expect(savedSessionAnalytics.moodAfter).toBe('calm');
    }));
    it('should fail to save with invalid mood values', () => __awaiter(void 0, void 0, void 0, function* () {
        const sessionAnalyticsWithInvalidMood = new session_analytics_model_1.SessionAnalytics({
            userId,
            meditationId,
            duration: 600,
            focusScore: 8,
            moodBefore: 'invalid_mood',
            moodAfter: 'invalid_mood',
            interruptions: 0,
            notes: 'Test session',
            completed: true,
            startTime: new Date(),
            date: new Date()
        });
        yield expect(sessionAnalyticsWithInvalidMood.save()).rejects.toThrow();
    }));
    it('should fail to save without required fields', () => __awaiter(void 0, void 0, void 0, function* () {
        const sessionAnalyticsWithoutRequired = new session_analytics_model_1.SessionAnalytics({
            userId,
            duration: 600
        });
        yield expect(sessionAnalyticsWithoutRequired.save()).rejects.toThrow();
    }));
    it('should enforce duration minimum value', () => __awaiter(void 0, void 0, void 0, function* () {
        const sessionAnalyticsWithShortDuration = new session_analytics_model_1.SessionAnalytics({
            userId,
            meditationId,
            duration: 0,
            focusScore: 8,
            moodBefore: 'neutral',
            moodAfter: 'happy',
            interruptions: 0,
            notes: 'Test session',
            completed: true,
            startTime: new Date(),
            date: new Date()
        });
        yield expect(sessionAnalyticsWithShortDuration.save()).rejects.toThrow();
    }));
    it('should enforce focus score range', () => __awaiter(void 0, void 0, void 0, function* () {
        const sessionAnalyticsWithInvalidScore = new session_analytics_model_1.SessionAnalytics({
            userId,
            meditationId,
            duration: 600,
            focusScore: 11,
            moodBefore: 'neutral',
            moodAfter: 'happy',
            interruptions: 0,
            notes: 'Test session',
            completed: true,
            startTime: new Date(),
            date: new Date()
        });
        yield expect(sessionAnalyticsWithInvalidScore.save()).rejects.toThrow();
    }));
});
