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
const auth_controller_1 = require("../../controllers/auth.controller");
const http_error_1 = require("../../errors/http-error");
const error_codes_1 = require("../../utils/error-codes");
const authUtils = __importStar(require("../../utils/auth"));
const jwtUtils = __importStar(require("../../utils/jwt"));
const express_mock_1 = require("../test-utils/express-mock");
const user_factory_1 = require("../factories/user.factory");
jest.mock('../../utils/auth');
jest.mock('../../utils/jwt');
describe('AuthController', () => {
    let authController;
    let mockUserModel;
    let req;
    let res;
    beforeEach(() => {
        mockUserModel = {
            findOne: jest.fn(),
            create: jest.fn(),
        };
        authController = new auth_controller_1.AuthController(mockUserModel);
        req = (0, express_mock_1.mockRequest)();
        res = (0, express_mock_1.mockResponse)();
        jest.clearAllMocks();
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('register', () => {
        const validRegisterData = {
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123'
        };
        it('should successfully register a new user', () => __awaiter(void 0, void 0, void 0, function* () {
            // Setup
            req.body = validRegisterData;
            const hashedPassword = 'hashedPassword123';
            const createdUser = (0, user_factory_1.mockUser)(Object.assign(Object.assign({}, validRegisterData), { password: hashedPassword }));
            const token = 'jwt.token.here';
            authUtils.hashPassword.mockResolvedValue(hashedPassword);
            mockUserModel.findOne.mockResolvedValue(null);
            mockUserModel.create.mockResolvedValue(createdUser);
            jwtUtils.generateToken.mockReturnValue(token);
            // Execute
            yield authController.register(req, res);
            // Verify
            expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: validRegisterData.email });
            expect(authUtils.hashPassword).toHaveBeenCalledWith(validRegisterData.password);
            expect(mockUserModel.create).toHaveBeenCalledWith({
                username: validRegisterData.username,
                email: validRegisterData.email,
                password: hashedPassword
            });
            expect(jwtUtils.generateToken).toHaveBeenCalledWith(createdUser.id, validRegisterData.username);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ token });
        }));
        it('should throw error when required fields are missing', () => __awaiter(void 0, void 0, void 0, function* () {
            // Setup
            req.body = { username: 'testuser' };
            // Execute & Verify
            yield expect(authController.register(req, res)).rejects.toThrow(http_error_1.HttpError);
            yield expect(authController.register(req, res)).rejects.toMatchObject({
                statusCode: 400,
                code: error_codes_1.ErrorCodes.VALIDATION_ERROR
            });
        }));
        it('should throw error when email is already registered', () => __awaiter(void 0, void 0, void 0, function* () {
            // Setup
            req.body = validRegisterData;
            mockUserModel.findOne.mockResolvedValue((0, user_factory_1.mockUser)());
            // Execute & Verify
            yield expect(authController.register(req, res)).rejects.toThrow(http_error_1.HttpError);
            yield expect(authController.register(req, res)).rejects.toMatchObject({
                statusCode: 409,
                code: error_codes_1.ErrorCodes.DUPLICATE_ERROR
            });
        }));
    });
    describe('login', () => {
        const validLoginData = {
            email: 'test@example.com',
            password: 'password123'
        };
        it('should successfully login a user', () => __awaiter(void 0, void 0, void 0, function* () {
            // Setup
            req.body = validLoginData;
            const user = (0, user_factory_1.mockUser)({ email: validLoginData.email });
            const token = 'jwt.token.here';
            mockUserModel.findOne.mockResolvedValue(user);
            authUtils.comparePasswords.mockResolvedValue(true);
            jwtUtils.generateToken.mockReturnValue(token);
            // Execute
            yield authController.login(req, res);
            // Verify
            expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: validLoginData.email });
            expect(authUtils.comparePasswords).toHaveBeenCalledWith(validLoginData.password, user.password);
            expect(jwtUtils.generateToken).toHaveBeenCalledWith(user.id, user.username);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ token });
        }));
        it('should throw error when required fields are missing', () => __awaiter(void 0, void 0, void 0, function* () {
            // Setup
            req.body = { email: 'test@example.com' };
            // Execute & Verify
            yield expect(authController.login(req, res)).rejects.toThrow(http_error_1.HttpError);
            yield expect(authController.login(req, res)).rejects.toMatchObject({
                statusCode: 400,
                code: error_codes_1.ErrorCodes.VALIDATION_ERROR
            });
        }));
        it('should throw error when user is not found', () => __awaiter(void 0, void 0, void 0, function* () {
            // Setup
            req.body = validLoginData;
            mockUserModel.findOne.mockResolvedValue(null);
            // Execute & Verify
            yield expect(authController.login(req, res)).rejects.toThrow(http_error_1.HttpError);
            yield expect(authController.login(req, res)).rejects.toMatchObject({
                statusCode: 401,
                code: error_codes_1.ErrorCodes.AUTHENTICATION_ERROR
            });
        }));
        it('should throw error when password is incorrect', () => __awaiter(void 0, void 0, void 0, function* () {
            // Setup
            req.body = validLoginData;
            const user = (0, user_factory_1.mockUser)({ email: validLoginData.email });
            mockUserModel.findOne.mockResolvedValue(user);
            authUtils.comparePasswords.mockResolvedValue(false);
            // Execute & Verify
            yield expect(authController.login(req, res)).rejects.toThrow(http_error_1.HttpError);
            yield expect(authController.login(req, res)).rejects.toMatchObject({
                statusCode: 401,
                code: error_codes_1.ErrorCodes.AUTHENTICATION_ERROR
            });
        }));
    });
    describe('refreshToken', () => {
        it('should generate new token for authenticated user', () => __awaiter(void 0, void 0, void 0, function* () {
            // Setup
            const user = (0, user_factory_1.mockUser)();
            req.user = {
                _id: user._id.toString(),
                username: user.username || user.email
            };
            const token = 'new.jwt.token';
            jwtUtils.generateToken.mockReturnValue(token);
            // Execute
            yield auth_controller_1.AuthController.refreshToken(req, res);
            // Verify
            expect(jwtUtils.generateToken).toHaveBeenCalledWith(user._id.toString(), user.username);
            expect(res.json).toHaveBeenCalledWith({ token });
        }));
        it('should return 401 when user is not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            // Setup
            req.user = undefined;
            // Execute
            yield auth_controller_1.AuthController.refreshToken(req, res);
            // Verify
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: 'Not authenticated' });
        }));
        it('should handle errors gracefully', () => __awaiter(void 0, void 0, void 0, function* () {
            // Setup
            const user = (0, user_factory_1.mockUser)();
            req.user = {
                _id: user._id.toString(),
                username: user.username || user.email
            };
            const error = new Error('Token generation failed');
            jwtUtils.generateToken.mockImplementation(() => {
                throw error;
            });
            // Execute
            yield auth_controller_1.AuthController.refreshToken(req, res);
            // Verify
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: error.message });
        }));
    });
});
