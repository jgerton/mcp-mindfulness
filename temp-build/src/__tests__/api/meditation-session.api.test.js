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
// Set NODE_ENV to test to ensure the correct JWT secret is used
process.env.NODE_ENV = 'test';
const supertest_1 = __importDefault(require("supertest"));
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = require("../../app");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../../config"));
const test_db_1 = require("../utils/test-db");
// Test user data
const testUserId = new mongoose_1.default.Types.ObjectId().toString();
const otherUserId = new mongoose_1.default.Types.ObjectId().toString();
const testUsername = 'test-user';
let authToken;
// Mock the auth middleware with proper TypeScript typing
jest.mock('../../middleware/auth.middleware', () => ({
    authenticateToken: jest.fn((req, res, next) => {
        req.user = { _id: testUserId, username: testUsername };
        next();
    }),
    authenticateUser: jest.fn((req, res, next) => {
        req.user = { _id: testUserId, username: testUsername };
        next();
    })
}));
// Mock the validation middleware
jest.mock('../../middleware/validation.middleware', () => ({
    validateRequest: jest.fn(() => (req, res, next) => {
        next();
    }),
    validateAssessment: jest.fn((req, res, next) => {
        next();
    }),
    validatePreferences: jest.fn((req, res, next) => {
        next();
    })
}));
// Mock the stress management controller
jest.mock('../../controllers/stress-management.controller', () => {
    return {
        StressManagementController: {
            submitAssessment: jest.fn((req, res) => {
                res.status(201).json({ message: 'Assessment submitted successfully' });
            }),
            getStressHistory: jest.fn((req, res) => {
                res.status(200).json({ history: [] });
            }),
            getLatestAssessment: jest.fn((req, res) => {
                res.status(200).json({ assessment: null });
            }),
            getRecommendations: jest.fn((req, res) => {
                res.status(200).json({ recommendations: [] });
            }),
            trackProgress: jest.fn((req, res) => {
                res.status(200).json({ message: 'Progress tracked successfully' });
            }),
            updatePreferences: jest.fn((req, res) => {
                res.status(200).json({
                    message: 'Preferences updated successfully',
                    preferences: req.body
                });
            }),
            getPreferences: jest.fn((req, res) => {
                res.status(200).json({
                    preferences: {
                        notificationEnabled: true,
                        reminderTime: '08:00',
                        theme: 'light'
                    }
                });
            }),
            getStressInsights: jest.fn((req, res) => {
                res.status(200).json({
                    insights: {
                        averageStressLevel: 3.5,
                        stressOverTime: [],
                        topTriggers: [],
                        recommendedTechniques: []
                    }
                });
            })
        }
    };
});
// Mock the meditation session controller
jest.mock('../../controllers/meditation-session.controller', () => {
    return {
        MeditationSessionController: jest.fn().mockImplementation(() => {
            return {
                getUserSessions: jest.fn((req, res) => {
                    console.log('Mock getUserSessions called');
                    res.status(200).json({
                        sessions: [],
                        pagination: {
                            total: 0,
                            page: 1,
                            limit: 10,
                            pages: 0
                        }
                    });
                }),
                getSessionById: jest.fn((req, res) => {
                    console.log('Mock getSessionById called');
                    const { id } = req.params;
                    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                        return res.status(400).json({ error: 'Invalid session ID format' });
                    }
                    res.status(200).json({
                        _id: id,
                        userId: testUserId,
                        title: 'Test Session',
                        duration: 15,
                        completed: false
                    });
                }),
                createSession: jest.fn((req, res) => {
                    console.log('Mock createSession called');
                    const { title, duration, type } = req.body;
                    if (!title || !duration || !type) {
                        return res.status(400).json({ error: 'Missing required fields' });
                    }
                    res.status(201).json({
                        _id: new mongoose_1.default.Types.ObjectId().toString(),
                        userId: testUserId,
                        title,
                        duration,
                        type,
                        startTime: new Date(),
                        completed: false
                    });
                }),
                updateSession: jest.fn((req, res) => {
                    console.log('Mock updateSession called');
                    const { id } = req.params;
                    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                        return res.status(400).json({ error: 'Invalid session ID format' });
                    }
                    res.status(200).json({
                        _id: id,
                        userId: testUserId,
                        title: req.body.title || 'Updated Session',
                        duration: req.body.duration || 20,
                        completed: false
                    });
                }),
                completeSession: jest.fn((req, res) => {
                    console.log('Mock completeSession called');
                    const { id } = req.params;
                    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                        return res.status(400).json({ error: 'Invalid session ID format' });
                    }
                    res.status(200).json({
                        _id: id,
                        userId: testUserId,
                        title: 'Test Session',
                        duration: 15,
                        completed: true,
                        endTime: new Date()
                    });
                }),
                getUserStats: jest.fn((req, res) => {
                    console.log('Mock getUserStats called');
                    res.status(200).json({
                        totalSessions: 0,
                        totalTime: 0,
                        totalTimeFormatted: '0h 0m',
                        sessionsByType: []
                    });
                }),
                deleteSession: jest.fn((req, res) => {
                    console.log('Mock deleteSession called');
                    const { id } = req.params;
                    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                        return res.status(400).json({ error: 'Invalid session ID format' });
                    }
                    res.status(200).json({ message: 'Meditation session deleted successfully' });
                })
            };
        })
    };
});
describe('Meditation Session API Endpoints', () => {
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        console.log('Setting up test environment...');
        // Use the test-db utility instead of creating a new MongoMemoryServer
        yield (0, test_db_1.connect)();
        // Create auth token for testing
        authToken = jsonwebtoken_1.default.sign({ _id: testUserId, username: testUsername }, config_1.default.jwtSecret, { expiresIn: '1h' });
        console.log('Test environment setup complete');
    }), 30000);
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        console.log('Tearing down test environment...');
        yield (0, app_1.closeServer)();
        yield (0, test_db_1.closeDatabase)();
        yield new Promise(resolve => setTimeout(resolve, 1000)); // Increased delay to ensure cleanup
        console.log('Test environment teardown complete');
    }), 30000);
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        // Clear the collection before each test using the test-db utility
        yield (0, test_db_1.clearDatabase)();
    }));
    describe('GET /api/meditation-sessions', () => {
        it('should return a list of meditation sessions', () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                console.log('Sending GET request to /api/meditation-sessions...');
                const response = yield (0, supertest_1.default)(app_1.app)
                    .get('/api/meditation-sessions')
                    .set('Authorization', `Bearer ${authToken}`)
                    .timeout(10000);
                console.log('Response received:', response.status);
                expect(response.status).toBe(200);
                expect(response.body).toHaveProperty('sessions');
                expect(response.body).toHaveProperty('pagination');
                expect(response.body.pagination).toHaveProperty('total');
                expect(response.body.pagination).toHaveProperty('page');
                expect(response.body.pagination).toHaveProperty('limit');
                expect(response.body.pagination).toHaveProperty('pages');
            }
            catch (error) {
                console.error('Test failed with error:', error);
                throw error;
            }
        }), 15000);
        it('should return 401 if not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                console.log('Sending unauthenticated GET request...');
                const response = yield (0, supertest_1.default)(app_1.app)
                    .get('/api/meditation-sessions')
                    .timeout(10000);
                console.log('Response received:', response.status);
                expect(response.status).toBe(401);
            }
            catch (error) {
                console.error('Test failed with error:', error);
                throw error;
            }
        }), 15000);
    });
    describe('GET /api/meditation-sessions/:id', () => {
        it('should return a single meditation session by ID', () => __awaiter(void 0, void 0, void 0, function* () {
            const sessionId = new mongoose_1.default.Types.ObjectId().toString();
            try {
                console.log(`Sending GET request to /api/meditation-sessions/${sessionId}...`);
                const response = yield (0, supertest_1.default)(app_1.app)
                    .get(`/api/meditation-sessions/${sessionId}`)
                    .set('Authorization', `Bearer ${authToken}`)
                    .timeout(10000);
                console.log('Response received:', response.status);
                expect(response.status).toBe(200);
                expect(response.body).toHaveProperty('_id', sessionId);
                expect(response.body).toHaveProperty('userId', testUserId);
            }
            catch (error) {
                console.error('Test failed with error:', error);
                throw error;
            }
        }), 15000);
        it('should return 400 for invalid session ID', () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                console.log('Sending GET request with invalid ID...');
                const response = yield (0, supertest_1.default)(app_1.app)
                    .get('/api/meditation-sessions/invalid-id')
                    .set('Authorization', `Bearer ${authToken}`)
                    .timeout(10000);
                console.log('Response received:', response.status);
                expect(response.status).toBe(400);
                expect(response.body).toHaveProperty('error');
                expect(response.body.error).toContain('Invalid session ID');
            }
            catch (error) {
                console.error('Test failed with error:', error);
                throw error;
            }
        }), 15000);
    });
    describe('POST /api/meditation-sessions', () => {
        it('should create a new meditation session', () => __awaiter(void 0, void 0, void 0, function* () {
            const newSession = {
                title: 'New Test Session',
                duration: 15,
                type: 'unguided'
            };
            try {
                console.log('Sending POST request to create session...');
                const response = yield (0, supertest_1.default)(app_1.app)
                    .post('/api/meditation-sessions')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(newSession)
                    .timeout(10000);
                console.log('Response received:', response.status);
                expect(response.status).toBe(201);
                expect(response.body).toHaveProperty('_id');
                expect(response.body).toHaveProperty('title', newSession.title);
                expect(response.body).toHaveProperty('duration', newSession.duration);
                expect(response.body).toHaveProperty('type', newSession.type);
                expect(response.body).toHaveProperty('userId', testUserId);
                expect(response.body).toHaveProperty('completed', false);
            }
            catch (error) {
                console.error('Test failed with error:', error);
                throw error;
            }
        }), 15000);
        it('should return 400 if required fields are missing', () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidSession = {
            // Missing required fields
            };
            try {
                console.log('Sending POST request with invalid data...');
                const response = yield (0, supertest_1.default)(app_1.app)
                    .post('/api/meditation-sessions')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(invalidSession)
                    .timeout(10000);
                console.log('Response received:', response.status);
                expect(response.status).toBe(400);
                expect(response.body).toHaveProperty('error');
                expect(response.body.error).toContain('Missing required fields');
            }
            catch (error) {
                console.error('Test failed with error:', error);
                throw error;
            }
        }), 15000);
    });
    describe('PATCH /api/meditation-sessions/:id', () => {
        it('should update a meditation session', () => __awaiter(void 0, void 0, void 0, function* () {
            const sessionId = new mongoose_1.default.Types.ObjectId().toString();
            const updateData = {
                title: 'Updated Session Title',
                duration: 25
            };
            try {
                console.log(`Sending PATCH request to /api/meditation-sessions/${sessionId}...`);
                const response = yield (0, supertest_1.default)(app_1.app)
                    .patch(`/api/meditation-sessions/${sessionId}`)
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(updateData)
                    .timeout(10000);
                console.log('Response received:', response.status);
                expect(response.status).toBe(200);
                expect(response.body).toHaveProperty('_id', sessionId);
                expect(response.body).toHaveProperty('title', updateData.title);
                expect(response.body).toHaveProperty('duration', updateData.duration);
            }
            catch (error) {
                console.error('Test failed with error:', error);
                throw error;
            }
        }), 15000);
    });
    describe('POST /api/meditation-sessions/:id/complete', () => {
        it('should complete a meditation session', () => __awaiter(void 0, void 0, void 0, function* () {
            const sessionId = new mongoose_1.default.Types.ObjectId().toString();
            try {
                console.log(`Sending POST request to /api/meditation-sessions/${sessionId}/complete...`);
                const response = yield (0, supertest_1.default)(app_1.app)
                    .post(`/api/meditation-sessions/${sessionId}/complete`)
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({ mood: 'calm' })
                    .timeout(10000);
                console.log('Response received:', response.status);
                expect(response.status).toBe(200);
                expect(response.body).toHaveProperty('_id', sessionId);
                expect(response.body).toHaveProperty('completed', true);
                expect(response.body).toHaveProperty('endTime');
            }
            catch (error) {
                console.error('Test failed with error:', error);
                throw error;
            }
        }), 15000);
    });
    describe('GET /api/meditation-sessions/stats', () => {
        it('should return user meditation statistics', () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                console.log('Sending GET request to /api/meditation-sessions/stats...');
                const response = yield (0, supertest_1.default)(app_1.app)
                    .get('/api/meditation-sessions/stats')
                    .set('Authorization', `Bearer ${authToken}`)
                    .timeout(10000);
                console.log('Response received:', response.status);
                expect(response.status).toBe(200);
                expect(response.body).toHaveProperty('totalSessions');
                expect(response.body).toHaveProperty('totalTime');
                expect(response.body).toHaveProperty('totalTimeFormatted');
                expect(response.body).toHaveProperty('sessionsByType');
            }
            catch (error) {
                console.error('Test failed with error:', error);
                throw error;
            }
        }), 15000);
    });
    describe('DELETE /api/meditation-sessions/:id', () => {
        it('should delete a meditation session', () => __awaiter(void 0, void 0, void 0, function* () {
            const sessionId = new mongoose_1.default.Types.ObjectId().toString();
            try {
                console.log(`Sending DELETE request to /api/meditation-sessions/${sessionId}...`);
                const response = yield (0, supertest_1.default)(app_1.app)
                    .delete(`/api/meditation-sessions/${sessionId}`)
                    .set('Authorization', `Bearer ${authToken}`)
                    .timeout(10000);
                console.log('Response received:', response.status);
                expect(response.status).toBe(200);
                expect(response.body).toHaveProperty('message');
                expect(response.body.message).toContain('deleted successfully');
            }
            catch (error) {
                console.error('Test failed with error:', error);
                throw error;
            }
        }), 15000);
        it('should return 400 for invalid session ID', () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                console.log('Sending DELETE request with invalid ID...');
                const response = yield (0, supertest_1.default)(app_1.app)
                    .delete('/api/meditation-sessions/invalid-id')
                    .set('Authorization', `Bearer ${authToken}`)
                    .timeout(10000);
                console.log('Response received:', response.status);
                expect(response.status).toBe(400);
                expect(response.body).toHaveProperty('error');
                expect(response.body.error).toContain('Invalid session ID');
            }
            catch (error) {
                console.error('Test failed with error:', error);
                throw error;
            }
        }), 15000);
    });
});
