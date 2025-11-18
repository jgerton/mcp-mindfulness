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
const export_controller_1 = require("../../controllers/export.controller");
const error_codes_1 = require("../../utils/error-codes");
jest.mock('../../controllers/export.controller');
describe('Export Routes', () => {
    let app;
    let authToken;
    const mockAchievements = [
        {
            id: 'ach123',
            name: 'Meditation Master',
            description: 'Complete 10 meditation sessions',
            progress: 8,
            total: 10,
            dateEarned: null
        }
    ];
    const mockMeditations = [
        {
            id: 'med123',
            type: 'guided',
            duration: 600,
            completedAt: '2024-01-01T10:00:00Z',
            rating: 4
        }
    ];
    const mockStressLevels = [
        {
            id: 'stress123',
            level: 7,
            timestamp: '2024-01-01T09:00:00Z',
            notes: 'Pre-meditation'
        }
    ];
    const mockUserData = {
        profile: {
            id: 'user123',
            username: 'testuser',
            email: 'test@example.com'
        },
        achievements: mockAchievements,
        meditations: mockMeditations,
        stressAssessments: mockStressLevels
    };
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        app = yield (0, test_server_1.createServer)();
        authToken = 'valid.jwt.token';
    }));
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('GET /achievements', () => {
        it('should export achievements in JSON format', () => __awaiter(void 0, void 0, void 0, function* () {
            export_controller_1.ExportController.exportAchievements.mockImplementation((req, res) => {
                res.status(200).json({ data: mockAchievements });
            });
            const response = yield (0, supertest_1.default)(app)
                .get('/api/export/achievements')
                .set('Authorization', `Bearer ${authToken}`)
                .query({ format: 'json' });
            expect(response.status).toBe(200);
            expect(response.body.data).toEqual(mockAchievements);
        }));
        it('should export achievements in CSV format', () => __awaiter(void 0, void 0, void 0, function* () {
            const csvContent = 'id,name,description,progress,total,dateEarned\nach123,Meditation Master,Complete 10 meditation sessions,8,10,';
            export_controller_1.ExportController.exportAchievements.mockImplementation((req, res) => {
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', 'attachment; filename="achievements.csv"');
                res.status(200).send(csvContent);
            });
            const response = yield (0, supertest_1.default)(app)
                .get('/api/export/achievements')
                .set('Authorization', `Bearer ${authToken}`)
                .query({ format: 'csv' });
            expect(response.status).toBe(200);
            expect(response.header['content-type']).toBe('text/csv');
            expect(response.text).toBe(csvContent);
        }));
        it('should filter achievements by date range', () => __awaiter(void 0, void 0, void 0, function* () {
            export_controller_1.ExportController.exportAchievements.mockImplementation((req, res) => {
                res.status(200).json({ data: mockAchievements });
            });
            const response = yield (0, supertest_1.default)(app)
                .get('/api/export/achievements')
                .set('Authorization', `Bearer ${authToken}`)
                .query({
                startDate: '2024-01-01',
                endDate: '2024-01-31'
            });
            expect(response.status).toBe(200);
            expect(response.body.data).toEqual(mockAchievements);
        }));
        it('should handle unauthorized access', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get('/api/export/achievements');
            expect(response.status).toBe(401);
            expect(response.body.error.code).toBe(error_codes_1.ErrorCodes.AUTHENTICATION_ERROR);
        }));
        it('should handle invalid date format', () => __awaiter(void 0, void 0, void 0, function* () {
            export_controller_1.ExportController.exportAchievements.mockImplementation((req, res) => {
                res.status(400).json({ error: 'Invalid date format' });
            });
            const response = yield (0, supertest_1.default)(app)
                .get('/api/export/achievements')
                .set('Authorization', `Bearer ${authToken}`)
                .query({
                startDate: 'invalid-date'
            });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        }));
        it('should require authentication', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get('/api/export/achievements');
            expect(response.status).toBe(401);
            expect(response.body.error.code).toBe(error_codes_1.ErrorCodes.AUTHENTICATION_ERROR);
        }));
    });
    describe('GET /meditations', () => {
        it('should export meditations in JSON format', () => __awaiter(void 0, void 0, void 0, function* () {
            export_controller_1.ExportController.exportMeditations.mockImplementation((req, res) => {
                res.status(200).json({ data: mockMeditations });
            });
            const response = yield (0, supertest_1.default)(app)
                .get('/api/export/meditations')
                .set('Authorization', `Bearer ${authToken}`)
                .query({ format: 'json' });
            expect(response.status).toBe(200);
            expect(response.body.data).toEqual(mockMeditations);
        }));
        it('should export meditations in CSV format', () => __awaiter(void 0, void 0, void 0, function* () {
            const csvContent = 'id,type,duration,completedAt,rating\nmed123,guided,600,2024-01-01T10:00:00Z,4';
            export_controller_1.ExportController.exportMeditations.mockImplementation((req, res) => {
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', 'attachment; filename="meditations.csv"');
                res.status(200).send(csvContent);
            });
            const response = yield (0, supertest_1.default)(app)
                .get('/api/export/meditations')
                .set('Authorization', `Bearer ${authToken}`)
                .query({ format: 'csv' });
            expect(response.status).toBe(200);
            expect(response.header['content-type']).toBe('text/csv');
            expect(response.text).toBe(csvContent);
        }));
        it('should handle server error', () => __awaiter(void 0, void 0, void 0, function* () {
            export_controller_1.ExportController.exportMeditations.mockImplementation((req, res) => {
                res.status(500).json({ error: 'Failed to export meditations' });
            });
            const response = yield (0, supertest_1.default)(app)
                .get('/api/export/meditations')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error');
        }));
        it('should handle empty results', () => __awaiter(void 0, void 0, void 0, function* () {
            export_controller_1.ExportController.exportMeditations.mockImplementation((req, res) => {
                res.status(200).json({ data: [] });
            });
            const response = yield (0, supertest_1.default)(app)
                .get('/api/export/meditations')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(response.body.data).toHaveLength(0);
        }));
    });
    describe('GET /stress-levels', () => {
        it('should export stress levels in JSON format', () => __awaiter(void 0, void 0, void 0, function* () {
            export_controller_1.ExportController.exportStressLevels.mockImplementation((req, res) => {
                res.status(200).json({ data: mockStressLevels });
            });
            const response = yield (0, supertest_1.default)(app)
                .get('/api/export/stress-levels')
                .set('Authorization', `Bearer ${authToken}`)
                .query({ format: 'json' });
            expect(response.status).toBe(200);
            expect(response.body.data).toEqual(mockStressLevels);
        }));
        it('should export stress levels in CSV format', () => __awaiter(void 0, void 0, void 0, function* () {
            const csvContent = 'id,level,timestamp,notes\nstress123,7,2024-01-01T09:00:00Z,Pre-meditation';
            export_controller_1.ExportController.exportStressLevels.mockImplementation((req, res) => {
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', 'attachment; filename="stress-levels.csv"');
                res.status(200).send(csvContent);
            });
            const response = yield (0, supertest_1.default)(app)
                .get('/api/export/stress-levels')
                .set('Authorization', `Bearer ${authToken}`)
                .query({ format: 'csv' });
            expect(response.status).toBe(200);
            expect(response.header['content-type']).toBe('text/csv');
            expect(response.text).toBe(csvContent);
        }));
        it('should handle date range filtering', () => __awaiter(void 0, void 0, void 0, function* () {
            export_controller_1.ExportController.exportStressLevels.mockImplementation((req, res) => {
                res.status(200).json({ data: mockStressLevels });
            });
            const response = yield (0, supertest_1.default)(app)
                .get('/api/export/stress-levels')
                .set('Authorization', `Bearer ${authToken}`)
                .query({
                startDate: '2024-01-01',
                endDate: '2024-01-31'
            });
            expect(response.status).toBe(200);
            expect(response.body.data).toEqual(mockStressLevels);
        }));
        it('should require authentication', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get('/api/export/stress-levels');
            expect(response.status).toBe(401);
            expect(response.body.error.code).toBe(error_codes_1.ErrorCodes.AUTHENTICATION_ERROR);
        }));
    });
    describe('GET /user-data', () => {
        it('should export all user data in JSON format', () => __awaiter(void 0, void 0, void 0, function* () {
            export_controller_1.ExportController.exportUserData.mockImplementation((req, res) => {
                res.status(200).json({ data: mockUserData });
            });
            const response = yield (0, supertest_1.default)(app)
                .get('/api/export/user-data')
                .set('Authorization', `Bearer ${authToken}`)
                .query({ format: 'json' });
            expect(response.status).toBe(200);
            expect(response.body.data).toEqual(mockUserData);
        }));
        it('should export all user data in CSV format', () => __awaiter(void 0, void 0, void 0, function* () {
            const csvContent = 'category,data\nprofile,{"id":"user123","username":"testuser"}\nachievements,1 achievement(s)\nmeditations,1 session(s)\nstressAssessments,1 assessment(s)';
            export_controller_1.ExportController.exportUserData.mockImplementation((req, res) => {
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', 'attachment; filename="user-data.csv"');
                res.status(200).send(csvContent);
            });
            const response = yield (0, supertest_1.default)(app)
                .get('/api/export/user-data')
                .set('Authorization', `Bearer ${authToken}`)
                .query({ format: 'csv' });
            expect(response.status).toBe(200);
            expect(response.header['content-type']).toBe('text/csv');
            expect(response.text).toBe(csvContent);
        }));
        it('should handle server error', () => __awaiter(void 0, void 0, void 0, function* () {
            export_controller_1.ExportController.exportUserData.mockImplementation((req, res) => {
                res.status(500).json({ error: 'Failed to export user data' });
            });
            const response = yield (0, supertest_1.default)(app)
                .get('/api/export/user-data')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error');
        }));
        it('should require authentication', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get('/api/export/user-data');
            expect(response.status).toBe(401);
            expect(response.body.error.code).toBe(error_codes_1.ErrorCodes.AUTHENTICATION_ERROR);
        }));
        it('should handle invalid export format', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get('/api/export/user-data')
                .set('Authorization', `Bearer ${authToken}`)
                .query({ format: 'invalid' });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        }));
    });
});
