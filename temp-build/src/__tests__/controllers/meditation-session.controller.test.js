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
// Set NODE_ENV to test
process.env.NODE_ENV = 'test';
const mongoose_1 = __importDefault(require("mongoose"));
const meditation_session_controller_1 = require("../../controllers/meditation-session.controller");
const meditation_session_model_1 = require("../../models/meditation-session.model");
// Mock the MeditationSession model
jest.mock('../../models/meditation-session.model', () => {
    const mockLean = jest.fn().mockReturnThis();
    const mockFindById = jest.fn().mockReturnValue({ lean: mockLean });
    return {
        MeditationSession: {
            find: jest.fn(),
            findById: mockFindById,
            create: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findByIdAndDelete: jest.fn()
        }
    };
});
describe('MeditationSessionController', () => {
    let controller;
    let req;
    let res;
    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();
        // Create controller instance
        controller = new meditation_session_controller_1.MeditationSessionController();
        // Setup request and response
        req = {
            user: {
                _id: new mongoose_1.default.Types.ObjectId().toString(),
                username: 'testuser'
            },
            params: {},
            body: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });
    describe('getUserSessions', () => {
        it('should return 401 if user is not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            req.user = undefined;
            // Act
            yield controller.getUserSessions(req, res);
            // Assert
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized: User not authenticated' });
        }));
        it('should return user sessions if user is authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            // Arrange
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            const sessions = [
                { _id: '1', userId, duration: 10, date: new Date() },
                { _id: '2', userId, duration: 15, date: new Date() }
            ];
            meditation_session_model_1.MeditationSession.find.mockResolvedValue(sessions);
            // Act
            yield controller.getUserSessions(req, res);
            // Assert
            expect(meditation_session_model_1.MeditationSession.find).toHaveBeenCalledWith({ userId });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(sessions);
        }));
        it('should return 500 if there is a server error', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const error = new Error('Database error');
            meditation_session_model_1.MeditationSession.find.mockRejectedValue(error);
            // Act
            yield controller.getUserSessions(req, res);
            // Assert
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
        }));
    });
    describe('createSession', () => {
        it('should return 401 if user is not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            req.user = undefined;
            // Act
            yield controller.createSession(req, res);
            // Assert
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized: User not authenticated' });
        }));
        it('should create a new session if user is authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            // Arrange
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            const sessionData = {
                duration: 10,
                type: 'guided',
                moodBefore: 'calm'
            };
            const createdSession = Object.assign(Object.assign({ _id: new mongoose_1.default.Types.ObjectId().toString(), userId }, sessionData), { date: new Date(), completed: false });
            req.body = sessionData;
            meditation_session_model_1.MeditationSession.create.mockResolvedValue(createdSession);
            // Act
            yield controller.createSession(req, res);
            // Assert
            expect(meditation_session_model_1.MeditationSession.create).toHaveBeenCalledWith(Object.assign(Object.assign({ userId }, sessionData), { completed: false }));
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(createdSession);
        }));
        it('should return 400 if required fields are missing', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            req.body = {}; // Missing required fields
            // Act
            yield controller.createSession(req, res);
            // Assert
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Duration and type are required' });
        }));
        it('should return 500 if there is a server error', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const sessionData = {
                duration: 10,
                type: 'guided',
                moodBefore: 'calm'
            };
            req.body = sessionData;
            const error = new Error('Database error');
            meditation_session_model_1.MeditationSession.create.mockRejectedValue(error);
            // Act
            yield controller.createSession(req, res);
            // Assert
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
        }));
    });
    describe('getSessionById', () => {
        it('should return 401 if user is not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            req.user = undefined;
            req.params = { id: new mongoose_1.default.Types.ObjectId().toString() };
            // Act
            yield controller.getSessionById(req, res);
            // Assert
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized: User not authenticated' });
        }));
        it('should return 404 if session is not found', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const sessionId = new mongoose_1.default.Types.ObjectId().toString();
            req.params = { id: sessionId };
            meditation_session_model_1.MeditationSession.findById.mockReturnValue(null);
            // Act
            yield controller.getSessionById(req, res);
            // Assert
            expect(meditation_session_model_1.MeditationSession.findById).toHaveBeenCalledWith(sessionId);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Session not found' });
        }));
        it('should return 403 if user does not own the session', () => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            // Arrange
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            const otherUserId = new mongoose_1.default.Types.ObjectId().toString();
            const sessionId = new mongoose_1.default.Types.ObjectId().toString();
            const session = {
                _id: sessionId,
                userId: otherUserId,
                duration: 15,
                type: 'guided',
                date: new Date()
            };
            req.params = { id: sessionId };
            meditation_session_model_1.MeditationSession.findById.mockReturnValue(session);
            // Act
            yield controller.getSessionById(req, res);
            // Assert
            expect(meditation_session_model_1.MeditationSession.findById).toHaveBeenCalledWith(sessionId);
            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ error: 'Forbidden: User does not own this session' });
        }));
        it('should return session if user owns it', () => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            // Arrange
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            const sessionId = new mongoose_1.default.Types.ObjectId().toString();
            const session = {
                _id: sessionId,
                userId,
                duration: 15,
                type: 'guided',
                date: new Date()
            };
            req.params = { id: sessionId };
            meditation_session_model_1.MeditationSession.findById.mockReturnValue(session);
            // Act
            yield controller.getSessionById(req, res);
            // Assert
            expect(meditation_session_model_1.MeditationSession.findById).toHaveBeenCalledWith(sessionId);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(session);
        }));
        it('should return 500 if there is a server error', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const sessionId = new mongoose_1.default.Types.ObjectId().toString();
            req.params = { id: sessionId };
            const error = new Error('Database error');
            meditation_session_model_1.MeditationSession.findById.mockRejectedValue(error);
            // Act
            yield controller.getSessionById(req, res);
            // Assert
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
        }));
    });
    describe('completeSession', () => {
        it('should return 401 if user is not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            req.user = undefined;
            req.params = { id: new mongoose_1.default.Types.ObjectId().toString() };
            // Act
            yield controller.completeSession(req, res);
            // Assert
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized: User not authenticated' });
        }));
        it('should return 400 if session ID is invalid', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            req.params = { id: 'invalid-id' };
            // Act
            yield controller.completeSession(req, res);
            // Assert
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Invalid session ID format' });
        }));
        it('should return 404 if session is not found', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const sessionId = new mongoose_1.default.Types.ObjectId().toString();
            req.params = { id: sessionId };
            req.body = { durationCompleted: 10, moodAfter: 'relaxed' };
            meditation_session_model_1.MeditationSession.findById.mockResolvedValue(null);
            // Act
            yield controller.completeSession(req, res);
            // Assert
            expect(meditation_session_model_1.MeditationSession.findById).toHaveBeenCalledWith(sessionId);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Session not found' });
        }));
        it('should return 403 if user does not own the session', () => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            // Arrange
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            const otherUserId = new mongoose_1.default.Types.ObjectId().toString();
            const sessionId = new mongoose_1.default.Types.ObjectId().toString();
            const session = {
                _id: sessionId,
                userId: otherUserId,
                duration: 15,
                type: 'guided',
                date: new Date(),
                completed: false
            };
            req.params = { id: sessionId };
            req.body = { durationCompleted: 10, moodAfter: 'relaxed' };
            meditation_session_model_1.MeditationSession.findById.mockResolvedValue(session);
            // Act
            yield controller.completeSession(req, res);
            // Assert
            expect(meditation_session_model_1.MeditationSession.findById).toHaveBeenCalledWith(sessionId);
            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ error: 'Forbidden: User does not own this session' });
        }));
        it('should return 400 if session is already completed', () => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            // Arrange
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            const sessionId = new mongoose_1.default.Types.ObjectId().toString();
            const session = {
                _id: sessionId,
                userId,
                duration: 15,
                type: 'guided',
                date: new Date(),
                completed: true
            };
            req.params = { id: sessionId };
            req.body = { durationCompleted: 10, moodAfter: 'relaxed' };
            meditation_session_model_1.MeditationSession.findById.mockResolvedValue(session);
            // Act
            yield controller.completeSession(req, res);
            // Assert
            expect(meditation_session_model_1.MeditationSession.findById).toHaveBeenCalledWith(sessionId);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Session already completed' });
        }));
        it('should complete the session if all conditions are met', () => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            // Arrange
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            const sessionId = new mongoose_1.default.Types.ObjectId().toString();
            const completionData = {
                durationCompleted: 600,
                moodAfter: 'calm',
                interruptions: 2
            };
            const session = {
                _id: sessionId,
                userId,
                duration: 15,
                type: 'guided',
                date: new Date(),
                completed: false,
                durationCompleted: undefined,
                moodAfter: undefined,
                interruptions: undefined,
                save: jest.fn().mockResolvedValue(true),
                completeSession: jest.fn().mockImplementation(function () {
                    this.completed = true;
                    this.durationCompleted = completionData.durationCompleted;
                    this.moodAfter = completionData.moodAfter;
                    this.interruptions = completionData.interruptions;
                    return Promise.resolve(this);
                })
            };
            req.params = { id: sessionId };
            req.body = completionData;
            meditation_session_model_1.MeditationSession.findById.mockReturnValue(session);
            // Act
            yield controller.completeSession(req, res);
            // Assert
            expect(meditation_session_model_1.MeditationSession.findById).toHaveBeenCalledWith(sessionId);
            expect(session.completed).toBe(true);
            expect(session.durationCompleted).toBe(completionData.durationCompleted);
            expect(session.moodAfter).toBe(completionData.moodAfter);
            expect(session.completeSession).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(session);
        }));
        it('should return 500 if there is a server error', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const sessionId = new mongoose_1.default.Types.ObjectId().toString();
            req.params = { id: sessionId };
            req.body = { durationCompleted: 10, moodAfter: 'relaxed' };
            const error = new Error('Database error');
            meditation_session_model_1.MeditationSession.findById.mockRejectedValue(error);
            // Act
            yield controller.completeSession(req, res);
            // Assert
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
        }));
    });
    describe('addSessionFeedback', () => {
        it('should return 401 if user is not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            req.user = undefined;
            req.params = { id: new mongoose_1.default.Types.ObjectId().toString() };
            // Act
            yield controller.addSessionFeedback(req, res);
            // Assert
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized: User not authenticated' });
        }));
        it('should return 400 if session ID is invalid', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            req.params = { id: 'invalid-id' };
            // Act
            yield controller.addSessionFeedback(req, res);
            // Assert
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Invalid session ID format' });
        }));
        it('should return 400 if feedback is missing', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const sessionId = new mongoose_1.default.Types.ObjectId().toString();
            req.params = { id: sessionId };
            req.body = {}; // Missing feedback
            // Act
            yield controller.addSessionFeedback(req, res);
            // Assert
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Feedback is required' });
        }));
        it('should return 400 if rating is invalid', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const sessionId = new mongoose_1.default.Types.ObjectId().toString();
            req.params = { id: sessionId };
            req.body = {
                rating: 6, // Invalid rating (should be 1-5)
                comments: 'Great session!',
                improvements: ['Better guidance', 'Longer duration']
            };
            // Act
            yield controller.addSessionFeedback(req, res);
            // Assert
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Rating must be a number between 1 and 5' });
        }));
        it('should return 404 if session is not found', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const sessionId = new mongoose_1.default.Types.ObjectId().toString();
            req.params = { id: sessionId };
            req.body = {
                rating: 5,
                comments: 'Great session!',
                improvements: ['Better guidance', 'Longer duration']
            };
            meditation_session_model_1.MeditationSession.findById.mockResolvedValue(null);
            // Act
            yield controller.addSessionFeedback(req, res);
            // Assert
            expect(meditation_session_model_1.MeditationSession.findById).toHaveBeenCalledWith(sessionId);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Session not found' });
        }));
        it('should return 403 if user does not own the session', () => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            // Arrange
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            const otherUserId = new mongoose_1.default.Types.ObjectId().toString();
            const sessionId = new mongoose_1.default.Types.ObjectId().toString();
            const session = {
                _id: sessionId,
                userId: otherUserId,
                duration: 15,
                type: 'guided',
                date: new Date()
            };
            req.params = { id: sessionId };
            req.body = {
                rating: 5,
                comments: 'Great session!',
                improvements: ['Better guidance', 'Longer duration']
            };
            meditation_session_model_1.MeditationSession.findById.mockResolvedValue(session);
            // Act
            yield controller.addSessionFeedback(req, res);
            // Assert
            expect(meditation_session_model_1.MeditationSession.findById).toHaveBeenCalledWith(sessionId);
            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ error: 'Forbidden: User does not own this session' });
        }));
        it('should return 400 if session is not completed', () => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            // Arrange
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            const sessionId = new mongoose_1.default.Types.ObjectId().toString();
            const session = {
                _id: sessionId,
                userId,
                duration: 15,
                type: 'guided',
                date: new Date(),
                completed: false
            };
            req.params = { id: sessionId };
            req.body = {
                rating: 5,
                comments: 'Great session!',
                improvements: ['Better guidance', 'Longer duration']
            };
            meditation_session_model_1.MeditationSession.findById.mockResolvedValue(session);
            // Act
            yield controller.addSessionFeedback(req, res);
            // Assert
            expect(meditation_session_model_1.MeditationSession.findById).toHaveBeenCalledWith(sessionId);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Cannot add feedback to incomplete session' });
        }));
        it('should add feedback to the session if all conditions are met', () => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            // Arrange
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            const sessionId = new mongoose_1.default.Types.ObjectId().toString();
            const feedbackData = {
                rating: 5,
                comments: 'Great session!',
                improvements: ['Better guidance', 'Longer duration']
            };
            const session = {
                _id: sessionId,
                userId,
                duration: 15,
                type: 'guided',
                date: new Date(),
                completed: true,
                feedback: null,
                save: jest.fn().mockResolvedValue(true)
            };
            req.params = { id: sessionId };
            req.body = feedbackData;
            // Mock the findById to return a session with the right methods
            meditation_session_model_1.MeditationSession.findById.mockReturnValue(session);
            // Act
            yield controller.addSessionFeedback(req, res);
            // Assert
            expect(meditation_session_model_1.MeditationSession.findById).toHaveBeenCalledWith(sessionId);
            // Check that feedback was added to the session
            expect(session.feedback).toEqual(feedbackData);
            expect(session.save).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(session);
        }));
        it('should return 400 if feedback already exists', () => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            // Arrange
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            const sessionId = new mongoose_1.default.Types.ObjectId().toString();
            const existingFeedback = {
                rating: 4,
                comments: 'Good session',
                improvements: ['More variety']
            };
            const session = {
                _id: sessionId,
                userId,
                duration: 15,
                type: 'guided',
                date: new Date(),
                completed: true,
                feedback: existingFeedback
            };
            req.params = { id: sessionId };
            req.body = {
                rating: 5,
                comments: 'Great session!',
                improvements: ['Better guidance', 'Longer duration']
            };
            meditation_session_model_1.MeditationSession.findById.mockResolvedValue(session);
            // Act
            yield controller.addSessionFeedback(req, res);
            // Assert
            expect(meditation_session_model_1.MeditationSession.findById).toHaveBeenCalledWith(sessionId);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Feedback already exists for this session' });
        }));
        it('should return 500 if there is a server error', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const sessionId = new mongoose_1.default.Types.ObjectId().toString();
            req.params = { id: sessionId };
            req.body = {
                rating: 5,
                comments: 'Great session!',
                improvements: ['Better guidance', 'Longer duration']
            };
            const error = new Error('Database error');
            meditation_session_model_1.MeditationSession.findById.mockRejectedValue(error);
            // Act
            yield controller.addSessionFeedback(req, res);
            // Assert
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
        }));
    });
});
