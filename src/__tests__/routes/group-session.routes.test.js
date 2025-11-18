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
const supertest_1 = __importDefault(require("supertest"));
const server_1 = require("../../utils/server");
const group_session_controller_1 = require("../../controllers/group-session.controller");
const error_codes_1 = require("../../utils/error-codes");
jest.mock('../../controllers/group-session.controller');
describe('Group Session Routes', () => {
    let app;
    let authToken;
    const mockUser = {
        _id: 'user123',
        name: 'Test User',
        email: 'test@example.com'
    };
    const mockSession = {
        _id: 'session123',
        title: 'Group Meditation',
        description: 'Join us for a calming session',
        type: 'meditation',
        startTime: new Date().toISOString(),
        duration: 1800,
        maxParticipants: 10,
        host: mockUser._id,
        participants: [mockUser._id],
        status: 'scheduled'
    };
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        app = yield (0, server_1.createServer)();
        authToken = 'valid.jwt.token';
    }));
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('POST /', () => {
        const createSessionData = {
            title: 'Group Meditation',
            description: 'Join us for a calming session',
            type: 'meditation',
            startTime: new Date().toISOString(),
            duration: 1800,
            maxParticipants: 10
        };
        it('should create group session successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            group_session_controller_1.GroupSessionController.createSession.mockImplementation((req, res) => {
                res.status(201).json(mockSession);
            });
            const response = yield (0, supertest_1.default)(app)
                .post('/api/group-sessions')
                .set('Authorization', `Bearer ${authToken}`)
                .send(createSessionData);
            expect(response.status).toBe(201);
            expect(response.body).toEqual(mockSession);
        }));
        it('should return 400 for invalid session data', () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidData = {
                title: '',
                duration: -1
            };
            const response = yield (0, supertest_1.default)(app)
                .post('/api/group-sessions')
                .set('Authorization', `Bearer ${authToken}`)
                .send(invalidData);
            expect(response.status).toBe(400);
            expect(response.body.error.code).toBe(error_codes_1.ErrorCodes.VALIDATION_ERROR);
        }));
        it('should return 401 without auth token', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .post('/api/group-sessions')
                .send(createSessionData);
            expect(response.status).toBe(401);
            expect(response.body.error.code).toBe(error_codes_1.ErrorCodes.AUTHENTICATION_ERROR);
        }));
    });
    describe('GET /', () => {
        it('should get upcoming sessions successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockSessions = [mockSession];
            group_session_controller_1.GroupSessionController.getUpcomingSessions.mockImplementation((req, res) => {
                res.status(200).json(mockSessions);
            });
            const response = yield (0, supertest_1.default)(app)
                .get('/api/group-sessions')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockSessions);
        }));
        it('should handle query parameters', () => __awaiter(void 0, void 0, void 0, function* () {
            const query = {
                type: 'meditation',
                startDate: '2024-01-01',
                endDate: '2024-01-31'
            };
            const response = yield (0, supertest_1.default)(app)
                .get('/api/group-sessions')
                .query(query)
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(group_session_controller_1.GroupSessionController.getUpcomingSessions).toHaveBeenCalledWith(expect.objectContaining({
                query
            }), expect.any(Object));
        }));
    });
    describe('GET /user', () => {
        it('should get user sessions successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockSessions = [mockSession];
            group_session_controller_1.GroupSessionController.getUserSessions.mockImplementation((req, res) => {
                res.status(200).json(mockSessions);
            });
            const response = yield (0, supertest_1.default)(app)
                .get('/api/group-sessions/user')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockSessions);
        }));
        it('should handle empty user sessions', () => __awaiter(void 0, void 0, void 0, function* () {
            group_session_controller_1.GroupSessionController.getUserSessions.mockImplementation((req, res) => {
                res.status(200).json([]);
            });
            const response = yield (0, supertest_1.default)(app)
                .get('/api/group-sessions/user')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toEqual([]);
        }));
    });
    describe('POST /:sessionId/join', () => {
        it('should join session successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            group_session_controller_1.GroupSessionController.joinSession.mockImplementation((req, res) => {
                res.status(200).json(Object.assign(Object.assign({}, mockSession), { participants: [...mockSession.participants, 'newUser123'] }));
            });
            const response = yield (0, supertest_1.default)(app)
                .post(`/api/group-sessions/${mockSession._id}/join`)
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(response.body.participants).toContain('newUser123');
        }));
        it('should return 404 for non-existent session', () => __awaiter(void 0, void 0, void 0, function* () {
            group_session_controller_1.GroupSessionController.joinSession.mockImplementation((req, res) => {
                res.status(404).json({
                    error: {
                        code: error_codes_1.ErrorCodes.NOT_FOUND,
                        message: 'Session not found'
                    }
                });
            });
            const response = yield (0, supertest_1.default)(app)
                .post('/api/group-sessions/nonexistent/join')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(404);
            expect(response.body.error.code).toBe(error_codes_1.ErrorCodes.NOT_FOUND);
        }));
        it('should return 400 for full session', () => __awaiter(void 0, void 0, void 0, function* () {
            group_session_controller_1.GroupSessionController.joinSession.mockImplementation((req, res) => {
                res.status(400).json({
                    error: {
                        code: error_codes_1.ErrorCodes.VALIDATION_ERROR,
                        message: 'Session is full'
                    }
                });
            });
            const response = yield (0, supertest_1.default)(app)
                .post(`/api/group-sessions/${mockSession._id}/join`)
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(400);
            expect(response.body.error.code).toBe(error_codes_1.ErrorCodes.VALIDATION_ERROR);
        }));
    });
    describe('POST /:sessionId/leave', () => {
        it('should leave session successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            group_session_controller_1.GroupSessionController.leaveSession.mockImplementation((req, res) => {
                res.status(200).json(Object.assign(Object.assign({}, mockSession), { participants: mockSession.participants.filter(p => p !== 'newUser123') }));
            });
            const response = yield (0, supertest_1.default)(app)
                .post(`/api/group-sessions/${mockSession._id}/leave`)
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(response.body.participants).not.toContain('newUser123');
        }));
        it('should return 404 for non-existent session', () => __awaiter(void 0, void 0, void 0, function* () {
            group_session_controller_1.GroupSessionController.leaveSession.mockImplementation((req, res) => {
                res.status(404).json({
                    error: {
                        code: error_codes_1.ErrorCodes.NOT_FOUND,
                        message: 'Session not found'
                    }
                });
            });
            const response = yield (0, supertest_1.default)(app)
                .post('/api/group-sessions/nonexistent/leave')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(404);
            expect(response.body.error.code).toBe(error_codes_1.ErrorCodes.NOT_FOUND);
        }));
    });
    describe('POST /:sessionId/start', () => {
        it('should start session successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            group_session_controller_1.GroupSessionController.startSession.mockImplementation((req, res) => {
                res.status(200).json(Object.assign(Object.assign({}, mockSession), { status: 'in_progress', startedAt: new Date().toISOString() }));
            });
            const response = yield (0, supertest_1.default)(app)
                .post(`/api/group-sessions/${mockSession._id}/start`)
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(response.body.status).toBe('in_progress');
            expect(response.body.startedAt).toBeDefined();
        }));
        it('should return 403 for non-host user', () => __awaiter(void 0, void 0, void 0, function* () {
            group_session_controller_1.GroupSessionController.startSession.mockImplementation((req, res) => {
                res.status(403).json({
                    error: {
                        code: error_codes_1.ErrorCodes.AUTHORIZATION_ERROR,
                        message: 'Only host can start the session'
                    }
                });
            });
            const response = yield (0, supertest_1.default)(app)
                .post(`/api/group-sessions/${mockSession._id}/start`)
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(403);
            expect(response.body.error.code).toBe(error_codes_1.ErrorCodes.AUTHORIZATION_ERROR);
        }));
    });
    describe('POST /:sessionId/complete', () => {
        const completionData = {
            rating: 5,
            feedback: 'Great session!'
        };
        it('should complete session successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            group_session_controller_1.GroupSessionController.completeSession.mockImplementation((req, res) => {
                res.status(200).json(Object.assign(Object.assign({}, mockSession), { status: 'completed', completedAt: new Date().toISOString(), rating: completionData.rating, feedback: completionData.feedback }));
            });
            const response = yield (0, supertest_1.default)(app)
                .post(`/api/group-sessions/${mockSession._id}/complete`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(completionData);
            expect(response.status).toBe(200);
            expect(response.body.status).toBe('completed');
            expect(response.body.completedAt).toBeDefined();
            expect(response.body.rating).toBe(completionData.rating);
        }));
        it('should return 400 for invalid completion data', () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidData = {
                rating: 6,
                feedback: ''
            };
            const response = yield (0, supertest_1.default)(app)
                .post(`/api/group-sessions/${mockSession._id}/complete`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(invalidData);
            expect(response.status).toBe(400);
            expect(response.body.error.code).toBe(error_codes_1.ErrorCodes.VALIDATION_ERROR);
        }));
    });
    describe('POST /:sessionId/cancel', () => {
        it('should cancel session successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            group_session_controller_1.GroupSessionController.cancelSession.mockImplementation((req, res) => {
                res.status(200).json(Object.assign(Object.assign({}, mockSession), { status: 'cancelled', cancelledAt: new Date().toISOString() }));
            });
            const response = yield (0, supertest_1.default)(app)
                .post(`/api/group-sessions/${mockSession._id}/cancel`)
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(response.body.status).toBe('cancelled');
            expect(response.body.cancelledAt).toBeDefined();
        }));
        it('should return 403 for non-host user', () => __awaiter(void 0, void 0, void 0, function* () {
            group_session_controller_1.GroupSessionController.cancelSession.mockImplementation((req, res) => {
                res.status(403).json({
                    error: {
                        code: error_codes_1.ErrorCodes.AUTHORIZATION_ERROR,
                        message: 'Only host can cancel the session'
                    }
                });
            });
            const response = yield (0, supertest_1.default)(app)
                .post(`/api/group-sessions/${mockSession._id}/cancel`)
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(403);
            expect(response.body.error.code).toBe(error_codes_1.ErrorCodes.AUTHORIZATION_ERROR);
        }));
        it('should return 400 for already started session', () => __awaiter(void 0, void 0, void 0, function* () {
            group_session_controller_1.GroupSessionController.cancelSession.mockImplementation((req, res) => {
                res.status(400).json({
                    error: {
                        code: error_codes_1.ErrorCodes.VALIDATION_ERROR,
                        message: 'Cannot cancel an in-progress session'
                    }
                });
            });
            const response = yield (0, supertest_1.default)(app)
                .post(`/api/group-sessions/${mockSession._id}/cancel`)
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(400);
            expect(response.body.error.code).toBe(error_codes_1.ErrorCodes.VALIDATION_ERROR);
        }));
    });
});
