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
const stress_technique_controller_1 = require("../../controllers/stress-technique.controller");
const supertest_1 = __importDefault(require("supertest"));
const server_1 = require("../../utils/server");
const error_codes_1 = require("../../utils/error-codes");
jest.mock('../../controllers/stress-technique.controller');
describe('Stress Technique Routes', () => {
    let app;
    let authToken;
    const mockTechnique = {
        id: 'tech123',
        name: 'Deep Breathing',
        description: 'A calming breathing exercise',
        category: 'breathing',
        difficulty: 'beginner',
        duration: 300,
        steps: ['Inhale slowly', 'Hold breath', 'Exhale slowly'],
        benefits: ['Reduces anxiety', 'Improves focus']
    };
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        app = yield (0, server_1.createServer)();
        authToken = 'valid.jwt.token';
    }));
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('GET /', () => {
        it('should get all techniques with pagination', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockTechniques = [mockTechnique];
            stress_technique_controller_1.StressTechniqueController.getAllTechniques.mockImplementation((req, res) => {
                res.status(200).json({
                    techniques: mockTechniques,
                    page: 1,
                    totalPages: 1,
                    totalItems: 1
                });
            });
            const response = yield (0, supertest_1.default)(app)
                .get('/api/stress-techniques')
                .query({ page: 1, limit: 10 });
            expect(response.status).toBe(200);
            expect(response.body.techniques).toEqual(mockTechniques);
            expect(response.body).toHaveProperty('page');
            expect(response.body).toHaveProperty('totalPages');
        }));
        it('should handle server error', () => __awaiter(void 0, void 0, void 0, function* () {
            stress_technique_controller_1.StressTechniqueController.getAllTechniques.mockImplementation((req, res) => {
                res.status(500).json({ error: 'Internal server error' });
            });
            const response = yield (0, supertest_1.default)(app)
                .get('/api/stress-techniques');
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error');
        }));
    });
    describe('GET /:id', () => {
        it('should get technique by id', () => __awaiter(void 0, void 0, void 0, function* () {
            stress_technique_controller_1.StressTechniqueController.getTechniqueById.mockImplementation((req, res) => {
                res.status(200).json(mockTechnique);
            });
            const response = yield (0, supertest_1.default)(app)
                .get(`/api/stress-techniques/${mockTechnique.id}`);
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockTechnique);
        }));
        it('should handle non-existent technique', () => __awaiter(void 0, void 0, void 0, function* () {
            stress_technique_controller_1.StressTechniqueController.getTechniqueById.mockImplementation((req, res) => {
                res.status(404).json({ error: 'Technique not found' });
            });
            const response = yield (0, supertest_1.default)(app)
                .get('/api/stress-techniques/nonexistent');
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error');
        }));
    });
    describe('GET /category/:category', () => {
        it('should get techniques by category', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockTechniques = [mockTechnique];
            stress_technique_controller_1.StressTechniqueController.getTechniquesByCategory.mockImplementation((req, res) => {
                res.status(200).json({ techniques: mockTechniques });
            });
            const response = yield (0, supertest_1.default)(app)
                .get('/api/stress-techniques/category/breathing');
            expect(response.status).toBe(200);
            expect(response.body.techniques).toEqual(mockTechniques);
        }));
        it('should handle empty category results', () => __awaiter(void 0, void 0, void 0, function* () {
            stress_technique_controller_1.StressTechniqueController.getTechniquesByCategory.mockImplementation((req, res) => {
                res.status(200).json({ techniques: [] });
            });
            const response = yield (0, supertest_1.default)(app)
                .get('/api/stress-techniques/category/nonexistent');
            expect(response.status).toBe(200);
            expect(response.body.techniques).toHaveLength(0);
        }));
    });
    describe('GET /difficulty/:level', () => {
        it('should get techniques by difficulty', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockTechniques = [mockTechnique];
            stress_technique_controller_1.StressTechniqueController.getTechniquesByDifficulty.mockImplementation((req, res) => {
                res.status(200).json({ techniques: mockTechniques });
            });
            const response = yield (0, supertest_1.default)(app)
                .get('/api/stress-techniques/difficulty/beginner');
            expect(response.status).toBe(200);
            expect(response.body.techniques).toEqual(mockTechniques);
        }));
        it('should handle invalid difficulty level', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get('/api/stress-techniques/difficulty/invalid');
            expect(response.status).toBe(400);
            expect(response.body.error.code).toBe(error_codes_1.ErrorCodes.VALIDATION_ERROR);
        }));
    });
    describe('GET /search', () => {
        it('should search techniques', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockTechniques = [mockTechnique];
            stress_technique_controller_1.StressTechniqueController.searchTechniques.mockImplementation((req, res) => {
                res.status(200).json({ techniques: mockTechniques });
            });
            const response = yield (0, supertest_1.default)(app)
                .get('/api/stress-techniques/search')
                .query({ q: 'breathing' });
            expect(response.status).toBe(200);
            expect(response.body.techniques).toEqual(mockTechniques);
        }));
        it('should handle missing search query', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get('/api/stress-techniques/search');
            expect(response.status).toBe(400);
            expect(response.body.error.code).toBe(error_codes_1.ErrorCodes.VALIDATION_ERROR);
        }));
    });
    describe('GET /recommendations', () => {
        it('should get recommended techniques', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockTechniques = [mockTechnique];
            stress_technique_controller_1.StressTechniqueController.getRecommendedTechniques.mockImplementation((req, res) => {
                res.status(200).json({ techniques: mockTechniques });
            });
            const response = yield (0, supertest_1.default)(app)
                .get('/api/stress-techniques/recommendations')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(response.body.techniques).toEqual(mockTechniques);
        }));
        it('should handle unauthorized access', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get('/api/stress-techniques/recommendations');
            expect(response.status).toBe(401);
            expect(response.body.error.code).toBe(error_codes_1.ErrorCodes.AUTHENTICATION_ERROR);
        }));
    });
    describe('POST /', () => {
        it('should create new technique', () => __awaiter(void 0, void 0, void 0, function* () {
            const newTechnique = Object.assign({}, mockTechnique);
            delete newTechnique.id;
            stress_technique_controller_1.StressTechniqueController.createTechnique.mockImplementation((req, res) => {
                res.status(201).json(mockTechnique);
            });
            const response = yield (0, supertest_1.default)(app)
                .post('/api/stress-techniques')
                .set('Authorization', `Bearer ${authToken}`)
                .send(newTechnique);
            expect(response.status).toBe(201);
            expect(response.body).toEqual(mockTechnique);
        }));
        it('should validate required fields', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .post('/api/stress-techniques')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                name: 'Test Technique'
                // Missing required fields
            });
            expect(response.status).toBe(400);
            expect(response.body.error.code).toBe(error_codes_1.ErrorCodes.VALIDATION_ERROR);
        }));
    });
    describe('DELETE /:id', () => {
        it('should delete technique', () => __awaiter(void 0, void 0, void 0, function* () {
            stress_technique_controller_1.StressTechniqueController.deleteTechnique.mockImplementation((req, res) => {
                res.sendStatus(204);
            });
            const response = yield (0, supertest_1.default)(app)
                .delete(`/api/stress-techniques/${mockTechnique.id}`)
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(204);
        }));
        it('should handle non-existent technique', () => __awaiter(void 0, void 0, void 0, function* () {
            stress_technique_controller_1.StressTechniqueController.deleteTechnique.mockImplementation((req, res) => {
                res.status(404).json({ error: 'Technique not found' });
            });
            const response = yield (0, supertest_1.default)(app)
                .delete('/api/stress-techniques/nonexistent')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error');
        }));
        it('should handle unauthorized deletion', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .delete(`/api/stress-techniques/${mockTechnique.id}`);
            expect(response.status).toBe(401);
            expect(response.body.error.code).toBe(error_codes_1.ErrorCodes.AUTHENTICATION_ERROR);
        }));
    });
});
