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
const meditation_session_controller_1 = require("../../controllers/meditation-session.controller");
const error_codes_1 = require("../../utils/error-codes");
jest.mock('../../controllers/meditation-session.controller');
describe('Meditation Session Routes', () => {
    let app;
    let authToken;
    const mockSession = {
        _id: 'session123',
        userId: 'user123',
        duration: 600,
        type: 'guided',
        guidedMeditationId: 'meditation123',
        status: 'completed',
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        notes: 'Great session',
        rating: 5
    };
    const mockStats = {
        totalSessions: 50,
        totalMinutes: 1500,
        averageRating: 4.5,
        completionRate: 95,
        preferredDuration: 600,
        preferredTime: '08:00'
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
            duration: 600,
            type: 'guided',
            guidedMeditationId: 'meditation123'
        };
        it('should create meditation session successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            meditation_session_controller_1.MeditationSessionController.prototype.createSession.mockImplementation((req, res) => {
                res.status(201).json(Object.assign(Object.assign(Object.assign({}, mockSession), createSessionData), { status: 'created' }));
            });
            const response = yield (0, supertest_1.default)(app)
                .post('/api/meditation-sessions')
                .set('Authorization', `Bearer ${authToken}`)
                .send(createSessionData);
            expect(response.status).toBe(201);
            expect(response.body).toEqual(expect.objectContaining(createSessionData));
        }));
        it('should return 401 without auth token', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .post('/api/meditation-sessions')
                .send(createSessionData);
            expect(response.status).toBe(401);
            expect(response.body.error.code).toBe(error_codes_1.ErrorCodes.AUTHENTICATION_ERROR);
        }));
        it('should return 400 for invalid session data', () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidData = {
                duration: -1,
                type: 'invalid'
            };
            const response = yield (0, supertest_1.default)(app)
                .post('/api/meditation-sessions')
                .set('Authorization', `Bearer ${authToken}`)
                .send(invalidData);
            expect(response.status).toBe(400);
            expect(response.body.error.code).toBe(error_codes_1.ErrorCodes.VALIDATION_ERROR);
        }));
    });
    describe('GET /', () => {
        it('should get user sessions successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockSessions = [mockSession];
            meditation_session_controller_1.MeditationSessionController.prototype.getUserSessions.mockImplementation((req, res) => {
                res.status(200).json(mockSessions);
            });
            const response = yield (0, supertest_1.default)(app)
                .get('/api/meditation-sessions')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockSessions);
        }));
        it('should handle query parameters', () => __awaiter(void 0, void 0, void 0, function* () {
            const query = {
                startDate: '2024-01-01',
                endDate: '2024-01-31',
                status: 'completed',
                type: 'guided'
            };
            const response = yield (0, supertest_1.default)(app)
                .get('/api/meditation-sessions')
                .query(query)
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(meditation_session_controller_1.MeditationSessionController.prototype.getUserSessions).toHaveBeenCalledWith(expect.objectContaining({
                query
            }), expect.any(Object));
        }));
        it('should return 401 without auth token', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get('/api/meditation-sessions');
            expect(response.status).toBe(401);
            expect(response.body.error.code).toBe(error_codes_1.ErrorCodes.AUTHENTICATION_ERROR);
        }));
    });
    describe('GET /:id', () => {
        it('should get session by ID successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            meditation_session_controller_1.MeditationSessionController.prototype.getSessionById.mockImplementation((req, res) => {
                res.status(200).json(mockSession);
            });
            const response = yield (0, supertest_1.default)(app)
                .get(`/api/meditation-sessions/${mockSession._id}`)
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockSession);
        }));
        it('should return 404 for non-existent session', () => __awaiter(void 0, void 0, void 0, function* () {
            meditation_session_controller_1.MeditationSessionController.prototype.getSessionById.mockImplementation((req, res) => {
                res.status(404).json({
                    error: {
                        code: error_codes_1.ErrorCodes.NOT_FOUND,
                        message: 'Session not found'
                    }
                });
            });
            const response = yield (0, supertest_1.default)(app)
                .get('/api/meditation-sessions/nonexistent')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(404);
            expect(response.body.error.code).toBe(error_codes_1.ErrorCodes.NOT_FOUND);
        }));
    });
    describe('PATCH /:id', () => {
        const updateData = {
            duration: 900,
            notes: 'Updated notes'
        };
        it('should update session successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            meditation_session_controller_1.MeditationSessionController.prototype.updateSession.mockImplementation((req, res) => {
                res.status(200).json(Object.assign(Object.assign({}, mockSession), updateData));
            });
            const response = yield (0, supertest_1.default)(app)
                .patch(`/api/meditation-sessions/${mockSession._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData);
            expect(response.status).toBe(200);
            expect(response.body).toEqual(expect.objectContaining(updateData));
        }));
        it('should return 400 for invalid update data', () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidData = {
                duration: -1
            };
            const response = yield (0, supertest_1.default)(app)
                .patch(`/api/meditation-sessions/${mockSession._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(invalidData);
            expect(response.status).toBe(400);
            expect(response.body.error.code).toBe(error_codes_1.ErrorCodes.VALIDATION_ERROR);
        }));
    });
    describe('GET /stats', () => {
        it('should get user stats successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            meditation_session_controller_1.MeditationSessionController.prototype.getUserStats.mockImplementation((req, res) => {
                res.status(200).json(mockStats);
            });
            const response = yield (0, supertest_1.default)(app)
                .get('/api/meditation-sessions/stats')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockStats);
        }));
    });
    describe('POST /start', () => {
        const startSessionData = {
            type: 'guided',
            guidedMeditationId: 'meditation123'
        };
        it('should start session successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            meditation_session_controller_1.MeditationSessionController.prototype.createSession.mockImplementation((req, res) => {
                res.status(201).json(Object.assign(Object.assign(Object.assign({}, mockSession), startSessionData), { status: 'in_progress', startTime: new Date().toISOString(), endTime: null }));
            });
            const response = yield (0, supertest_1.default)(app)
                .post('/api/meditation-sessions/start')
                .set('Authorization', `Bearer ${authToken}`)
                .send(startSessionData);
            expect(response.status).toBe(201);
            expect(response.body.status).toBe('in_progress');
        }));
    });
    describe('POST /:sessionId/complete', () => {
        const completeSessionData = {
            rating: 5,
            notes: 'Excellent session',
            mood: 'relaxed',
            challenges: ['minor distractions']
        };
        it('should complete session successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            meditation_session_controller_1.MeditationSessionController.prototype.completeSession.mockImplementation((req, res) => {
                res.status(200).json(Object.assign(Object.assign(Object.assign({}, mockSession), completeSessionData), { status: 'completed', endTime: new Date().toISOString() }));
            });
            const response = yield (0, supertest_1.default)(app)
                .post(`/api/meditation-sessions/${mockSession._id}/complete`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(completeSessionData);
            expect(response.status).toBe(200);
            expect(response.body.status).toBe('completed');
            expect(response.body).toEqual(expect.objectContaining(completeSessionData));
        }));
        it('should return 400 for invalid completion data', () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidData = {
                rating: 6, // Invalid: should be 1-5
                notes: ''
            };
            const response = yield (0, supertest_1.default)(app)
                .post(`/api/meditation-sessions/${mockSession._id}/complete`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(invalidData);
            expect(response.status).toBe(400);
            expect(response.body.error.code).toBe(error_codes_1.ErrorCodes.VALIDATION_ERROR);
        }));
        it('should return 404 for non-existent session', () => __awaiter(void 0, void 0, void 0, function* () {
            meditation_session_controller_1.MeditationSessionController.prototype.completeSession.mockImplementation((req, res) => {
                res.status(404).json({
                    error: {
                        code: error_codes_1.ErrorCodes.NOT_FOUND,
                        message: 'Session not found'
                    }
                });
            });
            const response = yield (0, supertest_1.default)(app)
                .post('/api/meditation-sessions/nonexistent/complete')
                .set('Authorization', `Bearer ${authToken}`)
                .send(completeSessionData);
            expect(response.status).toBe(404);
            expect(response.body.error.code).toBe(error_codes_1.ErrorCodes.NOT_FOUND);
        }));
    });
});
