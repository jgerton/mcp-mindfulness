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
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("../app");
const user_model_1 = require("../models/user.model");
const meditation_model_1 = require("../models/meditation.model");
const meditation_session_model_1 = require("../models/meditation-session.model");
const session_analytics_model_1 = require("../models/session-analytics.model");
const jwt_utils_1 = require("../utils/jwt.utils");
describe('Session Analytics Integration', () => {
    let userId;
    let meditationId;
    let token;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield mongoose_1.default.connection.dropDatabase();
        // Create test user
        const user = yield user_model_1.User.create({
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123'
        });
        userId = user._id.toString();
        token = (0, jwt_utils_1.generateToken)(user._id.toString(), user.username);
        // Create test meditation
        const meditation = yield meditation_model_1.Meditation.create({
            title: 'Test Meditation',
            description: 'Test Description',
            audioUrl: 'test.mp3',
            duration: 10,
            type: 'guided',
            difficulty: 'beginner',
            category: 'mindfulness',
            tags: ['test']
        });
        meditationId = meditation._id.toString();
    }));
    describe('Meditation Session Flow', () => {
        it('should complete meditation session flow', () => __awaiter(void 0, void 0, void 0, function* () {
            // Create a meditation session
            const response = yield (0, supertest_1.default)(app_1.app)
                .post('/api/meditation-sessions')
                .set('Authorization', `Bearer ${token}`)
                .send({
                meditationId,
                duration: 10,
                completed: false,
                moodBefore: 'anxious'
            });
            expect(response.status).toBe(201);
            const sessionId = response.body.sessionId;
            // Complete the session
            const endResponse = yield (0, supertest_1.default)(app_1.app)
                .post(`/api/meditation-sessions/${sessionId}/complete`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                duration: 10,
                durationCompleted: 10,
                completed: true,
                moodAfter: 'peaceful',
                notes: 'Test session completed'
            });
            expect(endResponse.status).toBe(200);
            expect(endResponse.body.status).toBe('completed');
            // Get session history
            const historyResponse = yield (0, supertest_1.default)(app_1.app)
                .get('/api/analytics/history')
                .set('Authorization', `Bearer ${token}`);
            expect(historyResponse.status).toBe(200);
            expect(historyResponse.body.sessions).toHaveLength(1);
        }));
        it('should handle invalid session ID', () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidId = new mongoose_1.default.Types.ObjectId().toString();
            const response = yield (0, supertest_1.default)(app_1.app)
                .post(`/api/meditation-sessions/${invalidId}/complete`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                duration: 10,
                durationCompleted: 10,
                completed: true,
                moodAfter: 'peaceful',
                notes: 'Test session completed'
            });
            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Session not found');
        }));
        it('should prevent concurrent session creation', () => __awaiter(void 0, void 0, void 0, function* () {
            // Create first session
            yield (0, supertest_1.default)(app_1.app)
                .post('/api/meditation-sessions')
                .set('Authorization', `Bearer ${token}`)
                .send({
                meditationId,
                duration: 10,
                completed: false,
                moodBefore: 'anxious'
            });
            // Attempt to create second session
            const response = yield (0, supertest_1.default)(app_1.app)
                .post('/api/meditation-sessions')
                .set('Authorization', `Bearer ${token}`)
                .send({
                meditationId,
                duration: 10,
                completed: false,
                moodBefore: 'anxious'
            });
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Active session already exists');
        }));
    });
    describe('Analytics Endpoints', () => {
        it('should retrieve session history with pagination', () => __awaiter(void 0, void 0, void 0, function* () {
            // Create and complete a session
            const startTime = new Date(Date.now() - 3600000); // 1 hour ago
            const endTime = new Date(); // now
            const session = yield meditation_session_model_1.MeditationSession.create({
                userId: new mongoose_1.default.Types.ObjectId(userId),
                meditationId: new mongoose_1.default.Types.ObjectId(meditationId),
                startTime: startTime,
                endTime: endTime,
                status: 'completed',
                interruptions: 0,
                duration: 10,
                durationCompleted: 10,
                completed: true,
                moodBefore: 'anxious',
                moodAfter: 'peaceful'
            });
            yield session_analytics_model_1.SessionAnalytics.create({
                userId: new mongoose_1.default.Types.ObjectId(userId),
                meditationId: new mongoose_1.default.Types.ObjectId(meditationId),
                sessionId: session._id,
                startTime: startTime,
                duration: 10,
                durationCompleted: 10,
                completed: true,
                interruptions: 0,
                maintainedStreak: false,
                moodBefore: 'anxious',
                moodAfter: 'peaceful'
            });
            const response = yield (0, supertest_1.default)(app_1.app)
                .get('/api/analytics/history')
                .set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(200);
            expect(response.body.sessions).toHaveLength(1);
        }));
        it('should retrieve user statistics', () => __awaiter(void 0, void 0, void 0, function* () {
            // Create and complete a session
            const startTime = new Date(Date.now() - 3600000); // 1 hour ago
            const endTime = new Date(); // now
            const session = yield meditation_session_model_1.MeditationSession.create({
                userId: new mongoose_1.default.Types.ObjectId(userId),
                meditationId: new mongoose_1.default.Types.ObjectId(meditationId),
                startTime: startTime,
                endTime: endTime,
                status: 'completed',
                interruptions: 0,
                duration: 10,
                durationCompleted: 10,
                completed: true,
                moodBefore: 'anxious',
                moodAfter: 'peaceful'
            });
            yield session_analytics_model_1.SessionAnalytics.create({
                userId: new mongoose_1.default.Types.ObjectId(userId),
                meditationId: new mongoose_1.default.Types.ObjectId(meditationId),
                sessionId: session._id,
                startTime: startTime,
                duration: 10,
                durationCompleted: 10,
                completed: true,
                interruptions: 0,
                maintainedStreak: false,
                moodBefore: 'anxious',
                moodAfter: 'peaceful'
            });
            const response = yield (0, supertest_1.default)(app_1.app)
                .get('/api/analytics/stats')
                .set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(200);
            expect(response.body.totalSessions).toBe(1);
        }));
        it('should retrieve mood improvement stats', () => __awaiter(void 0, void 0, void 0, function* () {
            // Create and complete a session
            const startTime = new Date(Date.now() - 3600000); // 1 hour ago
            const endTime = new Date(); // now
            const session = yield meditation_session_model_1.MeditationSession.create({
                userId: new mongoose_1.default.Types.ObjectId(userId),
                meditationId: new mongoose_1.default.Types.ObjectId(meditationId),
                startTime: startTime,
                endTime: endTime,
                status: 'completed',
                interruptions: 0,
                duration: 10,
                durationCompleted: 10,
                completed: true,
                moodBefore: 'anxious',
                moodAfter: 'peaceful'
            });
            yield session_analytics_model_1.SessionAnalytics.create({
                userId: new mongoose_1.default.Types.ObjectId(userId),
                meditationId: new mongoose_1.default.Types.ObjectId(meditationId),
                sessionId: session._id,
                startTime: startTime,
                duration: 10,
                durationCompleted: 10,
                completed: true,
                interruptions: 0,
                maintainedStreak: false,
                moodBefore: 'anxious',
                moodAfter: 'peaceful'
            });
            const response = yield (0, supertest_1.default)(app_1.app)
                .get('/api/analytics/mood-stats')
                .set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(200);
            expect(response.body.totalSessions).toBe(1);
            expect(response.body.totalImproved).toBe(1);
            expect(response.body.improvementRate).toBe(100);
        }));
        it('should handle invalid authentication', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.app)
                .get('/api/analytics/history')
                .set('Authorization', 'Bearer invalid-token');
            expect(response.status).toBe(401);
            expect(response.body.error).toBe('Invalid token');
        }));
    });
});
