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
const mongoose_1 = __importDefault(require("mongoose"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
const app_1 = require("../../app");
const breathing_model_1 = require("../../models/breathing.model");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../../config"));
const breathing_service_1 = require("../../services/breathing.service");
let mongoServer;
let authToken;
const testUserId = 'test-user-id';
const testUsername = 'test-user';
describe('Breathing API Endpoints', () => {
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        // Setup MongoDB Memory Server
        mongoServer = yield mongodb_memory_server_1.MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        // Only connect if not already connected
        if (mongoose_1.default.connection.readyState === 0) {
            yield mongoose_1.default.connect(mongoUri);
        }
        // Create auth token for testing
        authToken = jsonwebtoken_1.default.sign({ _id: testUserId, username: testUsername }, config_1.default.jwtSecret, { expiresIn: '1h' });
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        if (mongoose_1.default.connection.readyState !== 0) {
            yield mongoose_1.default.disconnect();
        }
        yield mongoServer.stop();
    }));
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield breathing_model_1.BreathingPattern.deleteMany({});
        yield breathing_model_1.BreathingSession.deleteMany({});
        // Initialize default breathing patterns
        yield breathing_service_1.BreathingService.initializeDefaultPatterns();
    }));
    describe('GET /api/breathing/patterns/:name', () => {
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, supertest_1.default)(app_1.app)
                .get('/api/breathing/patterns/4-7-8')
                .set('Authorization', `Bearer ${authToken}`);
        }));
        it('should return a specific breathing pattern', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.app)
                .get('/api/breathing/patterns/4-7-8')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('name', '4-7-8');
            expect(response.body).toHaveProperty('inhale', 4);
            expect(response.body).toHaveProperty('hold', 7);
            expect(response.body).toHaveProperty('exhale', 8);
        }));
        it('should return 404 for non-existent pattern', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.app)
                .get('/api/breathing/patterns/non-existent')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(404);
        }));
        it('should return 401 without auth token', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.app)
                .get('/api/breathing/patterns/4-7-8');
            expect(response.status).toBe(401);
        }));
    });
    describe('POST /api/breathing/session', () => {
        it('should create a new breathing session', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.app)
                .post('/api/breathing/session')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                patternName: '4-7-8',
                stressLevelBefore: 7
            });
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('userId', testUserId);
            expect(response.body).toHaveProperty('patternName', '4-7-8');
            expect(response.body).toHaveProperty('stressLevelBefore', 7);
            expect(response.body).toHaveProperty('completedCycles', 0);
        }));
        it('should validate request body', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.app)
                .post('/api/breathing/session')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                patternName: '4-7-8',
                stressLevelBefore: 11 // Invalid stress level
            });
            expect(response.status).toBe(400);
        }));
    });
    describe('PUT /api/breathing/session/:sessionId/complete', () => {
        let sessionId;
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            const sessionResponse = yield (0, supertest_1.default)(app_1.app)
                .post('/api/breathing/session')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                patternName: '4-7-8',
                stressLevelBefore: 7
            });
            sessionId = sessionResponse.body._id;
        }));
        it('should complete a breathing session', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.app)
                .put(`/api/breathing/session/${sessionId}/complete`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                completedCycles: 4,
                stressLevelAfter: 3
            });
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('completedCycles', 4);
            expect(response.body).toHaveProperty('stressLevelAfter', 3);
            expect(response.body).toHaveProperty('endTime');
        }));
        it('should validate completion data', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.app)
                .put(`/api/breathing/session/${sessionId}/complete`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                completedCycles: -1, // Invalid cycles
                stressLevelAfter: 3
            });
            expect(response.status).toBe(400);
        }));
    });
    describe('GET /api/breathing/sessions', () => {
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            // Create multiple sessions
            yield Promise.all([
                (0, supertest_1.default)(app_1.app)
                    .post('/api/breathing/session')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({ patternName: '4-7-8' }),
                (0, supertest_1.default)(app_1.app)
                    .post('/api/breathing/session')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({ patternName: 'BOX_BREATHING' }),
                (0, supertest_1.default)(app_1.app)
                    .post('/api/breathing/session')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({ patternName: 'QUICK_BREATH' })
            ]);
        }));
        it('should return user sessions with default limit', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.app)
                .get('/api/breathing/sessions')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(3);
        }));
        it('should respect limit parameter', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.app)
                .get('/api/breathing/sessions?limit=2')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(2);
        }));
    });
    describe('GET /api/breathing/effectiveness', () => {
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            // Create and complete sessions
            const session1 = yield (0, supertest_1.default)(app_1.app)
                .post('/api/breathing/session')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                patternName: '4-7-8',
                stressLevelBefore: 8
            });
            yield (0, supertest_1.default)(app_1.app)
                .put(`/api/breathing/session/${session1.body._id}/complete`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                completedCycles: 4,
                stressLevelAfter: 4
            });
            const session2 = yield (0, supertest_1.default)(app_1.app)
                .post('/api/breathing/session')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                patternName: 'BOX_BREATHING',
                stressLevelBefore: 7
            });
            yield (0, supertest_1.default)(app_1.app)
                .put(`/api/breathing/session/${session2.body._id}/complete`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                completedCycles: 4,
                stressLevelAfter: 3
            });
        }));
        it('should return effectiveness metrics', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.app)
                .get('/api/breathing/effectiveness')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('averageStressReduction');
            expect(response.body).toHaveProperty('totalSessions');
            expect(response.body).toHaveProperty('mostEffectivePattern');
        }));
        it('should handle users with no sessions', () => __awaiter(void 0, void 0, void 0, function* () {
            const newToken = jsonwebtoken_1.default.sign({ _id: 'new-user', username: 'new-test-user' }, config_1.default.jwtSecret, { expiresIn: '1h' });
            const response = yield (0, supertest_1.default)(app_1.app)
                .get('/api/breathing/effectiveness')
                .set('Authorization', `Bearer ${newToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                averageStressReduction: 0,
                totalSessions: 0,
                mostEffectivePattern: ''
            });
        }));
    });
    describe('Error Scenarios', () => {
        describe('Session Creation Errors', () => {
            it('should handle invalid pattern name', () => __awaiter(void 0, void 0, void 0, function* () {
                const response = yield (0, supertest_1.default)(app_1.app)
                    .post('/api/breathing/session')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({
                    patternName: 'invalid-pattern',
                    stressLevelBefore: 7
                });
                expect(response.status).toBe(400);
                expect(response.body).toHaveProperty('error');
                expect(response.body.error).toMatch(/invalid pattern/i);
            }));
            it('should handle missing required fields', () => __awaiter(void 0, void 0, void 0, function* () {
                const response = yield (0, supertest_1.default)(app_1.app)
                    .post('/api/breathing/session')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({});
                expect(response.status).toBe(400);
                expect(response.body).toHaveProperty('error');
            }));
        });
        describe('Session Completion Errors', () => {
            it('should handle invalid session ID', () => __awaiter(void 0, void 0, void 0, function* () {
                const invalidId = new mongoose_1.default.Types.ObjectId();
                const response = yield (0, supertest_1.default)(app_1.app)
                    .put(`/api/breathing/session/${invalidId}/complete`)
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({
                    completedCycles: 4,
                    stressLevelAfter: 3
                });
                expect(response.status).toBe(404);
                expect(response.body).toHaveProperty('error');
            }));
            it('should prevent completing already completed session', () => __awaiter(void 0, void 0, void 0, function* () {
                const session = yield (0, supertest_1.default)(app_1.app)
                    .post('/api/breathing/session')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({
                    patternName: '4-7-8',
                    stressLevelBefore: 7
                });
                yield (0, supertest_1.default)(app_1.app)
                    .put(`/api/breathing/session/${session.body._id}/complete`)
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({
                    completedCycles: 4,
                    stressLevelAfter: 3
                });
                const secondComplete = yield (0, supertest_1.default)(app_1.app)
                    .put(`/api/breathing/session/${session.body._id}/complete`)
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({
                    completedCycles: 5,
                    stressLevelAfter: 2
                });
                expect(secondComplete.status).toBe(400);
                expect(secondComplete.body).toHaveProperty('error');
                expect(secondComplete.body.error).toMatch(/already completed/i);
            }));
        });
        describe('Authorization Errors', () => {
            it('should prevent accessing another user\'s session', () => __awaiter(void 0, void 0, void 0, function* () {
                const session = yield (0, supertest_1.default)(app_1.app)
                    .post('/api/breathing/session')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({
                    patternName: '4-7-8',
                    stressLevelBefore: 7
                });
                const otherUserToken = jsonwebtoken_1.default.sign({ _id: 'other-user', username: 'other-test-user' }, config_1.default.jwtSecret, { expiresIn: '1h' });
                const response = yield (0, supertest_1.default)(app_1.app)
                    .put(`/api/breathing/session/${session.body._id}/complete`)
                    .set('Authorization', `Bearer ${otherUserToken}`)
                    .send({
                    completedCycles: 4,
                    stressLevelAfter: 3
                });
                expect(response.status).toBe(403);
                expect(response.body).toHaveProperty('error');
                expect(response.body.error).toMatch(/unauthorized/i);
            }));
            it('should handle expired tokens', () => __awaiter(void 0, void 0, void 0, function* () {
                const expiredToken = jsonwebtoken_1.default.sign({ _id: testUserId, username: testUsername }, config_1.default.jwtSecret, { expiresIn: '0s' });
                const response = yield (0, supertest_1.default)(app_1.app)
                    .get('/api/breathing/sessions')
                    .set('Authorization', `Bearer ${expiredToken}`);
                expect(response.status).toBe(401);
                expect(response.body).toHaveProperty('error');
                expect(response.body.error).toMatch(/invalid token/i);
            }));
        });
        describe('Query Parameter Errors', () => {
            it('should handle invalid limit parameter', () => __awaiter(void 0, void 0, void 0, function* () {
                const response = yield (0, supertest_1.default)(app_1.app)
                    .get('/api/breathing/sessions?limit=invalid')
                    .set('Authorization', `Bearer ${authToken}`);
                expect(response.status).toBe(400);
                expect(response.body).toHaveProperty('error');
            }));
            it('should handle out of range limit parameter', () => __awaiter(void 0, void 0, void 0, function* () {
                const response = yield (0, supertest_1.default)(app_1.app)
                    .get('/api/breathing/sessions?limit=1001')
                    .set('Authorization', `Bearer ${authToken}`);
                expect(response.status).toBe(400);
                expect(response.body).toHaveProperty('error');
                expect(response.body.error).toMatch(/limit/i);
            }));
        });
    });
});
