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
const test_server_1 = require("../utils/test-server");
const stress_management_controller_1 = require("../../controllers/stress-management.controller");
const error_codes_1 = require("../../utils/error-codes");
jest.mock('../../controllers/stress-management.controller');
describe('Stress Management Routes', () => {
    let app;
    let authToken;
    const mockAssessment = {
        level: 7,
        symptoms: ['anxiety', 'tension'],
        triggers: ['work', 'deadlines'],
        timestamp: new Date().toISOString()
    };
    const mockHistory = [
        {
            level: 7,
            timestamp: '2024-01-01T10:00:00Z',
            triggers: ['work']
        },
        {
            level: 4,
            timestamp: '2024-01-02T10:00:00Z',
            triggers: ['family']
        }
    ];
    const mockAnalytics = {
        averageLevel: 5.5,
        peakHours: ['09:00', '17:00'],
        commonTriggers: ['work', 'family'],
        improvements: 65
    };
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        app = yield (0, test_server_1.createServer)();
        authToken = 'valid.jwt.token';
    }));
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('POST /:userId/assess', () => {
        it('should assess stress level successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            stress_management_controller_1.StressManagementController.assessStressLevel.mockImplementation((req, res) => {
                res.status(200).json({ stressLevel: mockAssessment.level });
            });
            const response = yield (0, supertest_1.default)(app)
                .post('/api/stress-management/user123/assess')
                .set('Authorization', `Bearer ${authToken}`)
                .send(mockAssessment);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('stressLevel', mockAssessment.level);
        }));
        it('should validate assessment data', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .post('/api/stress-management/user123/assess')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ level: 'invalid' });
            expect(response.status).toBe(400);
            expect(response.body.error.code).toBe(error_codes_1.ErrorCodes.VALIDATION_ERROR);
        }));
    });
    describe('GET /:userId/history', () => {
        it('should get stress history', () => __awaiter(void 0, void 0, void 0, function* () {
            stress_management_controller_1.StressManagementController.getStressHistory.mockImplementation((req, res) => {
                res.status(200).json({ history: mockHistory });
            });
            const response = yield (0, supertest_1.default)(app)
                .get('/api/stress-management/user123/history')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(response.body.history).toEqual(mockHistory);
        }));
        it('should handle empty history', () => __awaiter(void 0, void 0, void 0, function* () {
            stress_management_controller_1.StressManagementController.getStressHistory.mockImplementation((req, res) => {
                res.status(200).json({ history: [] });
            });
            const response = yield (0, supertest_1.default)(app)
                .get('/api/stress-management/user123/history')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(response.body.history).toHaveLength(0);
        }));
    });
    describe('GET /:userId/analytics', () => {
        it('should get stress analytics', () => __awaiter(void 0, void 0, void 0, function* () {
            stress_management_controller_1.StressManagementController.getStressAnalytics.mockImplementation((req, res) => {
                res.status(200).json(mockAnalytics);
            });
            const response = yield (0, supertest_1.default)(app)
                .get('/api/stress-management/user123/analytics')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockAnalytics);
        }));
        it('should handle insufficient data', () => __awaiter(void 0, void 0, void 0, function* () {
            stress_management_controller_1.StressManagementController.getStressAnalytics.mockImplementation((req, res) => {
                res.status(404).json({ error: 'Insufficient data for analysis' });
            });
            const response = yield (0, supertest_1.default)(app)
                .get('/api/stress-management/user123/analytics')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error');
        }));
    });
    describe('POST /:userId/record-change', () => {
        const changeData = {
            stressLevelBefore: 8,
            stressLevelAfter: 5,
            technique: 'deep-breathing'
        };
        it('should record stress level change', () => __awaiter(void 0, void 0, void 0, function* () {
            stress_management_controller_1.StressManagementController.recordStressChange.mockImplementation((req, res) => {
                res.sendStatus(200);
            });
            const response = yield (0, supertest_1.default)(app)
                .post('/api/stress-management/user123/record-change')
                .set('Authorization', `Bearer ${authToken}`)
                .send(changeData);
            expect(response.status).toBe(200);
        }));
        it('should validate stress level values', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .post('/api/stress-management/user123/record-change')
                .set('Authorization', `Bearer ${authToken}`)
                .send(Object.assign(Object.assign({}, changeData), { stressLevelBefore: 11 // Invalid value
             }));
            expect(response.status).toBe(400);
            expect(response.body.error.code).toBe(error_codes_1.ErrorCodes.VALIDATION_ERROR);
        }));
    });
    describe('GET /:userId/patterns', () => {
        const mockPatterns = {
            dailyPatterns: ['Morning anxiety', 'Evening relaxation'],
            weeklyPatterns: ['Monday stress peaks', 'Weekend recovery'],
            seasonalPatterns: ['Higher stress in winter']
        };
        it('should get stress patterns', () => __awaiter(void 0, void 0, void 0, function* () {
            stress_management_controller_1.StressManagementController.getStressPatterns.mockImplementation((req, res) => {
                res.status(200).json(mockPatterns);
            });
            const response = yield (0, supertest_1.default)(app)
                .get('/api/stress-management/user123/patterns')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockPatterns);
        }));
        it('should handle no patterns found', () => __awaiter(void 0, void 0, void 0, function* () {
            stress_management_controller_1.StressManagementController.getStressPatterns.mockImplementation((req, res) => {
                res.status(404).json({ error: 'No stress patterns found' });
            });
            const response = yield (0, supertest_1.default)(app)
                .get('/api/stress-management/user123/patterns')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error');
        }));
    });
    describe('GET /:userId/peak-hours', () => {
        const mockPeakHours = {
            morning: ['09:00', '11:00'],
            afternoon: ['14:00', '16:00'],
            evening: ['19:00']
        };
        it('should get peak stress hours', () => __awaiter(void 0, void 0, void 0, function* () {
            stress_management_controller_1.StressManagementController.getPeakStressHours.mockImplementation((req, res) => {
                res.status(200).json(mockPeakHours);
            });
            const response = yield (0, supertest_1.default)(app)
                .get('/api/stress-management/user123/peak-hours')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockPeakHours);
        }));
        it('should handle unauthorized access', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get('/api/stress-management/user123/peak-hours');
            expect(response.status).toBe(401);
            expect(response.body.error.code).toBe(error_codes_1.ErrorCodes.AUTHENTICATION_ERROR);
        }));
    });
});
