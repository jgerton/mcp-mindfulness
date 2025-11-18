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
Object.defineProperty(exports, "__esModule", { value: true });
const auth_middleware_1 = require("../../middleware/auth.middleware");
const test_factory_1 = require("../utils/test-factory");
const errors_1 = require("../../errors");
const jwt_1 = require("../../utils/jwt");
const user_model_1 = require("../../models/user.model");
const express_mock_1 = require("../test-utils/express-mock");
const error_codes_1 = require("../../utils/error-codes");
// Mock dependencies
jest.mock('../../utils/jwt');
jest.mock('../../models/user.model');
describe('AuthMiddleware Tests', () => {
    let context;
    let mockNext;
    let req;
    let res;
    beforeAll(() => {
        // Setup any test-wide configurations
    });
    beforeEach(() => {
        // Initialize test context
        context = {
            mockReq: {
                params: {},
                body: {},
                query: {},
            },
            mockRes: {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
            },
            testFactory: new test_factory_1.TestFactory(),
        };
        mockNext = jest.fn();
        req = (0, express_mock_1.mockRequest)();
        res = (0, express_mock_1.mockResponse)();
        jest.clearAllMocks();
    });
    afterEach(() => {
        // Clean up after each test
        jest.clearAllMocks();
    });
    describe('Success Cases', () => {
        it('should successfully process valid input', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const input = context.testFactory.createValidInput();
            context.mockReq.body = input;
            const expectedResult = context.testFactory.createExpectedResult();
            jest.spyOn(SomeService.prototype, 'someMethod')
                .mockResolvedValue(expectedResult);
            // Act
            try {
                yield controller.handleComponent(context.mockReq, context.mockRes);
                // Assert
                expect(context.mockRes.status).toHaveBeenCalledWith(200);
                expect(context.mockRes.json).toHaveBeenCalledWith(expect.objectContaining(expectedResult));
            }
            catch (error) {
                fail('Should not throw an error');
            }
        }));
    });
    describe('Error Cases', () => {
        it('should handle invalid input error', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const invalidInput = context.testFactory.createInvalidInput();
            context.mockReq.body = invalidInput;
            jest.spyOn(SomeService.prototype, 'someMethod')
                .mockRejectedValue({
                code: errors_1.ErrorCode.INVALID_INPUT,
                category: errors_1.ErrorCategory.VALIDATION,
                message: 'Invalid input provided',
            });
            // Act & Assert
            try {
                yield controller.handleComponent(context.mockReq, context.mockRes);
                fail('Should throw an error');
            }
            catch (error) {
                expect(error.code).toBe(errors_1.ErrorCode.INVALID_INPUT);
                expect(error.category).toBe(errors_1.ErrorCategory.VALIDATION);
                expect(context.mockRes.status).not.toHaveBeenCalled();
            }
        }));
    });
    describe('Edge Cases', () => {
        it('should handle boundary conditions', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const edgeInput = context.testFactory.createEdgeCaseInput();
            context.mockReq.body = edgeInput;
            // Mock implementation with specific logic
            jest.spyOn(SomeService.prototype, 'someMethod')
                .mockImplementation((input) => __awaiter(void 0, void 0, void 0, function* () {
                if (someEdgeCondition(input)) {
                    return specialHandling(input);
                }
                return normalHandling(input);
            }));
            // Act
            yield controller.handleComponent(context.mockReq, context.mockRes);
            // Assert
            expect(context.mockRes.status).toHaveBeenCalledWith(200);
            expect(context.mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
            // Edge case specific assertions
            }));
        }));
    });
    describe('authenticateToken', () => {
        const mockToken = 'valid.jwt.token';
        const mockUserId = '123';
        const mockUser = {
            id: mockUserId,
            username: 'testuser'
        };
        it('should authenticate valid token and set user in request', () => __awaiter(void 0, void 0, void 0, function* () {
            // Setup
            mockReq.headers = { authorization: `Bearer ${mockToken}` };
            jwt_1.verifyToken.mockReturnValue({ userId: mockUserId });
            user_model_1.User.findById.mockResolvedValue(mockUser);
            user_model_1.User.findByIdAndUpdate.mockResolvedValue(mockUser);
            // Execute
            yield (0, auth_middleware_1.authenticateToken)(mockReq, mockRes, mockNext);
            // Assert
            expect(jwt_1.verifyToken).toHaveBeenCalledWith(mockToken);
            expect(user_model_1.User.findById).toHaveBeenCalledWith(mockUserId);
            expect(user_model_1.User.findByIdAndUpdate).toHaveBeenCalledWith(mockUserId, {
                lastLogin: expect.any(Date)
            });
            expect(mockReq.user).toEqual({
                _id: mockUserId,
                username: mockUser.username
            });
            expect(mockNext).toHaveBeenCalledWith();
        }));
        it('should handle missing authorization header', () => __awaiter(void 0, void 0, void 0, function* () {
            // Execute
            yield (0, auth_middleware_1.authenticateToken)(mockReq, mockRes, mockNext);
            // Assert
            expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
                statusCode: 401,
                message: 'No token provided',
                details: {
                    code: error_codes_1.ErrorCodes.AUTHENTICATION_ERROR,
                    category: errors_1.ErrorCategory.AUTHENTICATION
                }
            }));
        }));
        it('should handle invalid token format', () => __awaiter(void 0, void 0, void 0, function* () {
            // Setup
            mockReq.headers = { authorization: 'InvalidFormat' };
            // Execute
            yield (0, auth_middleware_1.authenticateToken)(mockReq, mockRes, mockNext);
            // Assert
            expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
                statusCode: 401,
                message: 'No token provided'
            }));
        }));
        it('should handle token verification failure', () => __awaiter(void 0, void 0, void 0, function* () {
            // Setup
            mockReq.headers = { authorization: `Bearer ${mockToken}` };
            jwt_1.verifyToken.mockImplementation(() => {
                throw new Error('Token verification failed');
            });
            // Execute
            yield (0, auth_middleware_1.authenticateToken)(mockReq, mockRes, mockNext);
            // Assert
            expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
        }));
        it('should handle user not found', () => __awaiter(void 0, void 0, void 0, function* () {
            // Setup
            mockReq.headers = { authorization: `Bearer ${mockToken}` };
            jwt_1.verifyToken.mockReturnValue({ userId: mockUserId });
            user_model_1.User.findById.mockResolvedValue(null);
            // Execute
            yield (0, auth_middleware_1.authenticateToken)(mockReq, mockRes, mockNext);
            // Assert
            expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
                statusCode: 401,
                message: 'Invalid token',
                details: {
                    code: error_codes_1.ErrorCodes.AUTHENTICATION_ERROR,
                    category: errors_1.ErrorCategory.AUTHENTICATION
                }
            }));
        }));
        it('should handle database errors', () => __awaiter(void 0, void 0, void 0, function* () {
            // Setup
            mockReq.headers = { authorization: `Bearer ${mockToken}` };
            jwt_1.verifyToken.mockReturnValue({ userId: mockUserId });
            user_model_1.User.findById.mockRejectedValue(new Error('Database error'));
            // Execute
            yield (0, auth_middleware_1.authenticateToken)(mockReq, mockRes, mockNext);
            // Assert
            expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
        }));
    });
});
