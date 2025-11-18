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
const user_controller_1 = require("../../controllers/user.controller");
const error_codes_1 = require("../../utils/error-codes");
jest.mock('../../controllers/user.controller');
describe('User Routes', () => {
    let app;
    let authToken;
    const mockUser = {
        _id: 'user123',
        username: 'testuser',
        email: 'test@example.com',
        friendIds: ['friend1', 'friend2'],
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    const mockStats = {
        totalMeditations: 50,
        totalMeditationTime: 1500,
        streakDays: 7,
        achievements: 10
    };
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        app = yield (0, server_1.createServer)();
        authToken = 'valid.jwt.token';
    }));
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('GET /api/users/profile', () => {
        it('should get user profile successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            user_controller_1.UserController.prototype.getProfile.mockImplementation((req, res) => {
                res.status(200).json(mockUser);
            });
            const response = yield (0, supertest_1.default)(app)
                .get('/api/users/profile')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockUser);
        }));
        it('should return 401 without auth token', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get('/api/users/profile');
            expect(response.status).toBe(401);
            expect(response.body.error.code).toBe(error_codes_1.ErrorCodes.AUTHENTICATION_ERROR);
        }));
        it('should return 404 for non-existent user', () => __awaiter(void 0, void 0, void 0, function* () {
            user_controller_1.UserController.prototype.getProfile.mockImplementation((req, res) => {
                res.status(404).json({
                    error: {
                        code: error_codes_1.ErrorCodes.NOT_FOUND,
                        message: 'User not found'
                    }
                });
            });
            const response = yield (0, supertest_1.default)(app)
                .get('/api/users/profile')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(404);
            expect(response.body.error.code).toBe(error_codes_1.ErrorCodes.NOT_FOUND);
        }));
        it('should handle server errors', () => __awaiter(void 0, void 0, void 0, function* () {
            user_controller_1.UserController.prototype.getProfile.mockImplementation((req, res) => {
                res.status(500).json({
                    error: {
                        code: error_codes_1.ErrorCodes.INTERNAL_ERROR,
                        message: 'Internal server error'
                    }
                });
            });
            const response = yield (0, supertest_1.default)(app)
                .get('/api/users/profile')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(500);
            expect(response.body.error.code).toBe(error_codes_1.ErrorCodes.INTERNAL_ERROR);
        }));
    });
    describe('PUT /api/users/profile', () => {
        const updateData = {
            username: 'newusername',
            email: 'new.email@example.com',
            preferences: {
                theme: 'dark',
                notifications: true
            }
        };
        it('should update user profile successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            user_controller_1.UserController.prototype.updateProfile.mockImplementation((req, res) => {
                res.status(200).json(Object.assign(Object.assign(Object.assign({}, mockUser), updateData), { updatedAt: new Date().toISOString() }));
            });
            const response = yield (0, supertest_1.default)(app)
                .put('/api/users/profile')
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData);
            expect(response.status).toBe(200);
            expect(response.body).toEqual(expect.objectContaining(updateData));
        }));
        it('should return 401 without auth token', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .put('/api/users/profile')
                .send(updateData);
            expect(response.status).toBe(401);
            expect(response.body.error.code).toBe(error_codes_1.ErrorCodes.AUTHENTICATION_ERROR);
        }));
        it('should return 400 for invalid update data', () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidData = {
                email: 'invalid-email', // Invalid email format
                username: '' // Empty username
            };
            user_controller_1.UserController.prototype.updateProfile.mockImplementation((req, res) => {
                res.status(400).json({
                    error: {
                        code: error_codes_1.ErrorCodes.VALIDATION_ERROR,
                        message: 'Invalid update data'
                    }
                });
            });
            const response = yield (0, supertest_1.default)(app)
                .put('/api/users/profile')
                .set('Authorization', `Bearer ${authToken}`)
                .send(invalidData);
            expect(response.status).toBe(400);
            expect(response.body.error.code).toBe(error_codes_1.ErrorCodes.VALIDATION_ERROR);
        }));
        it('should return 404 for non-existent user', () => __awaiter(void 0, void 0, void 0, function* () {
            user_controller_1.UserController.prototype.updateProfile.mockImplementation((req, res) => {
                res.status(404).json({
                    error: {
                        code: error_codes_1.ErrorCodes.NOT_FOUND,
                        message: 'User not found'
                    }
                });
            });
            const response = yield (0, supertest_1.default)(app)
                .put('/api/users/profile')
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData);
            expect(response.status).toBe(404);
            expect(response.body.error.code).toBe(error_codes_1.ErrorCodes.NOT_FOUND);
        }));
        it('should handle server errors', () => __awaiter(void 0, void 0, void 0, function* () {
            user_controller_1.UserController.prototype.updateProfile.mockImplementation((req, res) => {
                res.status(500).json({
                    error: {
                        code: error_codes_1.ErrorCodes.INTERNAL_ERROR,
                        message: 'Internal server error'
                    }
                });
            });
            const response = yield (0, supertest_1.default)(app)
                .put('/api/users/profile')
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData);
            expect(response.status).toBe(500);
            expect(response.body.error.code).toBe(error_codes_1.ErrorCodes.INTERNAL_ERROR);
        }));
    });
    describe('GET /api/users/stats', () => {
        it('should get user stats successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            user_controller_1.UserController.prototype.getStats.mockImplementation((req, res) => {
                res.status(200).json(mockStats);
            });
            const response = yield (0, supertest_1.default)(app)
                .get('/api/users/stats')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockStats);
        }));
        it('should return 401 without auth token', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get('/api/users/stats');
            expect(response.status).toBe(401);
            expect(response.body.error.code).toBe(error_codes_1.ErrorCodes.AUTHENTICATION_ERROR);
        }));
        it('should return 404 for non-existent user', () => __awaiter(void 0, void 0, void 0, function* () {
            user_controller_1.UserController.prototype.getStats.mockImplementation((req, res) => {
                res.status(404).json({
                    error: {
                        code: error_codes_1.ErrorCodes.NOT_FOUND,
                        message: 'User not found'
                    }
                });
            });
            const response = yield (0, supertest_1.default)(app)
                .get('/api/users/stats')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(404);
            expect(response.body.error.code).toBe(error_codes_1.ErrorCodes.NOT_FOUND);
        }));
        it('should handle server errors', () => __awaiter(void 0, void 0, void 0, function* () {
            user_controller_1.UserController.prototype.getStats.mockImplementation((req, res) => {
                res.status(500).json({
                    error: {
                        code: error_codes_1.ErrorCodes.INTERNAL_ERROR,
                        message: 'Internal server error'
                    }
                });
            });
            const response = yield (0, supertest_1.default)(app)
                .get('/api/users/stats')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(500);
            expect(response.body.error.code).toBe(error_codes_1.ErrorCodes.INTERNAL_ERROR);
        }));
    });
});
