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
const session_analytics_service_1 = require("../services/session-analytics.service");
const session_analytics_model_1 = require("../models/session-analytics.model");
const user_model_1 = require("../models/user.model");
const meditation_model_1 = require("../models/meditation.model");
const meditation_session_model_1 = require("../models/meditation-session.model");
describe('SessionAnalyticsService', () => {
    let userId;
    let meditationId;
    let sessionId1;
    let sessionId2;
    let service;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield mongoose_1.default.connection.dropDatabase();
        service = new session_analytics_service_1.SessionAnalyticsService();
        // Create test user and meditation
        const user = yield user_model_1.User.create({
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123'
        });
        userId = user._id;
        const meditation = yield meditation_model_1.Meditation.create({
            title: 'Test Meditation',
            description: 'Test Description',
            audioUrl: 'test.mp3',
            duration: 10,
            difficulty: 'beginner',
            category: 'mindfulness',
            type: 'guided'
        });
        meditationId = meditation._id;
        // Create test sessions with analytics
        const session1 = yield meditation_session_model_1.MeditationSession.create({
            userId,
            title: 'Test Meditation Session 1',
            type: 'guided',
            guidedMeditationId: meditationId,
            startTime: new Date('2024-03-12T10:00:00'),
            endTime: new Date('2024-03-12T10:10:00'),
            duration: 10,
            durationCompleted: 10,
            status: 'completed',
            interruptions: 0,
            completed: true
        });
        sessionId1 = session1._id.toString();
        const session2 = yield meditation_session_model_1.MeditationSession.create({
            userId,
            title: 'Test Meditation Session 2',
            type: 'guided',
            guidedMeditationId: meditationId,
            startTime: new Date('2024-03-12T11:00:00'),
            endTime: new Date('2024-03-12T11:10:00'),
            duration: 10,
            durationCompleted: 8,
            status: 'completed',
            interruptions: 1,
            completed: true
        });
        sessionId2 = session2._id.toString();
        // Create session analytics records
        yield session_analytics_model_1.SessionAnalytics.create({
            userId,
            sessionId: session1._id,
            meditationId,
            startTime: new Date('2024-03-12T10:00:00'),
            endTime: new Date('2024-03-12T10:10:00'),
            duration: 10,
            durationCompleted: 10,
            completed: true,
            focusScore: 95,
            moodBefore: 'stressed',
            moodAfter: 'calm',
            interruptions: 0,
            maintainedStreak: true
        });
        yield session_analytics_model_1.SessionAnalytics.create({
            userId,
            sessionId: session2._id,
            meditationId,
            startTime: new Date('2024-03-12T11:00:00'),
            endTime: new Date('2024-03-12T11:10:00'),
            duration: 12,
            durationCompleted: 12,
            completed: true,
            focusScore: 85,
            moodBefore: 'anxious',
            moodAfter: 'peaceful',
            interruptions: 1,
            maintainedStreak: true
        });
    }));
    describe('getUserSessionHistory', () => {
        it('should return paginated session history', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield service.getUserSessionHistory(userId.toString(), { page: 1, limit: 10 });
            expect(result.sessions).toBeDefined();
            expect(result.sessions.length).toBe(2);
            expect(result.totalPages).toBe(1);
            expect(result.totalSessions).toBe(2);
        }));
    });
    describe('getUserStats', () => {
        it('should calculate user statistics correctly', () => __awaiter(void 0, void 0, void 0, function* () {
            const stats = yield service.getUserStats(userId.toString());
            expect(stats.totalSessions).toBe(2);
            expect(stats.totalMinutes).toBe(22); // 10 + 12 minutes completed
            expect(stats.averageFocusScore).toBe(90); // (95 + 85) / 2
            expect(stats.totalInterruptions).toBe(1);
        }));
    });
    describe('getMoodImprovementStats', () => {
        it('should calculate mood improvement statistics', () => __awaiter(void 0, void 0, void 0, function* () {
            const startTime = new Date('2024-03-12T00:00:00');
            const stats = yield service.getMoodImprovementStats(userId.toString(), startTime);
            expect(stats.totalSessions).toBe(2);
            expect(stats.totalImproved).toBe(2);
            expect(stats.improvementRate).toBe(100);
        }));
    });
});
