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
const pmr_controller_1 = require("../../controllers/pmr.controller");
const error_codes_1 = require("../../utils/error-codes");
jest.mock('../../controllers/pmr.controller');
describe('PMR Routes', () => {
    let app;
    let authToken;
    const mockMuscleGroups = [
        { id: 'group1', name: 'Arms', order: 1 },
        { id: 'group2', name: 'Legs', order: 2 },
        { id: 'group3', name: 'Shoulders', order: 3 }
    ];
    const mockSession = {
        id: 'session123',
        userId: 'user123',
        startTime: new Date().toISOString(),
        stressLevelBefore: 7,
        completedGroups: ['group1', 'group2'],
        stressLevelAfter: 4,
        status: 'completed'
    };
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        app = yield (0, server_1.createServer)();
        authToken = 'valid.jwt.token';
    }));
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('GET /muscle-groups', () => {
        it('should get muscle groups successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            pmr_controller_1.PMRController.getMuscleGroups.mockImplementation((req, res) => {
                res.status(200).json(mockMuscleGroups);
            });
            const response = yield (0, supertest_1.default)(app)
                .get('/api/pmr/muscle-groups')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockMuscleGroups);
        }));
        it('should return 401 without auth token', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get('/api/pmr/muscle-groups');
            expect(response.status).toBe(401);
            expect(response.body.error.code).toBe(error_codes_1.ErrorCodes.AUTHENTICATION_ERROR);
        }));
    });
    describe('POST /session', () => {
        const validBody = { stressLevelBefore: 7 };
        it('should start session successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            pmr_controller_1.PMRController.startSession.mockImplementation((req, res) => {
                res.status(201).json(Object.assign(Object.assign({}, mockSession), { stressLevelBefore: req.body.stressLevelBefore }));
            });
            const response = yield (0, supertest_1.default)(app)
                .post('/api/pmr/session')
                .set('Authorization', `Bearer ${authToken}`)
                .send(validBody);
            expect(response.status).toBe(201);
            expect(response.body).toMatchObject(Object.assign(Object.assign({}, mockSession), { stressLevelBefore: validBody.stressLevelBefore }));
        }));
        it('should validate stress level range', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .post('/api/pmr/session')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ stressLevelBefore: 11 });
            expect(response.status).toBe(400);
            expect(response.body.error.code).toBe(error_codes_1.ErrorCodes.VALIDATION_ERROR);
        }));
        it('should handle server error gracefully', () => __awaiter(void 0, void 0, void 0, function* () {
            pmr_controller_1.PMRController.startSession.mockImplementation((req, res) => {
                res.status(500).json({ error: 'Internal server error' });
            });
            const response = yield (0, supertest_1.default)(app)
                .post('/api/pmr/session')
                .set('Authorization', `Bearer ${authToken}`)
                .send(validBody);
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error');
        }));
        it('should accept request without stress level', () => __awaiter(void 0, void 0, void 0, function* () {
            pmr_controller_1.PMRController.startSession.mockImplementation((req, res) => {
                res.status(201).json(Object.assign(Object.assign({}, mockSession), { stressLevelBefore: undefined }));
            });
            const response = yield (0, supertest_1.default)(app)
                .post('/api/pmr/session')
                .set('Authorization', `Bearer ${authToken}`)
                .send({});
            expect(response.status).toBe(201);
            expect(response.body.stressLevelBefore).toBeUndefined();
        }));
    });
    describe('PUT /session/:sessionId/complete', () => {
        const validBody = {
            completedGroups: ['group1', 'group2'],
            stressLevelAfter: 4
        };
        it('should complete session successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            pmr_controller_1.PMRController.completeSession.mockImplementation((req, res) => {
                res.status(200).json(Object.assign(Object.assign({}, mockSession), req.body));
            });
            const response = yield (0, supertest_1.default)(app)
                .put(`/api/pmr/session/${mockSession.id}/complete`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(validBody);
            expect(response.status).toBe(200);
            expect(response.body).toMatchObject(Object.assign(Object.assign({}, mockSession), validBody));
        }));
        it('should validate completed groups array', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .put(`/api/pmr/session/${mockSession.id}/complete`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ completedGroups: 'invalid' });
            expect(response.status).toBe(400);
            expect(response.body.error.code).toBe(error_codes_1.ErrorCodes.VALIDATION_ERROR);
        }));
        it('should validate stress level after range', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .put(`/api/pmr/session/${mockSession.id}/complete`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(Object.assign(Object.assign({}, validBody), { stressLevelAfter: 11 }));
            expect(response.status).toBe(400);
            expect(response.body.error.code).toBe(error_codes_1.ErrorCodes.VALIDATION_ERROR);
        }));
        it('should handle non-existent session', () => __awaiter(void 0, void 0, void 0, function* () {
            pmr_controller_1.PMRController.completeSession.mockImplementation((req, res) => {
                res.status(404).json({ error: 'Session not found' });
            });
            const response = yield (0, supertest_1.default)(app)
                .put('/api/pmr/session/nonexistent/complete')
                .set('Authorization', `Bearer ${authToken}`)
                .send(validBody);
            expect(response.status).toBe(404);
            expect(response.body.error).toBe('Session not found');
        }));
        it('should handle unauthorized session access', () => __awaiter(void 0, void 0, void 0, function* () {
            pmr_controller_1.PMRController.completeSession.mockImplementation((req, res) => {
                res.status(403).json({ error: 'Unauthorized access to session' });
            });
            const response = yield (0, supertest_1.default)(app)
                .put(`/api/pmr/session/${mockSession.id}/complete`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(validBody);
            expect(response.status).toBe(403);
            expect(response.body.error).toBe('Unauthorized access to session');
        }));
    });
    describe('PUT /session/:sessionId/progress', () => {
        const validBody = { completedGroup: 'group1' };
        it('should update progress successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            pmr_controller_1.PMRController.updateProgress.mockImplementation((req, res) => {
                res.status(200).json(Object.assign(Object.assign({}, mockSession), { completedGroups: [...mockSession.completedGroups, req.body.completedGroup] }));
            });
            const response = yield (0, supertest_1.default)(app)
                .put(`/api/pmr/session/${mockSession.id}/progress`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(validBody);
            expect(response.status).toBe(200);
            expect(response.body.completedGroups).toContain(validBody.completedGroup);
        }));
        it('should validate completed group', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .put(`/api/pmr/session/${mockSession.id}/progress`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ completedGroup: null });
            expect(response.status).toBe(400);
            expect(response.body.error.code).toBe(error_codes_1.ErrorCodes.VALIDATION_ERROR);
        }));
        it('should handle invalid muscle group', () => __awaiter(void 0, void 0, void 0, function* () {
            pmr_controller_1.PMRController.updateProgress.mockImplementation((req, res) => {
                res.status(400).json({ error: 'Invalid muscle group' });
            });
            const response = yield (0, supertest_1.default)(app)
                .put(`/api/pmr/session/${mockSession.id}/progress`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ completedGroup: 'invalid_group' });
            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Invalid muscle group');
        }));
        it('should handle already completed session', () => __awaiter(void 0, void 0, void 0, function* () {
            pmr_controller_1.PMRController.updateProgress.mockImplementation((req, res) => {
                res.status(400).json({ error: 'Session already completed' });
            });
            const response = yield (0, supertest_1.default)(app)
                .put(`/api/pmr/session/${mockSession.id}/progress`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(validBody);
            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Session already completed');
        }));
    });
    describe('GET /sessions', () => {
        it('should get user sessions successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockSessions = [mockSession];
            pmr_controller_1.PMRController.getUserSessions.mockImplementation((req, res) => {
                res.status(200).json(mockSessions);
            });
            const response = yield (0, supertest_1.default)(app)
                .get('/api/pmr/sessions')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockSessions);
        }));
        it('should return empty array when no sessions exist', () => __awaiter(void 0, void 0, void 0, function* () {
            pmr_controller_1.PMRController.getUserSessions.mockImplementation((req, res) => {
                res.status(200).json([]);
            });
            const response = yield (0, supertest_1.default)(app)
                .get('/api/pmr/sessions')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toEqual([]);
        }));
        it('should handle pagination limit', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockSessions = [mockSession];
            pmr_controller_1.PMRController.getUserSessions.mockImplementation((req, res) => {
                res.status(200).json(mockSessions.slice(0, parseInt(req.query.limit)));
            });
            const response = yield (0, supertest_1.default)(app)
                .get('/api/pmr/sessions?limit=1')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(1);
        }));
        it('should handle server error gracefully', () => __awaiter(void 0, void 0, void 0, function* () {
            pmr_controller_1.PMRController.getUserSessions.mockImplementation((req, res) => {
                res.status(500).json({ error: 'Failed to get user PMR sessions' });
            });
            const response = yield (0, supertest_1.default)(app)
                .get('/api/pmr/sessions')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(500);
            expect(response.body.error).toBe('Failed to get user PMR sessions');
        }));
    });
    describe('GET /effectiveness', () => {
        const mockEffectiveness = {
            averageStressReduction: 3,
            totalSessions: 10,
            completionRate: 0.8,
            mostEffectiveGroups: ['Arms', 'Legs'],
            trendData: [
                { date: '2024-01-01', stressReduction: 2 },
                { date: '2024-01-02', stressReduction: 4 }
            ]
        };
        it('should get effectiveness data successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            pmr_controller_1.PMRController.getEffectiveness.mockImplementation((req, res) => {
                res.status(200).json(mockEffectiveness);
            });
            const response = yield (0, supertest_1.default)(app)
                .get('/api/pmr/effectiveness')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockEffectiveness);
        }));
        it('should handle no data case', () => __awaiter(void 0, void 0, void 0, function* () {
            pmr_controller_1.PMRController.getEffectiveness.mockImplementation((req, res) => {
                res.status(200).json({
                    averageStressReduction: 0,
                    totalSessions: 0,
                    completionRate: 0,
                    mostEffectiveGroups: [],
                    trendData: []
                });
            });
            const response = yield (0, supertest_1.default)(app)
                .get('/api/pmr/effectiveness')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(response.body.totalSessions).toBe(0);
        }));
        it('should handle invalid date range', () => __awaiter(void 0, void 0, void 0, function* () {
            pmr_controller_1.PMRController.getEffectiveness.mockImplementation((req, res) => {
                res.status(400).json({ error: 'Invalid date range' });
            });
            const response = yield (0, supertest_1.default)(app)
                .get('/api/pmr/effectiveness?startDate=invalid')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Invalid date range');
        }));
        it('should handle server error gracefully', () => __awaiter(void 0, void 0, void 0, function* () {
            pmr_controller_1.PMRController.getEffectiveness.mockImplementation((req, res) => {
                res.status(500).json({ error: 'Failed to calculate effectiveness' });
            });
            const response = yield (0, supertest_1.default)(app)
                .get('/api/pmr/effectiveness')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(500);
            expect(response.body.error).toBe('Failed to calculate effectiveness');
        }));
    });
});
