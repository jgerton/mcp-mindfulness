"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_service_1 = require("../../services/auth.service");
const user_model_1 = require("../../models/user.model");
const db_handler_1 = require("../test-utils/db-handler");
const authUtils = __importStar(require("../../utils/auth"));
const jwtUtils = __importStar(require("../../utils/jwt"));
jest.mock('../../models/user.model');
jest.mock('../../utils/auth');
jest.mock('../../utils/jwt');
describe('AuthService', () => {
    const mockUserId = '507f1f77bcf86cd799439011';
    const mockUser = {
        _id: mockUserId,
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedPassword123'
    };
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield db_handler_1.dbHandler.connect();
    }));
    beforeEach(() => {
        jest.clearAllMocks();
    });
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        jest.clearAllMocks();
        yield db_handler_1.dbHandler.clearDatabase();
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield db_handler_1.dbHandler.closeDatabase();
    }));
    describe('register', () => {
        const validRegistrationData = {
            username: 'testuser',
            email: 'test@example.com',
            password: 'Password123!'
        };
        it('should register a new user successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            user_model_1.User.findOne.mockResolvedValue(null);
            authUtils.hashPassword.mockResolvedValue('hashedPassword123');
            user_model_1.User.create.mockResolvedValue(mockUser);
            jwtUtils.generateToken.mockReturnValue('valid.jwt.token');
            const result = yield auth_service_1.AuthService.register(validRegistrationData);
            expect(result).toHaveProperty('token');
            expect(result).toHaveProperty('user');
            expect(result.user).not.toHaveProperty('password');
            expect(user_model_1.User.findOne).toHaveBeenCalledWith({ email: validRegistrationData.email });
            expect(user_model_1.User.create).toHaveBeenCalledWith(expect.objectContaining({
                username: validRegistrationData.username,
                email: validRegistrationData.email,
                password: 'hashedPassword123'
            }));
        }));
        it('should throw error for existing email', () => __awaiter(void 0, void 0, void 0, function* () {
            user_model_1.User.findOne.mockResolvedValue(mockUser);
            yield expect(auth_service_1.AuthService.register(validRegistrationData))
                .rejects.toThrow('Email already registered');
            expect(user_model_1.User.create).not.toHaveBeenCalled();
        }));
        it('should throw error for invalid email format', () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidData = Object.assign(Object.assign({}, validRegistrationData), { email: 'invalid-email' });
            yield expect(auth_service_1.AuthService.register(invalidData))
                .rejects.toThrow('Invalid email format');
        }));
        it('should throw error for weak password', () => __awaiter(void 0, void 0, void 0, function* () {
            const weakPasswordData = Object.assign(Object.assign({}, validRegistrationData), { password: 'weak' });
            yield expect(auth_service_1.AuthService.register(weakPasswordData))
                .rejects.toThrow('Password must be at least 8 characters');
        }));
        it('should handle database errors gracefully', () => __awaiter(void 0, void 0, void 0, function* () {
            user_model_1.User.findOne.mockRejectedValue(new Error('Database error'));
            yield expect(auth_service_1.AuthService.register(validRegistrationData))
                .rejects.toThrow('Database error');
        }));
    });
    describe('login', () => {
        const validCredentials = {
            email: 'test@example.com',
            password: 'Password123!'
        };
        it('should login user successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            user_model_1.User.findOne.mockResolvedValue(mockUser);
            authUtils.comparePasswords.mockResolvedValue(true);
            jwtUtils.generateToken.mockReturnValue('valid.jwt.token');
            const result = yield auth_service_1.AuthService.login(validCredentials);
            expect(result).toHaveProperty('token');
            expect(result).toHaveProperty('user');
            expect(result.user).not.toHaveProperty('password');
            expect(user_model_1.User.findOne).toHaveBeenCalledWith({ email: validCredentials.email });
            expect(authUtils.comparePasswords).toHaveBeenCalledWith(validCredentials.password, mockUser.password);
        }));
        it('should throw error for non-existent user', () => __awaiter(void 0, void 0, void 0, function* () {
            user_model_1.User.findOne.mockResolvedValue(null);
            yield expect(auth_service_1.AuthService.login(validCredentials))
                .rejects.toThrow('Invalid credentials');
            expect(authUtils.comparePasswords).not.toHaveBeenCalled();
        }));
        it('should throw error for incorrect password', () => __awaiter(void 0, void 0, void 0, function* () {
            user_model_1.User.findOne.mockResolvedValue(mockUser);
            authUtils.comparePasswords.mockResolvedValue(false);
            yield expect(auth_service_1.AuthService.login(validCredentials))
                .rejects.toThrow('Invalid credentials');
        }));
        it('should throw error for missing credentials', () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidCredentials = { email: 'test@example.com' };
            yield expect(auth_service_1.AuthService.login(invalidCredentials))
                .rejects.toThrow('Email and password are required');
        }));
        it('should handle database errors gracefully', () => __awaiter(void 0, void 0, void 0, function* () {
            user_model_1.User.findOne.mockRejectedValue(new Error('Database error'));
            yield expect(auth_service_1.AuthService.login(validCredentials))
                .rejects.toThrow('Database error');
        }));
    });
    describe('validateToken', () => {
        it('should validate a valid token', () => __awaiter(void 0, void 0, void 0, function* () {
            const token = 'valid.jwt.token';
            const decodedToken = { userId: mockUserId, username: 'testuser' };
            jwtUtils.verifyToken.mockReturnValue(decodedToken);
            user_model_1.User.findById.mockResolvedValue(mockUser);
            const result = yield auth_service_1.AuthService.validateToken(token);
            expect(result).toBeTruthy();
            expect(result.userId).toBe(mockUserId);
            expect(result.username).toBe('testuser');
        }));
        it('should throw error for invalid token', () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidToken = 'invalid.token';
            jwtUtils.verifyToken.mockImplementation(() => {
                throw new Error('Invalid token');
            });
            yield expect(auth_service_1.AuthService.validateToken(invalidToken))
                .rejects.toThrow('Invalid token');
        }));
        it('should throw error when user not found', () => __awaiter(void 0, void 0, void 0, function* () {
            const token = 'valid.jwt.token';
            const decodedToken = { userId: mockUserId, username: 'testuser' };
            jwtUtils.verifyToken.mockReturnValue(decodedToken);
            user_model_1.User.findById.mockResolvedValue(null);
            yield expect(auth_service_1.AuthService.validateToken(token))
                .rejects.toThrow('User not found');
        }));
    });
    describe('refreshToken', () => {
        it('should refresh token successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const oldToken = 'old.jwt.token';
            const newToken = 'new.jwt.token';
            const decodedToken = { userId: mockUserId, username: 'testuser' };
            jwtUtils.verifyToken.mockReturnValue(decodedToken);
            user_model_1.User.findById.mockResolvedValue(mockUser);
            jwtUtils.generateToken.mockReturnValue(newToken);
            const result = yield auth_service_1.AuthService.refreshToken(oldToken);
            expect(result).toBe(newToken);
            expect(jwtUtils.generateToken).toHaveBeenCalledWith(mockUserId, 'testuser');
        }));
        it('should throw error for expired token', () => __awaiter(void 0, void 0, void 0, function* () {
            const expiredToken = 'expired.jwt.token';
            jwtUtils.verifyToken.mockImplementation(() => {
                throw new Error('Token expired');
            });
            yield expect(auth_service_1.AuthService.refreshToken(expiredToken))
                .rejects.toThrow('Token expired');
        }));
    });
});
