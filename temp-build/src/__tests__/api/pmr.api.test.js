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
const pmr_model_1 = require("../../models/pmr.model");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../../config"));
let mongoServer;
let authToken;
const testUserId = 'test-user-id';
const testUsername = 'test-user';
describe('PMR API Endpoints', () => {
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
        yield pmr_model_1.MuscleGroup.deleteMany({});
        yield pmr_model_1.PMRSession.deleteMany({});
    }));
    describe('GET /api/pmr/muscle-groups', () => {
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, supertest_1.default)(app_1.app)
                .get('/api/pmr/muscle-groups')
                .set('Authorization', `Bearer ${authToken}`);
        }));
        it('should return all muscle groups in correct order', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.app)
                .get('/api/pmr/muscle-groups')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
            expect(response.body[0].name).toBe('hands_and_forearms');
            expect(response.body[6].name).toBe('legs');
            // Check that the array is sorted by order
            for (let i = 0; i < response.body.length - 1; i++) {
                expect(response.body[i].order).toBeLessThanOrEqual(response.body[i + 1].order);
            }
        }));
        it('should return 401 without auth token', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.app)
                .get('/api/pmr/muscle-groups');
            expect(response.status).toBe(401);
        }));
    });
    describe('POST /api/pmr/session', () => {
        it('should create a new PMR session', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.app)
                .post('/api/pmr/session')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                stressLevelBefore: 7
            });
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('userId', testUserId);
            expect(response.body).toHaveProperty('stressLevelBefore', 7);
            expect(response.body).toHaveProperty('completedGroups', []);
            expect(response.body).toHaveProperty('duration', 225); // Total duration of all muscle groups
        }));
        it('should validate stress level', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.app)
                .post('/api/pmr/session')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                stressLevelBefore: 11 // Invalid stress level
            });
            expect(response.status).toBe(400);
        }));
    });
    describe('PUT /api/pmr/session/:sessionId/complete', () => {
        let sessionId;
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            const sessionResponse = yield (0, supertest_1.default)(app_1.app)
                .post('/api/pmr/session')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                stressLevelBefore: 7
            });
            sessionId = sessionResponse.body._id;
        }));
        it('should complete a PMR session', () => __awaiter(void 0, void 0, void 0, function* () {
            const completedGroups = ['hands_and_forearms', 'biceps', 'shoulders'];
            const response = yield (0, supertest_1.default)(app_1.app)
                .put(`/api/pmr/session/${sessionId}/complete`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                completedGroups,
                stressLevelAfter: 3
            });
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('completedGroups', completedGroups);
            expect(response.body).toHaveProperty('stressLevelAfter', 3);
            expect(response.body).toHaveProperty('endTime');
        }));
        it('should validate completion data', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.app)
                .put(`/api/pmr/session/${sessionId}/complete`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                completedGroups: 'invalid', // Should be array
                stressLevelAfter: 3
            });
            expect(response.status).toBe(400);
        }));
    });
    describe('PUT /api/pmr/session/:sessionId/progress', () => {
        let sessionId;
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            const sessionResponse = yield (0, supertest_1.default)(app_1.app)
                .post('/api/pmr/session')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                stressLevelBefore: 7
            });
            sessionId = sessionResponse.body._id;
        }));
        it('should update session progress', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.app)
                .put(`/api/pmr/session/${sessionId}/progress`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                completedGroup: 'hands_and_forearms'
            });
            expect(response.status).toBe(200);
            expect(response.body.completedGroups).toContain('hands_and_forearms');
        }));
        it('should validate muscle group name', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.app)
                .put(`/api/pmr/session/${sessionId}/progress`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                completedGroup: 'invalid_group'
            });
            expect(response.status).toBe(400);
        }));
    });
    describe('GET /api/pmr/sessions', () => {
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            // Create multiple sessions
            yield Promise.all([
                (0, supertest_1.default)(app_1.app)
                    .post('/api/pmr/session')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({ stressLevelBefore: 7 }),
                (0, supertest_1.default)(app_1.app)
                    .post('/api/pmr/session')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({ stressLevelBefore: 8 }),
                (0, supertest_1.default)(app_1.app)
                    .post('/api/pmr/session')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({ stressLevelBefore: 6 })
            ]);
        }));
        it('should return user sessions with default limit', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.app)
                .get('/api/pmr/sessions')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(3);
        }));
        it('should respect limit parameter', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.app)
                .get('/api/pmr/sessions?limit=2')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(2);
        }));
    });
    describe('GET /api/pmr/effectiveness', () => {
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            // Create and complete sessions
            const session1 = yield (0, supertest_1.default)(app_1.app)
                .post('/api/pmr/session')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                stressLevelBefore: 8
            });
            yield (0, supertest_1.default)(app_1.app)
                .put(`/api/pmr/session/${session1.body._id}/complete`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                completedGroups: ['hands_and_forearms', 'biceps', 'shoulders'],
                stressLevelAfter: 4
            });
            const session2 = yield (0, supertest_1.default)(app_1.app)
                .post('/api/pmr/session')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                stressLevelBefore: 7
            });
            yield (0, supertest_1.default)(app_1.app)
                .put(`/api/pmr/session/${session2.body._id}/complete`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                completedGroups: ['hands_and_forearms', 'biceps', 'shoulders', 'face', 'chest_and_back'],
                stressLevelAfter: 3
            });
        }));
        it('should return effectiveness metrics', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.app)
                .get('/api/pmr/effectiveness')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('averageStressReduction');
            expect(response.body).toHaveProperty('totalSessions');
            expect(response.body).toHaveProperty('averageCompletionRate');
        }));
        it('should handle users with no sessions', () => __awaiter(void 0, void 0, void 0, function* () {
            const newToken = jsonwebtoken_1.default.sign({ _id: 'new-user', username: 'new-test-user' }, config_1.default.jwtSecret, { expiresIn: '1h' });
            const response = yield (0, supertest_1.default)(app_1.app)
                .get('/api/pmr/effectiveness')
                .set('Authorization', `Bearer ${newToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                averageStressReduction: 0,
                totalSessions: 0,
                averageCompletionRate: 0
            });
        }));
    });
    describe('Error Scenarios', () => {
        describe('Session Creation Errors', () => {
            it('should handle missing stress level', () => __awaiter(void 0, void 0, void 0, function* () {
                const response = yield (0, supertest_1.default)(app_1.app)
                    .post('/api/pmr/session')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({});
                expect(response.status).toBe(400);
                expect(response.body).toHaveProperty('error');
            }));
            it('should handle invalid stress level type', () => __awaiter(void 0, void 0, void 0, function* () {
                const response = yield (0, supertest_1.default)(app_1.app)
                    .post('/api/pmr/session')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({
                    stressLevelBefore: "high" // Should be number
                });
                expect(response.status).toBe(400);
                expect(response.body).toHaveProperty('error');
            }));
        });
        describe('Progress Update Errors', () => {
            let sessionId;
            beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
                const session = yield (0, supertest_1.default)(app_1.app)
                    .post('/api/pmr/session')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({ stressLevelBefore: 7 });
                sessionId = session.body._id;
            }));
            it('should handle invalid muscle group name', () => __awaiter(void 0, void 0, void 0, function* () {
                const response = yield (0, supertest_1.default)(app_1.app)
                    .put(`/api/pmr/session/${sessionId}/progress`)
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({
                    completedGroup: 'nonexistent_group'
                });
                expect(response.status).toBe(400);
                expect(response.body).toHaveProperty('error');
                expect(response.body.error).toMatch(/invalid muscle group/i);
            }));
            it('should prevent duplicate muscle group completion', () => __awaiter(void 0, void 0, void 0, function* () {
                yield (0, supertest_1.default)(app_1.app)
                    .put(`/api/pmr/session/${sessionId}/progress`)
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({
                    completedGroup: 'hands_and_forearms'
                });
                const response = yield (0, supertest_1.default)(app_1.app)
                    .put(`/api/pmr/session/${sessionId}/progress`)
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({
                    completedGroup: 'hands_and_forearms'
                });
                expect(response.status).toBe(400);
                expect(response.body).toHaveProperty('error');
                expect(response.body.error).toMatch(/already completed/i);
            }));
        });
        describe('Session Completion Errors', () => {
            it('should handle invalid session ID', () => __awaiter(void 0, void 0, void 0, function* () {
                const invalidId = new mongoose_1.default.Types.ObjectId();
                const response = yield (0, supertest_1.default)(app_1.app)
                    .put(`/api/pmr/session/${invalidId}/complete`)
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({
                    completedGroups: ['hands_and_forearms'],
                    stressLevelAfter: 3
                });
                expect(response.status).toBe(404);
                expect(response.body).toHaveProperty('error');
            }));
            it('should prevent completing already completed session', () => __awaiter(void 0, void 0, void 0, function* () {
                const session = yield (0, supertest_1.default)(app_1.app)
                    .post('/api/pmr/session')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({ stressLevelBefore: 7 });
                yield (0, supertest_1.default)(app_1.app)
                    .put(`/api/pmr/session/${session.body._id}/complete`)
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({
                    completedGroups: ['hands_and_forearms'],
                    stressLevelAfter: 3
                });
                const secondComplete = yield (0, supertest_1.default)(app_1.app)
                    .put(`/api/pmr/session/${session.body._id}/complete`)
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({
                    completedGroups: ['biceps'],
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
                    .post('/api/pmr/session')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({ stressLevelBefore: 7 });
                const otherUserToken = jsonwebtoken_1.default.sign({ id: 'other-user' }, config_1.default.jwtSecret, { expiresIn: '1h' });
                const response = yield (0, supertest_1.default)(app_1.app)
                    .put(`/api/pmr/session/${session.body._id}/progress`)
                    .set('Authorization', `Bearer ${otherUserToken}`)
                    .send({
                    completedGroup: 'hands_and_forearms'
                });
                expect(response.status).toBe(403);
                expect(response.body).toHaveProperty('error');
                expect(response.body.error).toMatch(/unauthorized/i);
            }));
            it('should handle malformed tokens', () => __awaiter(void 0, void 0, void 0, function* () {
                const response = yield (0, supertest_1.default)(app_1.app)
                    .get('/api/pmr/sessions')
                    .set('Authorization', 'Bearer invalid.token.here');
                expect(response.status).toBe(401);
                expect(response.body).toHaveProperty('error');
                expect(response.body.error).toMatch(/invalid token/i);
            }));
        });
        describe('Data Validation Errors', () => {
            it('should handle invalid stress level range', () => __awaiter(void 0, void 0, void 0, function* () {
                const response = yield (0, supertest_1.default)(app_1.app)
                    .post('/api/pmr/session')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({
                    stressLevelBefore: 15 // Out of range
                });
                expect(response.status).toBe(400);
                expect(response.body).toHaveProperty('error');
                expect(response.body.error).toMatch(/stress level/i);
            }));
            it('should handle invalid completed groups format', () => __awaiter(void 0, void 0, void 0, function* () {
                const session = yield (0, supertest_1.default)(app_1.app)
                    .post('/api/pmr/session')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({ stressLevelBefore: 7 });
                const response = yield (0, supertest_1.default)(app_1.app)
                    .put(`/api/pmr/session/${session.body._id}/complete`)
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({
                    completedGroups: 'not_an_array',
                    stressLevelAfter: 3
                });
                expect(response.status).toBe(400);
                expect(response.body).toHaveProperty('error');
                expect(response.body.error).toMatch(/completed groups/i);
            }));
        });
    });
});
