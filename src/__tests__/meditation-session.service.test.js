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
const meditation_session_service_1 = require("../services/meditation-session.service");
const meditation_session_model_1 = require("../models/meditation-session.model");
const user_model_1 = require("../models/user.model");
const session_analytics_model_1 = require("../models/session-analytics.model");
let mongoServer;
describe('MeditationSessionService', () => {
    let meditationSessionService;
    let userId;
    let guidedMeditationId;
    let testUser;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        if (!mongoose_1.default.connection.readyState) {
            yield mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test');
        }
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        if (mongoose_1.default.connection.readyState) {
            yield mongoose_1.default.connection.close();
        }
    }));
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield mongoose_1.default.connection.dropDatabase();
        meditationSessionService = new meditation_session_service_1.MeditationSessionService();
        userId = new mongoose_1.default.Types.ObjectId();
        guidedMeditationId = new mongoose_1.default.Types.ObjectId();
        testUser = yield user_model_1.User.create({
            email: 'test@example.com',
            password: 'password123',
            username: 'testuser'
        });
    }));
    describe('startSession', () => {
        it('should create a new session', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield meditationSessionService.startSession(userId.toString(), {
                meditationId: guidedMeditationId.toString(),
                title: 'Test Meditation Session',
                type: 'guided',
                completed: false,
                duration: 600,
                durationCompleted: 0,
                moodBefore: 'neutral'
            });
            expect(result.status).toBe('active');
            expect(result.sessionId).toBeDefined();
            const session = yield meditation_session_model_1.MeditationSession.findById(result.sessionId);
            expect(session).toBeDefined();
            expect(session === null || session === void 0 ? void 0 : session.status).toBe('active');
            expect(session === null || session === void 0 ? void 0 : session.userId.toString()).toBe(userId.toString());
            if (session === null || session === void 0 ? void 0 : session.guidedMeditationId) {
                expect(session.guidedMeditationId.toString()).toBe(guidedMeditationId.toString());
            }
            expect(session === null || session === void 0 ? void 0 : session.startTime).toBeDefined();
            expect(session === null || session === void 0 ? void 0 : session.interruptions).toBe(0);
            expect(session === null || session === void 0 ? void 0 : session.completed).toBe(false);
        }));
    });
    describe('completeSession', () => {
        it('should complete an existing session', () => __awaiter(void 0, void 0, void 0, function* () {
            const { sessionId } = yield meditationSessionService.startSession(userId.toString(), {
                meditationId: guidedMeditationId.toString(),
                title: 'Test Meditation Session',
                type: 'guided',
                completed: false,
                duration: 600,
                durationCompleted: 0,
                moodBefore: 'anxious'
            });
            const completedSession = yield meditationSessionService.completeSession(sessionId, {
                duration: 15,
                durationCompleted: 15,
                moodBefore: 'anxious',
                moodAfter: 'peaceful',
                interruptions: 0,
                notes: 'Great session',
                completed: true
            });
            expect(completedSession.status).toBe('completed');
            expect(completedSession.endTime).toBeDefined();
            expect(completedSession.duration).toBe(15);
            expect(completedSession.durationCompleted).toBe(15);
            expect(completedSession.moodBefore).toBe('anxious');
            expect(completedSession.moodAfter).toBe('peaceful');
            expect(completedSession.interruptions).toBe(0);
            expect(completedSession.notes).toBe('Great session');
            expect(completedSession.completed).toBe(true);
        }));
        it('should throw error for invalid session id', () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidId = new mongoose_1.default.Types.ObjectId();
            yield expect(meditationSessionService.completeSession(invalidId.toString(), {
                duration: 15,
                durationCompleted: 15,
                moodAfter: 'peaceful',
                interruptions: 0,
                completed: true
            })).rejects.toThrow('Session not found');
        }));
    });
    describe('getActiveSession', () => {
        it('should return active session for user', () => __awaiter(void 0, void 0, void 0, function* () {
            yield meditationSessionService.startSession(userId.toString(), {
                meditationId: guidedMeditationId.toString(),
                title: 'Test Meditation Session',
                type: 'guided',
                completed: false,
                duration: 600,
                durationCompleted: 0,
                moodBefore: 'neutral'
            });
            const activeSession = yield meditationSessionService.getActiveSession(userId.toString());
            expect(activeSession).toBeDefined();
            expect(activeSession === null || activeSession === void 0 ? void 0 : activeSession.status).toBe('active');
            expect(activeSession === null || activeSession === void 0 ? void 0 : activeSession.userId.toString()).toBe(userId.toString());
        }));
        it('should return null if no active session exists', () => __awaiter(void 0, void 0, void 0, function* () {
            const activeSession = yield meditationSessionService.getActiveSession(userId.toString());
            expect(activeSession).toBeNull();
        }));
    });
    describe('recordInterruption', () => {
        it('should increment interruption count', () => __awaiter(void 0, void 0, void 0, function* () {
            const { sessionId } = yield meditationSessionService.startSession(userId.toString(), {
                meditationId: guidedMeditationId.toString(),
                title: 'Test Meditation Session',
                type: 'guided',
                completed: false,
                duration: 600,
                durationCompleted: 0,
                moodBefore: 'neutral'
            });
            yield meditationSessionService.recordInterruption(sessionId);
            const session = yield meditation_session_model_1.MeditationSession.findById(sessionId);
            expect(session === null || session === void 0 ? void 0 : session.interruptions).toBe(1);
            const analytics = yield session_analytics_model_1.SessionAnalytics.findOne({ sessionId: new mongoose_1.default.Types.ObjectId(sessionId) });
            expect(analytics === null || analytics === void 0 ? void 0 : analytics.interruptions).toBe(1);
        }));
    });
    it('should create a new meditation session', () => __awaiter(void 0, void 0, void 0, function* () {
        const session = yield meditationSessionService.createSession({
            userId: testUser._id,
            duration: 600,
            type: 'guided'
        });
        expect(session).toBeDefined();
        expect(session.userId).toEqual(testUser._id);
        expect(session.duration).toBe(600);
    }));
    it('should retrieve user sessions', () => __awaiter(void 0, void 0, void 0, function* () {
        yield meditationSessionService.createSession({
            userId: testUser._id,
            duration: 600,
            type: 'guided'
        });
        const sessions = yield meditationSessionService.getUserSessions(testUser._id);
        expect(sessions.length).toBeGreaterThan(0);
    }));
});
