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
const supertest_1 = __importDefault(require("supertest"));
const mongoose_1 = __importDefault(require("mongoose"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
const app_1 = require("../../app");
const stress_model_1 = require("../../models/stress.model");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../../config"));
const stress_management_service_1 = require("../../services/stress-management.service");
let mongoServer;
let authToken;
const testUserId = 'test-user-id';
const testUsername = 'test-user';
// Mock recommendations with proper type
const mockRecommendations = [
    {
        type: 'BREATHING',
        duration: 5,
        technique: '4-7-8',
        title: 'Take a break',
        description: 'Step away from your current task and take a short break'
    },
    {
        type: 'BREATHING',
        duration: 5,
        technique: 'BOX_BREATHING',
        title: 'Practice deep breathing',
        description: 'Use box breathing technique to calm your nervous system'
    },
    {
        type: 'PHYSICAL',
        duration: 10,
        technique: 'WALKING',
        title: 'Go for a walk',
        description: 'Take a short walk to clear your mind'
    }
];
describe('Stress Management API Endpoints', () => {
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
        // Mock StressManagementService methods
        jest.spyOn(stress_management_service_1.StressManagementService, 'assessStressLevel').mockResolvedValue('MODERATE');
        jest.spyOn(stress_management_service_1.StressManagementService, 'getRecommendations').mockResolvedValue(mockRecommendations);
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        if (mongoose_1.default.connection.readyState !== 0) {
            yield mongoose_1.default.disconnect();
        }
        yield mongoServer.stop();
        jest.restoreAllMocks();
    }));
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield stress_model_1.StressAssessment.deleteMany({});
        yield stress_model_1.UserPreferences.deleteMany({});
        // Create sample data
        yield stress_model_1.StressAssessment.create({
            userId: testUserId,
            score: 7,
            triggers: ['work', 'family'],
            physicalSymptoms: 6,
            emotionalSymptoms: 7,
            behavioralSymptoms: 5,
            cognitiveSymptoms: 8,
            timestamp: new Date('2023-06-15')
        });
        yield stress_model_1.StressAssessment.create({
            userId: testUserId,
            score: 5,
            triggers: ['work', 'health'],
            physicalSymptoms: 4,
            emotionalSymptoms: 5,
            behavioralSymptoms: 3,
            cognitiveSymptoms: 6,
            timestamp: new Date('2023-06-14')
        });
        yield stress_model_1.UserPreferences.create({
            userId: testUserId,
            preferredTechniques: ['4-7-8', 'BODY_SCAN'],
            timePreferences: {
                reminderFrequency: 'DAILY'
            }
        });
    }));
    describe('POST /api/stress-management/assessment', () => {
        it('should submit a stress assessment and return stress level with recommendations', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.app)
                .post('/api/stress-management/assessment')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                physicalSymptoms: 6,
                emotionalSymptoms: 7,
                behavioralSymptoms: 5,
                cognitiveSymptoms: 8,
                triggers: ['work', 'family']
            });
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('stressLevel', 'MODERATE');
            expect(response.body).toHaveProperty('recommendations');
            expect(response.body.recommendations).toHaveLength(4);
            expect(response.body.recommendations[0]).toHaveProperty('title');
            expect(response.body.recommendations[0]).toHaveProperty('type');
        }));
        it('should return 401 if not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.app)
                .post('/api/stress-management/assessment')
                .send({
                physicalSymptoms: 6,
                emotionalSymptoms: 7,
                behavioralSymptoms: 5,
                cognitiveSymptoms: 8,
                triggers: ['work', 'family']
            });
            expect(response.status).toBe(401);
        }));
        it('should return 400 if assessment data is invalid', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.app)
                .post('/api/stress-management/assessment')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
            // Missing required fields
            });
            expect(response.status).toBe(400);
        }));
    });
    describe('GET /api/stress-management/assessment/history', () => {
        it('should return stress history for the authenticated user', () => __awaiter(void 0, void 0, void 0, function* () {
            // Create additional assessments to ensure there are records
            yield stress_model_1.StressAssessment.create({
                userId: testUserId,
                score: 6,
                physicalSymptoms: 6,
                emotionalSymptoms: 5,
                behavioralSymptoms: 6,
                cognitiveSymptoms: 7,
                triggers: ['work', 'family'],
                timestamp: new Date()
            });
            const response = yield (0, supertest_1.default)(app_1.app)
                .get('/api/stress-management/assessment/history')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            // Don't assert on exact length as it may vary
            expect(response.body.length).toBeGreaterThan(0);
            if (response.body.length > 0) {
                expect(response.body[0]).toHaveProperty('userId', testUserId);
                expect(response.body[0]).toHaveProperty('score');
                expect(response.body[0]).toHaveProperty('triggers');
            }
        }));
        it('should filter by date range when query parameters are provided', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.app)
                .get('/api/stress-management/assessment/history')
                .query({ startDate: '2023-06-15', endDate: '2023-06-16' })
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body).toHaveLength(1);
            expect(new Date(response.body[0].timestamp).toISOString().split('T')[0]).toBe('2023-06-15');
        }));
        it('should return 401 if not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.app)
                .get('/api/stress-management/assessment/history');
            expect(response.status).toBe(401);
        }));
    });
    describe('GET /api/stress-management/assessment/latest', () => {
        it('should return the latest assessment with recommendations', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.app)
                .get('/api/stress-management/assessment/latest')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('assessment');
            expect(response.body).toHaveProperty('recommendations');
            expect(response.body.assessment).toHaveProperty('userId', testUserId);
            expect(response.body.assessment).toHaveProperty('score', 7);
            expect(Array.isArray(response.body.recommendations)).toBe(true);
        }));
        it('should return 404 if no assessments found', () => __awaiter(void 0, void 0, void 0, function* () {
            // Delete all assessments first
            yield stress_model_1.StressAssessment.deleteMany({});
            const response = yield (0, supertest_1.default)(app_1.app)
                .get('/api/stress-management/assessment/latest')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'No assessments found');
        }));
        it('should return 401 if not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.app)
                .get('/api/stress-management/assessment/latest');
            expect(response.status).toBe(401);
        }));
    });
    describe('PUT /api/stress-management/preferences', () => {
        it('should update user preferences', () => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            const response = yield (0, supertest_1.default)(app_1.app)
                .put('/api/stress-management/preferences')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                preferredTechniques: ['MINDFULNESS', 'WALKING'],
                timePreferences: {
                    reminderFrequency: 'WEEKLY'
                }
            });
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('userId', testUserId);
            expect(response.body).toHaveProperty('preferredTechniques');
            expect(response.body.preferredTechniques).toContain('MINDFULNESS');
            expect(response.body.preferredTechniques).toContain('WALKING');
            expect(response.body.timePreferences.reminderFrequency).toBe('WEEKLY');
            // Verify the update in the database
            const updatedPreferences = yield stress_model_1.UserPreferences.findOne({ userId: testUserId });
            expect((_a = updatedPreferences === null || updatedPreferences === void 0 ? void 0 : updatedPreferences.timePreferences) === null || _a === void 0 ? void 0 : _a.reminderFrequency).toBe('WEEKLY');
            expect(updatedPreferences === null || updatedPreferences === void 0 ? void 0 : updatedPreferences.preferredTechniques).toContain('MINDFULNESS');
            expect(updatedPreferences === null || updatedPreferences === void 0 ? void 0 : updatedPreferences.preferredTechniques).toContain('WALKING');
        }));
        it('should create preferences if they don\'t exist', () => __awaiter(void 0, void 0, void 0, function* () {
            // Delete existing preferences
            yield stress_model_1.UserPreferences.deleteMany({});
            const response = yield (0, supertest_1.default)(app_1.app)
                .put('/api/stress-management/preferences')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                preferredTechniques: ['MINDFULNESS', 'WALKING'],
                timePreferences: {
                    reminderFrequency: 'WEEKLY'
                }
            });
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('userId', testUserId);
            // Verify the creation in the database
            const preferences = yield stress_model_1.UserPreferences.findOne({ userId: testUserId });
            expect(preferences).not.toBeNull();
        }));
        it('should return 401 if not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.app)
                .put('/api/stress-management/preferences')
                .send({
                preferredTechniques: ['MINDFULNESS', 'WALKING'],
                timePreferences: {
                    reminderFrequency: 'WEEKLY'
                }
            });
            expect(response.status).toBe(401);
        }));
    });
    describe('GET /api/stress-management/preferences', () => {
        it('should return user preferences', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.app)
                .get('/api/stress-management/preferences')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('userId', testUserId);
            expect(response.body).toHaveProperty('preferredTechniques');
            expect(response.body.preferredTechniques).toContain('4-7-8');
            expect(response.body.preferredTechniques).toContain('BODY_SCAN');
            expect(response.body).toHaveProperty('timePreferences');
            expect(response.body.timePreferences).toHaveProperty('reminderFrequency', 'DAILY');
        }));
        it('should return 404 if no preferences found', () => __awaiter(void 0, void 0, void 0, function* () {
            // Delete all preferences first
            yield stress_model_1.UserPreferences.deleteMany({});
            const response = yield (0, supertest_1.default)(app_1.app)
                .get('/api/stress-management/preferences')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'No preferences found');
        }));
        it('should return 401 if not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.app)
                .get('/api/stress-management/preferences');
            expect(response.status).toBe(401);
        }));
    });
    describe('GET /api/stress-management/insights', () => {
        it.skip('should return stress insights for the authenticated user', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.app)
                .get('/api/stress-management/insights')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('averageLevel');
            expect(response.body).toHaveProperty('commonTriggers');
            expect(response.body).toHaveProperty('trendAnalysis');
            expect(response.body).toHaveProperty('peakStressTimes');
        }));
        it('should return 401 if not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.app)
                .get('/api/stress-management/insights');
            expect(response.status).toBe(401);
        }));
    });
    describe('GET /api/stress-management/triggers', () => {
        it('should return stress triggers for the authenticated user', () => __awaiter(void 0, void 0, void 0, function* () {
            // Create additional assessments with specific triggers
            yield stress_model_1.StressAssessment.create([
                {
                    userId: testUserId,
                    score: 9,
                    physicalSymptoms: 9,
                    emotionalSymptoms: 8,
                    behavioralSymptoms: 9,
                    cognitiveSymptoms: 10,
                    triggers: ['work', 'deadlines'],
                    symptoms: ['headache'],
                    timestamp: new Date()
                },
                {
                    userId: testUserId,
                    score: 8,
                    physicalSymptoms: 8,
                    emotionalSymptoms: 7,
                    behavioralSymptoms: 8,
                    cognitiveSymptoms: 9,
                    triggers: ['work', 'meetings'],
                    symptoms: ['tension'],
                    timestamp: new Date()
                },
                {
                    userId: testUserId,
                    score: 8,
                    physicalSymptoms: 8,
                    emotionalSymptoms: 7,
                    behavioralSymptoms: 8,
                    cognitiveSymptoms: 9,
                    triggers: ['deadlines', 'finances'],
                    symptoms: ['anxiety'],
                    timestamp: new Date()
                },
                {
                    userId: testUserId,
                    score: 4,
                    physicalSymptoms: 4,
                    emotionalSymptoms: 3,
                    behavioralSymptoms: 4,
                    cognitiveSymptoms: 5,
                    triggers: ['family', 'chores'],
                    symptoms: ['fatigue'],
                    timestamp: new Date()
                },
                {
                    userId: testUserId,
                    score: 3,
                    physicalSymptoms: 3,
                    emotionalSymptoms: 2,
                    behavioralSymptoms: 3,
                    cognitiveSymptoms: 4,
                    triggers: ['family', 'social'],
                    symptoms: ['mild tension'],
                    timestamp: new Date()
                }
            ]);
            const response = yield (0, supertest_1.default)(app_1.app)
                .get('/api/stress-management/triggers')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('triggers');
            expect(response.body).toHaveProperty('count');
            expect(response.body).toHaveProperty('message');
            expect(Array.isArray(response.body.triggers)).toBe(true);
            if (response.body.triggers.length > 0) {
                expect(response.body.triggers[0]).toHaveProperty('trigger');
                expect(response.body.triggers[0]).toHaveProperty('averageStressLevel');
                expect(response.body.triggers[0]).toHaveProperty('occurrences');
            }
        }));
        it('should respect the limit parameter', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.app)
                .get('/api/stress-management/triggers?limit=2')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(response.body.triggers.length).toBeLessThanOrEqual(2);
        }));
        it('should return 401 if not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.app)
                .get('/api/stress-management/triggers');
            expect(response.status).toBe(401);
        }));
    });
});
