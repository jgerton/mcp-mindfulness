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
const meditation_controller_1 = require("../../controllers/meditation.controller");
const error_codes_1 = require("../../utils/error-codes");
jest.mock('../../controllers/meditation.controller');
describe('Meditation Routes', () => {
    let app;
    let authToken;
    const mockMeditation = {
        _id: 'meditation123',
        title: 'Mindful Breathing',
        description: 'A guided meditation focusing on breath awareness',
        duration: 10,
        type: 'guided',
        category: 'mindfulness',
        difficulty: 'beginner',
        audioUrl: 'https://example.com/audio.mp3',
        tags: ['breathing', 'mindfulness', 'beginner']
    };
    const mockSession = {
        _id: 'session123',
        userId: 'user123',
        meditationId: 'meditation123',
        startTime: new Date().toISOString(),
        endTime: null,
        completed: false,
        interruptions: []
    };
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        app = yield (0, server_1.createServer)();
        authToken = 'valid.jwt.token';
    }));
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('GET /', () => {
        it('should get all meditations successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            meditation_controller_1.MeditationController.getAllMeditations.mockImplementation((req, res) => {
                res.status(200).json([mockMeditation]);
            });
            const response = yield (0, supertest_1.default)(app)
                .get('/api/meditations');
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body[0]).toEqual(mockMeditation);
        }));
        it('should filter meditations by category', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get('/api/meditations')
                .query({ category: 'mindfulness' });
            expect(response.status).toBe(200);
            expect(meditation_controller_1.MeditationController.getAllMeditations).toHaveBeenCalledWith(expect.objectContaining({
                query: { category: 'mindfulness' }
            }), expect.any(Object));
        }));
        it('should filter meditations by type', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get('/api/meditations')
                .query({ type: 'guided' });
            expect(response.status).toBe(200);
            expect(meditation_controller_1.MeditationController.getAllMeditations).toHaveBeenCalledWith(expect.objectContaining({
                query: { type: 'guided' }
            }), expect.any(Object));
        }));
        it('should filter meditations by difficulty', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get('/api/meditations')
                .query({ difficulty: 'beginner' });
            expect(response.status).toBe(200);
            expect(meditation_controller_1.MeditationController.getAllMeditations).toHaveBeenCalledWith(expect.objectContaining({
                query: { difficulty: 'beginner' }
            }), expect.any(Object));
        }));
        it('should filter meditations by duration', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get('/api/meditations')
                .query({ duration: 10 });
            expect(response.status).toBe(200);
            expect(meditation_controller_1.MeditationController.getAllMeditations).toHaveBeenCalledWith(expect.objectContaining({
                query: { duration: '10' }
            }), expect.any(Object));
        }));
    });
    describe('GET /:id', () => {
        it('should get meditation by id successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            meditation_controller_1.MeditationController.getMeditationById.mockImplementation((req, res) => {
                res.status(200).json(mockMeditation);
            });
            const response = yield (0, supertest_1.default)(app)
                .get(`/api/meditations/${mockMeditation._id}`);
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockMeditation);
        }));
        it('should return 404 for non-existent meditation', () => __awaiter(void 0, void 0, void 0, function* () {
            meditation_controller_1.MeditationController.getMeditationById.mockImplementation((req, res) => {
                res.status(404).json({
                    error: {
                        code: error_codes_1.ErrorCodes.NOT_FOUND,
                        message: 'Meditation not found'
                    }
                });
            });
            const response = yield (0, supertest_1.default)(app)
                .get('/api/meditations/nonexistent');
            expect(response.status).toBe(404);
            expect(response.body.error.code).toBe(error_codes_1.ErrorCodes.NOT_FOUND);
        }));
    });
    describe('POST /', () => {
        const validMeditation = {
            title: 'New Meditation',
            description: 'A new guided meditation',
            duration: 15,
            type: 'guided',
            category: 'mindfulness',
            difficulty: 'beginner',
            audioUrl: 'https://example.com/new-audio.mp3',
            tags: ['new', 'meditation']
        };
        it('should create meditation successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            meditation_controller_1.MeditationController.createMeditation.mockImplementation((req, res) => {
                res.status(201).json(Object.assign(Object.assign({}, validMeditation), { _id: 'newMeditation123' }));
            });
            const response = yield (0, supertest_1.default)(app)
                .post('/api/meditations')
                .set('Authorization', `Bearer ${authToken}`)
                .send(validMeditation);
            expect(response.status).toBe(201);
            expect(response.body).toEqual(expect.objectContaining(validMeditation));
        }));
        it('should validate required fields', () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidMeditation = {
                title: 'Invalid Meditation'
                // Missing required fields
            };
            const response = yield (0, supertest_1.default)(app)
                .post('/api/meditations')
                .set('Authorization', `Bearer ${authToken}`)
                .send(invalidMeditation);
            expect(response.status).toBe(400);
            expect(response.body.error.code).toBe(error_codes_1.ErrorCodes.VALIDATION_ERROR);
        }));
        it('should require authentication', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .post('/api/meditations')
                .send(validMeditation);
            expect(response.status).toBe(401);
            expect(response.body.error.code).toBe(error_codes_1.ErrorCodes.AUTHENTICATION_ERROR);
        }));
    });
    describe('PUT /:id', () => {
        const updateData = {
            title: 'Updated Meditation',
            description: 'Updated description',
            duration: 20
        };
        it('should update meditation successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            meditation_controller_1.MeditationController.updateMeditation.mockImplementation((req, res) => {
                res.status(200).json(Object.assign(Object.assign({}, mockMeditation), updateData));
            });
            const response = yield (0, supertest_1.default)(app)
                .put(`/api/meditations/${mockMeditation._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData);
            expect(response.status).toBe(200);
            expect(response.body).toEqual(expect.objectContaining(updateData));
        }));
        it('should validate update data', () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidUpdate = {
                duration: -1 // Invalid duration
            };
            const response = yield (0, supertest_1.default)(app)
                .put(`/api/meditations/${mockMeditation._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(invalidUpdate);
            expect(response.status).toBe(400);
            expect(response.body.error.code).toBe(error_codes_1.ErrorCodes.VALIDATION_ERROR);
        }));
    });
    describe('DELETE /:id', () => {
        it('should delete meditation successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            meditation_controller_1.MeditationController.deleteMeditation.mockImplementation((req, res) => {
                res.status(200).json({ message: 'Meditation deleted successfully' });
            });
            const response = yield (0, supertest_1.default)(app)
                .delete(`/api/meditations/${mockMeditation._id}`)
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
        }));
        it('should return 404 for non-existent meditation', () => __awaiter(void 0, void 0, void 0, function* () {
            meditation_controller_1.MeditationController.deleteMeditation.mockImplementation((req, res) => {
                res.status(404).json({
                    error: {
                        code: error_codes_1.ErrorCodes.NOT_FOUND,
                        message: 'Meditation not found'
                    }
                });
            });
            const response = yield (0, supertest_1.default)(app)
                .delete('/api/meditations/nonexistent')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(404);
            expect(response.body.error.code).toBe(error_codes_1.ErrorCodes.NOT_FOUND);
        }));
    });
    describe('POST /:id/start', () => {
        it('should start meditation session successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            meditation_controller_1.MeditationController.startSession.mockImplementation((req, res) => {
                res.status(200).json(mockSession);
            });
            const response = yield (0, supertest_1.default)(app)
                .post(`/api/meditations/${mockMeditation._id}/start`)
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockSession);
        }));
        it('should return 404 for non-existent meditation', () => __awaiter(void 0, void 0, void 0, function* () {
            meditation_controller_1.MeditationController.startSession.mockImplementation((req, res) => {
                res.status(404).json({
                    error: {
                        code: error_codes_1.ErrorCodes.NOT_FOUND,
                        message: 'Meditation not found'
                    }
                });
            });
            const response = yield (0, supertest_1.default)(app)
                .post('/api/meditations/nonexistent/start')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(404);
            expect(response.body.error.code).toBe(error_codes_1.ErrorCodes.NOT_FOUND);
        }));
    });
    describe('POST /:id/complete', () => {
        const completionData = {
            mood: 'calm',
            notes: 'Felt very peaceful'
        };
        it('should complete meditation session successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const completedSession = Object.assign(Object.assign({}, mockSession), { completed: true, endTime: new Date().toISOString(), mood: completionData.mood, notes: completionData.notes });
            meditation_controller_1.MeditationController.completeSession.mockImplementation((req, res) => {
                res.status(200).json(completedSession);
            });
            const response = yield (0, supertest_1.default)(app)
                .post(`/api/meditations/${mockMeditation._id}/complete`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(completionData);
            expect(response.status).toBe(200);
            expect(response.body).toEqual(completedSession);
        }));
        it('should validate completion data', () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidData = {
                mood: 'invalid-mood' // Invalid mood
            };
            const response = yield (0, supertest_1.default)(app)
                .post(`/api/meditations/${mockMeditation._id}/complete`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(invalidData);
            expect(response.status).toBe(400);
            expect(response.body.error.code).toBe(error_codes_1.ErrorCodes.VALIDATION_ERROR);
        }));
    });
    describe('GET /session/active', () => {
        it('should get active session successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            meditation_controller_1.MeditationController.getActiveSession.mockImplementation((req, res) => {
                res.status(200).json(mockSession);
            });
            const response = yield (0, supertest_1.default)(app)
                .get('/api/meditations/session/active')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockSession);
        }));
        it('should return 404 when no active session exists', () => __awaiter(void 0, void 0, void 0, function* () {
            meditation_controller_1.MeditationController.getActiveSession.mockImplementation((req, res) => {
                res.status(404).json({
                    error: {
                        code: error_codes_1.ErrorCodes.NOT_FOUND,
                        message: 'No active session found'
                    }
                });
            });
            const response = yield (0, supertest_1.default)(app)
                .get('/api/meditations/session/active')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(404);
            expect(response.body.error.code).toBe(error_codes_1.ErrorCodes.NOT_FOUND);
        }));
    });
    describe('POST /session/:id/interrupt', () => {
        const interruptionData = {
            reason: 'Phone call'
        };
        it('should record interruption successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const updatedSession = Object.assign(Object.assign({}, mockSession), { interruptions: [
                    {
                        time: new Date().toISOString(),
                        reason: interruptionData.reason
                    }
                ] });
            meditation_controller_1.MeditationController.recordInterruption.mockImplementation((req, res) => {
                res.status(200).json(updatedSession);
            });
            const response = yield (0, supertest_1.default)(app)
                .post(`/api/meditations/session/${mockSession._id}/interrupt`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(interruptionData);
            expect(response.status).toBe(200);
            expect(response.body.interruptions).toHaveLength(1);
            expect(response.body.interruptions[0].reason).toBe(interruptionData.reason);
        }));
        it('should validate interruption data', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .post(`/api/meditations/session/${mockSession._id}/interrupt`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({});
            expect(response.status).toBe(400);
            expect(response.body.error.code).toBe(error_codes_1.ErrorCodes.VALIDATION_ERROR);
        }));
        it('should return 404 for non-existent session', () => __awaiter(void 0, void 0, void 0, function* () {
            meditation_controller_1.MeditationController.recordInterruption.mockImplementation((req, res) => {
                res.status(404).json({
                    error: {
                        code: error_codes_1.ErrorCodes.NOT_FOUND,
                        message: 'Session not found'
                    }
                });
            });
            const response = yield (0, supertest_1.default)(app)
                .post('/api/meditations/session/nonexistent/interrupt')
                .set('Authorization', `Bearer ${authToken}`)
                .send(interruptionData);
            expect(response.status).toBe(404);
            expect(response.body.error.code).toBe(error_codes_1.ErrorCodes.NOT_FOUND);
        }));
    });
});
