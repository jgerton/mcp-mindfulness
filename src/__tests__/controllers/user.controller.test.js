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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_controller_1 = require("../../controllers/user.controller");
const http_error_1 = require("../../errors/http-error");
const error_codes_1 = require("../../utils/error-codes");
const authUtils = __importStar(require("../../utils/auth"));
const user_factory_1 = require("../factories/user.factory");
// Mock bcrypt
jest.mock('bcryptjs', () => ({
    compare: jest.fn().mockResolvedValue(true),
    hash: jest.fn().mockResolvedValue('hashedPassword')
}));
// Mock auth utils
const mockComparePasswords = jest.spyOn(authUtils, 'comparePasswords').mockImplementation(() => Promise.resolve(true));
const mockHashPassword = jest.spyOn(authUtils, 'hashPassword').mockImplementation(() => Promise.resolve('hashedPassword'));
const mockIsValidEmail = jest.spyOn(authUtils, 'isValidEmail').mockImplementation(() => true);
describe('UserController', () => {
    let userController;
    let mockUserModel;
    let mockDoc;
    let req;
    let res;
    let next;
    let userService;
    beforeEach(() => {
        mockDoc = (0, user_factory_1.mockUser)();
        mockUserModel = {
            create: jest.fn(),
            findOne: jest.fn(),
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            find: jest.fn()
        };
        userController = new user_controller_1.UserController(mockUserModel);
        req = {
            user: {
                _id: mockDoc._id,
                username: mockDoc.username
            },
            body: {},
            params: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
        mockComparePasswords.mockReset().mockResolvedValue(true);
        mockHashPassword.mockReset().mockResolvedValue('hashedPassword');
        mockIsValidEmail.mockReset().mockReturnValue(true);
        next = jest.fn();
        userService = {
            create: jest.fn(),
            findById: jest.fn(),
            findByEmail: jest.fn(),
            update: jest.fn(),
            getStats: jest.fn(),
        };
    });
    describe('Core CRUD Operations', () => {
        describe('create', () => {
            describe('Success Cases', () => {
                it('should create a new user successfully', () => __awaiter(void 0, void 0, void 0, function* () {
                    const userData = {
                        username: 'Leta4',
                        email: 'test@example.com',
                        password: 'Password123!'
                    };
                    const mockDoc = (0, user_factory_1.mockUser)(Object.assign(Object.assign({}, userData), { password: 'hashedPassword' }));
                    mockUserModel.create.mockResolvedValue([mockDoc]);
                    authUtils.hashPassword.mockResolvedValue('hashedPassword');
                    req.body = userData;
                    yield userController.create(req, res);
                    expect(mockUserModel.create).toHaveBeenCalledWith([
                        expect.objectContaining({
                            username: userData.username,
                            email: userData.email,
                            password: expect.any(String)
                        })
                    ]);
                    expect(res.status).toHaveBeenCalledWith(201);
                    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                        email: userData.email,
                        username: userData.username
                    }));
                }));
            });
            describe('Error Cases', () => {
                it('should handle duplicate email', () => __awaiter(void 0, void 0, void 0, function* () {
                    const mockDoc = (0, user_factory_1.mockUser)({ username: 'existinguser' });
                    req.body = {
                        email: mockDoc.email,
                        password: 'password123',
                        username: mockDoc.username
                    };
                    mockUserModel.findOne.mockResolvedValue(mockDoc);
                    yield expect(userController.create(req, res))
                        .rejects.toThrow(http_error_1.HttpError);
                    yield expect(userController.create(req, res))
                        .rejects.toMatchObject({
                        statusCode: 409,
                        code: error_codes_1.ErrorCodes.DUPLICATE_ERROR
                    });
                }));
                it('should validate required fields', () => __awaiter(void 0, void 0, void 0, function* () {
                    req.body = { username: 'testuser' };
                    yield expect(userController.create(req, res))
                        .rejects.toThrow(http_error_1.HttpError);
                    yield expect(userController.create(req, res))
                        .rejects.toMatchObject({
                        statusCode: 400,
                        message: 'Email and password are required'
                    });
                }));
                it('should validate password length', () => __awaiter(void 0, void 0, void 0, function* () {
                    req.body = { email: 'test@example.com', password: '123' };
                    yield expect(userController.create(req, res)).rejects.toThrow(http_error_1.HttpError);
                    yield expect(userController.create(req, res)).rejects.toMatchObject({
                        statusCode: 400,
                        message: 'Password must be at least 8 characters'
                    });
                }));
            });
            describe('Edge Cases', () => {
                it('should handle database errors during user creation', () => __awaiter(void 0, void 0, void 0, function* () {
                    req.body = { email: 'test@example.com', password: 'password123', username: 'testuser' };
                    mockUserModel.findOne.mockResolvedValue(null);
                    mockUserModel.create.mockRejectedValue(new Error('Database error'));
                    yield expect(userController.create(req, res)).rejects.toThrow();
                }));
                it('should handle password hashing errors', () => __awaiter(void 0, void 0, void 0, function* () {
                    req.body = { email: 'test@example.com', password: 'password123', username: 'testuser' };
                    mockUserModel.findOne.mockResolvedValue(null);
                    authUtils.hashPassword.mockRejectedValue(new Error('Hashing error'));
                    yield expect(userController.create(req, res)).rejects.toThrow();
                }));
                it('should handle empty request body', () => __awaiter(void 0, void 0, void 0, function* () {
                    req.body = {};
                    yield expect(userController.create(req, res))
                        .rejects.toThrow(http_error_1.HttpError);
                    yield expect(userController.create(req, res))
                        .rejects.toMatchObject({
                        statusCode: 400,
                        message: 'Email and password are required'
                    });
                }));
                it('should handle invalid email format', () => __awaiter(void 0, void 0, void 0, function* () {
                    req.body = {
                        email: 'invalid-email',
                        password: 'Password123!',
                        username: 'testuser'
                    };
                    yield expect(userController.create(req, res))
                        .rejects.toThrow(http_error_1.HttpError);
                    yield expect(userController.create(req, res))
                        .rejects.toMatchObject({
                        statusCode: 400,
                        code: error_codes_1.ErrorCodes.VALIDATION_ERROR
                    });
                }));
            });
        });
        describe('getProfile', () => {
            describe('Success Cases', () => {
                it('should return user profile successfully', () => __awaiter(void 0, void 0, void 0, function* () {
                    mockUserModel.findById.mockResolvedValue(mockDoc);
                    yield userController.getProfile(req, res);
                    expect(mockUserModel.findById).toHaveBeenCalledWith(mockDoc._id);
                    expect(res.status).toHaveBeenCalledWith(200);
                    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                        username: mockDoc.username,
                        email: mockDoc.email
                    }));
                }));
            });
            describe('Error Cases', () => {
                it('should handle unauthorized access', () => __awaiter(void 0, void 0, void 0, function* () {
                    req.user = undefined;
                    yield expect(userController.getProfile(req, res))
                        .rejects.toThrow(http_error_1.HttpError);
                    yield expect(userController.getProfile(req, res))
                        .rejects.toMatchObject({
                        statusCode: 401,
                        message: 'Unauthorized'
                    });
                }));
            });
            describe('Edge Cases', () => {
                it('should handle non-existent user', () => __awaiter(void 0, void 0, void 0, function* () {
                    const user = (0, user_factory_1.mockUser)();
                    req.user = { _id: user._id.toString(), username: user.username };
                    mockUserModel.findById.mockResolvedValue(null);
                    yield expect(userController.getProfile(req, res))
                        .rejects.toThrow(http_error_1.HttpError);
                    yield expect(userController.getProfile(req, res))
                        .rejects.toMatchObject({
                        statusCode: 404,
                        message: 'User not found'
                    });
                }));
            });
        });
    });
    describe('Authentication Operations', () => {
        describe('login', () => {
            describe('Success Cases', () => {
                it('should login user successfully', () => __awaiter(void 0, void 0, void 0, function* () {
                    const loginData = {
                        email: 'test@example.com',
                        password: 'password123'
                    };
                    req.body = loginData;
                    const mockDocWithMethods = Object.assign(Object.assign({}, mockDoc), { password: 'hashedPassword', toObject: jest.fn().mockReturnValue(Object.assign(Object.assign({}, mockDoc), { password: 'hashedPassword' })) });
                    mockUserModel.findOne.mockResolvedValue(mockDocWithMethods);
                    authUtils.comparePasswords.mockResolvedValueOnce(true);
                    yield userController.login(req, res);
                    expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: loginData.email });
                    expect(authUtils.comparePasswords).toHaveBeenCalledWith(loginData.password, mockDocWithMethods.password);
                    expect(res.status).toHaveBeenCalledWith(200);
                    const _a = mockDocWithMethods.toObject(), { password: _ } = _a, expectedResponse = __rest(_a, ["password"]);
                    expect(res.json).toHaveBeenCalledWith(expectedResponse);
                }));
            });
            describe('Error Cases', () => {
                it('should handle invalid credentials', () => __awaiter(void 0, void 0, void 0, function* () {
                    const loginData = {
                        email: 'test@example.com',
                        password: 'wrongpassword'
                    };
                    req.body = loginData;
                    const mockDocWithMethods = Object.assign(Object.assign({}, mockDoc), { password: 'hashedPassword', toObject: jest.fn().mockReturnValue(Object.assign(Object.assign({}, mockDoc), { password: 'hashedPassword' })) });
                    mockUserModel.findOne.mockResolvedValue(mockDocWithMethods);
                    authUtils.comparePasswords.mockResolvedValueOnce(false);
                    yield expect(userController.login(req, res))
                        .rejects.toThrow(http_error_1.HttpError);
                }));
            });
            describe('Edge Cases', () => {
                it('should handle password comparison errors', () => __awaiter(void 0, void 0, void 0, function* () {
                    const loginData = {
                        email: mockDoc.email,
                        password: 'password123'
                    };
                    req.body = loginData;
                    mockUserModel.findOne.mockResolvedValue(mockDoc);
                    authUtils.comparePasswords.mockRejectedValueOnce(new Error('Comparison error'));
                    yield expect(userController.login(req, res))
                        .rejects.toThrow();
                }));
            });
        });
        describe('updatePassword', () => {
            describe('Success Cases', () => {
                it('should update password successfully', () => __awaiter(void 0, void 0, void 0, function* () {
                    const passwordData = {
                        currentPassword: 'oldpass123',
                        newPassword: 'newpass123'
                    };
                    req.body = passwordData;
                    req.params = { id: mockDoc._id };
                    const mockDocWithMethods = Object.assign(Object.assign({}, mockDoc), { password: 'hashedPassword', save: jest.fn().mockResolvedValue(undefined) });
                    mockUserModel.findById.mockResolvedValue(mockDocWithMethods);
                    mockComparePasswords.mockResolvedValueOnce(true);
                    mockHashPassword.mockResolvedValueOnce('newHashedPassword');
                    yield userController.updatePassword(req, res);
                    expect(mockUserModel.findById).toHaveBeenCalledWith(mockDoc._id);
                    expect(mockComparePasswords).toHaveBeenCalledWith(passwordData.currentPassword, 'hashedPassword');
                    expect(mockHashPassword).toHaveBeenCalledWith(passwordData.newPassword);
                    expect(mockDocWithMethods.save).toHaveBeenCalled();
                    expect(res.status).toHaveBeenCalledWith(200);
                    expect(res.json).toHaveBeenCalledWith({
                        message: 'Password updated successfully'
                    });
                }));
            });
            describe('Error Cases', () => {
                it('should handle incorrect current password', () => __awaiter(void 0, void 0, void 0, function* () {
                    const passwordData = {
                        currentPassword: 'wrongpass',
                        newPassword: 'newpass123'
                    };
                    req.body = passwordData;
                    req.params = { id: mockDoc._id };
                    const mockDocWithMethods = Object.assign(Object.assign({}, mockDoc), { password: 'hashedPassword', save: jest.fn().mockResolvedValue(undefined) });
                    mockUserModel.findById.mockResolvedValue(mockDocWithMethods);
                    mockComparePasswords.mockResolvedValueOnce(false);
                    yield expect(userController.updatePassword(req, res))
                        .rejects.toThrow(http_error_1.HttpError);
                }));
            });
            describe('Edge Cases', () => {
                it('should handle password hashing errors during update', () => __awaiter(void 0, void 0, void 0, function* () {
                    const passwordData = {
                        currentPassword: 'oldpass123',
                        newPassword: 'newpass123'
                    };
                    req.body = passwordData;
                    req.params = { id: mockDoc._id };
                    const mockDocWithMethods = Object.assign(Object.assign({}, mockDoc), { password: 'hashedPassword', save: jest.fn().mockResolvedValue(undefined) });
                    mockUserModel.findById.mockResolvedValue(mockDocWithMethods);
                    mockComparePasswords.mockResolvedValueOnce(true);
                    mockHashPassword.mockRejectedValueOnce(new Error('Hashing error'));
                    yield expect(userController.updatePassword(req, res))
                        .rejects.toThrow();
                }));
            });
        });
    });
    describe('Profile Management', () => {
        describe('updateProfile', () => {
            describe('Success Cases', () => {
                it('should update profile successfully', () => __awaiter(void 0, void 0, void 0, function* () {
                    const updateData = {
                        username: 'newusername',
                        email: 'newemail@test.com'
                    };
                    req.body = updateData;
                    const updatedDoc = Object.assign(Object.assign(Object.assign({}, mockDoc), updateData), { password: 'hashedPassword', toObject: jest.fn().mockReturnValue(Object.assign(Object.assign(Object.assign({}, mockDoc), updateData), { password: 'hashedPassword' })) });
                    mockUserModel.findByIdAndUpdate.mockResolvedValue(updatedDoc);
                    yield userController.updateProfile(req, res);
                    expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(mockDoc._id, { $set: updateData }, { new: true });
                    expect(res.status).toHaveBeenCalledWith(200);
                    const _a = updatedDoc.toObject(), { password: _ } = _a, expectedResponse = __rest(_a, ["password"]);
                    expect(res.json).toHaveBeenCalledWith(expectedResponse);
                }));
            });
            describe('Edge Cases', () => {
                it('should handle database errors during update', () => __awaiter(void 0, void 0, void 0, function* () {
                    const validUpdateData = {
                        username: 'newusername',
                        email: 'newemail@test.com'
                    };
                    req.body = validUpdateData;
                    mockUserModel.findByIdAndUpdate.mockRejectedValue(new Error('Database error'));
                    yield expect(userController.updateProfile(req, res))
                        .rejects.toThrow();
                }));
            });
        });
    });
    describe('User Statistics', () => {
        describe('getStats', () => {
            describe('Success Cases', () => {
                it('should return user stats', () => __awaiter(void 0, void 0, void 0, function* () {
                    mockUserModel.findById.mockResolvedValue(mockDoc);
                    yield userController.getStats(req, res);
                    expect(mockUserModel.findById).toHaveBeenCalledWith(mockDoc._id);
                    expect(res.status).toHaveBeenCalledWith(200);
                    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                        totalSessions: expect.any(Number),
                        totalMinutes: expect.any(Number),
                        averageSessionLength: expect.any(Number),
                        streakDays: expect.any(Number),
                        lastSessionDate: null
                    }));
                }));
            });
            describe('Error Cases', () => {
                it('should handle unauthorized access', () => __awaiter(void 0, void 0, void 0, function* () {
                    req.user = undefined;
                    yield expect(userController.getStats(req, res))
                        .rejects.toThrow(http_error_1.HttpError);
                }));
            });
            describe('Edge Cases', () => {
                it('should handle non-existent user for stats', () => __awaiter(void 0, void 0, void 0, function* () {
                    mockUserModel.findById.mockResolvedValue(null);
                    yield expect(userController.getStats(req, res))
                        .rejects.toThrow(http_error_1.HttpError);
                }));
            });
        });
    });
    describe('Query Building', () => {
        describe('buildFilterQuery', () => {
            it('should build filter with email regex', () => {
                const query = { email: 'test' };
                const filter = userController['buildFilterQuery'](query);
                expect(filter.email).toBeInstanceOf(RegExp);
            });
            it('should build filter with role', () => {
                const query = { role: 'user' };
                const filter = userController['buildFilterQuery'](query);
                expect(filter.role).toBe('user');
            });
            it('should build filter with active status', () => {
                const query = { active: 'true' };
                const filter = userController['buildFilterQuery'](query);
                expect(filter.active).toBe(true);
            });
        });
    });
    describe('Validation', () => {
        describe('isValidEmail', () => {
            it('should validate correct email format', () => {
                const email = 'test@example.com';
                const result = userController['isValidEmail'](email);
                expect(result).toBe(true);
            });
            it('should invalidate incorrect email format', () => {
                const email = 'invalid-email';
                const result = userController['isValidEmail'](email);
                expect(result).toBe(false);
            });
        });
    });
});
