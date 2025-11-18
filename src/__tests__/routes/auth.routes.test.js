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
const user_model_1 = require("../../models/user.model");
const auth_controller_1 = require("../../controllers/auth.controller");
const jwt_1 = require("../../utils/jwt");
const error_codes_1 = require("../../utils/error-codes");
jest.mock('../../models/user.model');
jest.mock('../../utils/jwt');
jest.mock('../../controllers/auth.controller');
describe('Auth Routes', () => {
    let app;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        app = yield (0, server_1.createServer)();
    }));
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('POST /api/auth/register', () => {
        const validUser = {
            username: 'testuser',
            email: 'test@example.com',
            password: 'Password123!'
        };
        it('should register a new user successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            user_model_1.User.findOne.mockResolvedValue(null);
            user_model_1.User.create.mockResolvedValue(Object.assign({ _id: 'user123' }, validUser));
            jwt_1.generateToken.mockReturnValue('valid.jwt.token');
            const response = yield (0, supertest_1.default)(app)
                .post('/api/auth/register')
                .send(validUser);
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('token');
            expect(user_model_1.User.findOne).toHaveBeenCalledWith({ email: validUser.email });
            expect(user_model_1.User.create).toHaveBeenCalledWith(expect.objectContaining(validUser));
        }));
        it('should return 400 for missing required fields', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .post('/api/auth/register')
                .send({
                username: 'testuser',
                email: 'test@example.com'
                // missing password
            });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        }));
        it('should return 409 for existing email', () => __awaiter(void 0, void 0, void 0, function* () {
            user_model_1.User.findOne.mockResolvedValue({ email: validUser.email });
            const response = yield (0, supertest_1.default)(app)
                .post('/api/auth/register')
                .send(validUser);
            expect(response.status).toBe(409);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error.code).toBe(error_codes_1.ErrorCodes.DUPLICATE_ERROR);
        }));
        it('should return 400 for invalid email format', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .post('/api/auth/register')
                .send(Object.assign(Object.assign({}, validUser), { email: 'invalid-email' }));
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        }));
        it('should return 400 for weak password', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .post('/api/auth/register')
                .send(Object.assign(Object.assign({}, validUser), { password: 'weak' }));
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        }));
    });
    describe('POST /api/auth/login', () => {
        const credentials = {
            email: 'test@example.com',
            password: 'Password123!'
        };
        const mockUser = {
            _id: 'user123',
            email: credentials.email,
            password: '$2b$10$hashedpassword',
            comparePassword: jest.fn()
        };
        it('should login user successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            user_model_1.User.findOne.mockResolvedValue(mockUser);
            mockUser.comparePassword.mockResolvedValue(true);
            jwt_1.generateToken.mockReturnValue('valid.jwt.token');
            const response = yield (0, supertest_1.default)(app)
                .post('/api/auth/login')
                .send(credentials);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('token');
            expect(user_model_1.User.findOne).toHaveBeenCalledWith({ email: credentials.email });
            expect(mockUser.comparePassword).toHaveBeenCalledWith(credentials.password);
        }));
        it('should return 401 for invalid credentials', () => __awaiter(void 0, void 0, void 0, function* () {
            user_model_1.User.findOne.mockResolvedValue(mockUser);
            mockUser.comparePassword.mockResolvedValue(false);
            const response = yield (0, supertest_1.default)(app)
                .post('/api/auth/login')
                .send(credentials);
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error.code).toBe(error_codes_1.ErrorCodes.AUTHENTICATION_ERROR);
        }));
        it('should return 401 for non-existent user', () => __awaiter(void 0, void 0, void 0, function* () {
            user_model_1.User.findOne.mockResolvedValue(null);
            const response = yield (0, supertest_1.default)(app)
                .post('/api/auth/login')
                .send(credentials);
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error.code).toBe(error_codes_1.ErrorCodes.AUTHENTICATION_ERROR);
        }));
        it('should return 400 for missing credentials', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .post('/api/auth/login')
                .send({
                email: 'test@example.com'
                // missing password
            });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        }));
    });
    describe('POST /api/auth/logout', () => {
        it('should logout user successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockToken = 'mock.jwt.token';
            jwt_1.generateToken.mockReturnValue(mockToken);
            const response = yield (0, supertest_1.default)(app)
                .post('/api/auth/logout')
                .set('Authorization', `Bearer ${mockToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'Logged out successfully');
        }));
        it('should return 401 when not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .post('/api/auth/logout');
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('message', 'Authentication required');
        }));
    });
    describe('POST /api/auth/refresh-token', () => {
        const mockUser = {
            _id: 'user123',
            email: 'test@example.com'
        };
        it('should refresh token successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            user_model_1.User.findById.mockResolvedValue(mockUser);
            jwt_1.generateToken.mockReturnValue('new.jwt.token');
            const response = yield (0, supertest_1.default)(app)
                .post('/api/auth/refresh-token')
                .set('Authorization', 'Bearer valid.old.token');
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('token', 'new.jwt.token');
        }));
        it('should return 401 for missing token', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .post('/api/auth/refresh-token');
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error.code).toBe(error_codes_1.ErrorCodes.AUTHENTICATION_ERROR);
        }));
        it('should return 401 for invalid token', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .post('/api/auth/refresh-token')
                .set('Authorization', 'Bearer invalid.token');
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error.code).toBe(error_codes_1.ErrorCodes.AUTHENTICATION_ERROR);
        }));
        it('should return 401 for non-existent user', () => __awaiter(void 0, void 0, void 0, function* () {
            user_model_1.User.findById.mockResolvedValue(null);
            const response = yield (0, supertest_1.default)(app)
                .post('/api/auth/refresh-token')
                .set('Authorization', 'Bearer valid.old.token');
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error.code).toBe(error_codes_1.ErrorCodes.AUTHENTICATION_ERROR);
        }));
    });
    describe('POST /api/auth/forgot-password', () => {
        it('should initiate password reset successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const email = 'test@example.com';
            auth_controller_1.AuthController.forgotPassword.mockResolvedValue({
                message: 'Password reset email sent'
            });
            const response = yield (0, supertest_1.default)(app)
                .post('/api/auth/forgot-password')
                .send({ email });
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'Password reset email sent');
        }));
        it('should return 404 for non-existent email', () => __awaiter(void 0, void 0, void 0, function* () {
            const email = 'nonexistent@example.com';
            auth_controller_1.AuthController.forgotPassword.mockRejectedValue({
                status: 404,
                message: 'User not found'
            });
            const response = yield (0, supertest_1.default)(app)
                .post('/api/auth/forgot-password')
                .send({ email });
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('message', 'User not found');
        }));
    });
    describe('POST /api/auth/reset-password', () => {
        const resetData = {
            token: 'reset.token.123',
            password: 'NewPassword123!'
        };
        it('should reset password successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            auth_controller_1.AuthController.resetPassword.mockResolvedValue({
                message: 'Password reset successful'
            });
            const response = yield (0, supertest_1.default)(app)
                .post('/api/auth/reset-password')
                .send(resetData);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'Password reset successful');
        }));
        it('should return 400 for invalid reset token', () => __awaiter(void 0, void 0, void 0, function* () {
            auth_controller_1.AuthController.resetPassword.mockRejectedValue({
                status: 400,
                message: 'Invalid or expired reset token'
            });
            const response = yield (0, supertest_1.default)(app)
                .post('/api/auth/reset-password')
                .send(resetData);
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', 'Invalid or expired reset token');
        }));
        it('should return 400 for invalid password format', () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidData = {
                token: resetData.token,
                password: '123'
            };
            const response = yield (0, supertest_1.default)(app)
                .post('/api/auth/reset-password')
                .send(invalidData);
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message');
        }));
    });
});
