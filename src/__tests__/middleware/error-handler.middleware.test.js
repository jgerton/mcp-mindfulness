"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("../../utils/errors");
const error_codes_1 = require("../../utils/error-codes");
const error_handler_middleware_1 = require("../../middleware/error-handler.middleware");
const error_responses_1 = require("../fixtures/error-responses");
const service_errors_1 = require("../fixtures/service-errors");
const error_test_helpers_1 = require("../helpers/error-test.helpers");
const logger_1 = require("../../utils/logger");
// Mock implementation to test against for now
jest.mock('../../utils/logger', () => ({
    Logger: {
        error: jest.fn(),
        warn: jest.fn(),
        info: jest.fn(),
        debug: jest.fn()
    }
}));
describe('Error Handler Middleware', () => {
    let mockRequest;
    let mockResponse;
    let mockNext;
    beforeEach(() => {
        mockRequest = {
            path: '/test',
            method: 'GET',
            headers: {}
        };
        const jsonMock = jest.fn().mockImplementation(function (body) {
            this.body = body;
            return this;
        });
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jsonMock,
            body: undefined
        };
        mockNext = jest.fn();
        jest.clearAllMocks();
    });
    describe('Error Response Format', () => {
        it('should format AppError with standard structure', () => {
            const error = new errors_1.AppError(error_responses_1.ERROR_MESSAGES.VALIDATION, error_codes_1.ErrorCodes.VALIDATION_ERROR, errors_1.ErrorCategory.VALIDATION, errors_1.ErrorSeverity.ERROR);
            (0, error_handler_middleware_1.errorHandler)(error, mockRequest, mockResponse, mockNext);
            (0, error_test_helpers_1.verifyErrorResponse)(mockResponse, error_responses_1.HTTP_STATUS.BAD_REQUEST, error_codes_1.ErrorCodes.VALIDATION_ERROR, errors_1.ErrorCategory.VALIDATION);
        });
        it('should format ValidationError with field-level details', () => {
            const error = new errors_1.AppError(error_responses_1.ERROR_MESSAGES.VALIDATION, error_codes_1.ErrorCodes.VALIDATION_ERROR, errors_1.ErrorCategory.VALIDATION, errors_1.ErrorSeverity.ERROR, {
                fields: {
                    name: 'Name is required',
                    age: 'Age must be positive'
                }
            });
            (0, error_handler_middleware_1.errorHandler)(error, mockRequest, mockResponse, mockNext);
            expect(mockResponse.status).toHaveBeenCalledWith(error_responses_1.HTTP_STATUS.BAD_REQUEST);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: {
                    code: error_codes_1.ErrorCodes.VALIDATION_ERROR,
                    message: error_responses_1.ERROR_MESSAGES.VALIDATION,
                    category: errors_1.ErrorCategory.VALIDATION,
                    details: {
                        fields: {
                            name: 'Name is required',
                            age: 'Age must be positive'
                        }
                    },
                    timestamp: expect.any(String),
                    requestId: undefined
                }
            });
        });
        it('should format MongoError with safe details', () => {
            const error = (0, service_errors_1.createServiceError)('CREATE', 'Database operation failed', error_codes_1.ErrorCodes.DATABASE_ERROR, errors_1.ErrorCategory.TECHNICAL, { type: service_errors_1.DATABASE_ERROR_TYPES.CONNECTION });
            (0, error_handler_middleware_1.errorHandler)(error, mockRequest, mockResponse, mockNext);
            (0, error_test_helpers_1.verifyErrorResponse)(mockResponse, error_responses_1.HTTP_STATUS.INTERNAL_ERROR, error_codes_1.ErrorCodes.DATABASE_ERROR, errors_1.ErrorCategory.TECHNICAL);
        });
        it('should format unknown errors safely', () => {
            const error = new Error('Unexpected error');
            (0, error_handler_middleware_1.errorHandler)(error, mockRequest, mockResponse, mockNext);
            (0, error_test_helpers_1.verifyErrorResponse)(mockResponse, error_responses_1.HTTP_STATUS.INTERNAL_ERROR, error_codes_1.ErrorCodes.INTERNAL_ERROR, errors_1.ErrorCategory.TECHNICAL);
        });
    });
    describe('Environment-Specific Behavior', () => {
        const originalEnv = process.env.NODE_ENV;
        afterAll(() => {
            process.env.NODE_ENV = originalEnv;
        });
        it('should include stack trace in development', () => {
            process.env.NODE_ENV = 'development';
            const error = new errors_1.AppError(error_responses_1.ERROR_MESSAGES.INTERNAL, error_codes_1.ErrorCodes.INTERNAL_ERROR, errors_1.ErrorCategory.TECHNICAL, errors_1.ErrorSeverity.ERROR);
            error.stack = 'Test stack trace';
            (0, error_handler_middleware_1.errorHandler)(error, mockRequest, mockResponse, mockNext);
            expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
                error: expect.objectContaining({
                    stack: 'Test stack trace'
                })
            }));
        });
        it('should omit stack trace in production', () => {
            process.env.NODE_ENV = 'production';
            const error = new errors_1.AppError(error_responses_1.ERROR_MESSAGES.INTERNAL, error_codes_1.ErrorCodes.INTERNAL_ERROR, errors_1.ErrorCategory.TECHNICAL, errors_1.ErrorSeverity.ERROR);
            error.stack = 'Test stack trace';
            (0, error_handler_middleware_1.errorHandler)(error, mockRequest, mockResponse, mockNext);
            expect(mockResponse.json).toHaveBeenCalledWith(expect.not.objectContaining({
                error: expect.objectContaining({
                    stack: expect.any(String)
                })
            }));
        });
    });
    describe('Error Logging', () => {
        it('should log errors with proper severity levels', () => {
            const error = new errors_1.AppError(error_responses_1.ERROR_MESSAGES.INTERNAL, error_codes_1.ErrorCodes.INTERNAL_ERROR, errors_1.ErrorCategory.TECHNICAL, errors_1.ErrorSeverity.ERROR);
            (0, error_handler_middleware_1.errorHandler)(error, mockRequest, mockResponse, mockNext);
            expect(logger_1.Logger.error).toHaveBeenCalledWith(error_responses_1.ERROR_MESSAGES.INTERNAL, expect.objectContaining({
                path: '/test',
                method: 'GET'
            }));
        });
        it('should include request context in logs', () => {
            const error = new errors_1.AppError(error_responses_1.ERROR_MESSAGES.VALIDATION, error_codes_1.ErrorCodes.VALIDATION_ERROR, errors_1.ErrorCategory.VALIDATION, errors_1.ErrorSeverity.WARNING);
            (0, error_handler_middleware_1.errorHandler)(error, mockRequest, mockResponse, mockNext);
            expect(logger_1.Logger.warn).toHaveBeenCalledWith(error_responses_1.ERROR_MESSAGES.VALIDATION, expect.objectContaining({
                path: '/test',
                method: 'GET'
            }));
        });
    });
    describe('HTTP Status Codes', () => {
        it.each([
            ['validation error', error_responses_1.ERROR_SCENARIOS.validation],
            ['authentication error', error_responses_1.ERROR_SCENARIOS.authentication],
            ['authorization error', error_responses_1.ERROR_SCENARIOS.authorization],
            ['not found error', error_responses_1.ERROR_SCENARIOS.notFound],
            ['concurrency error', error_responses_1.ERROR_SCENARIOS.concurrency],
            ['internal error', error_responses_1.ERROR_SCENARIOS.internal]
        ])('should use correct status code for %s', (_, scenario) => {
            const error = new errors_1.AppError(scenario.response.error.message, scenario.response.error.code, scenario.response.error.category, errors_1.ErrorSeverity.ERROR);
            (0, error_handler_middleware_1.errorHandler)(error, mockRequest, mockResponse, mockNext);
            expect(mockResponse.status).toHaveBeenCalledWith(scenario.status);
        });
    });
    describe('Error Recovery Information', () => {
        it('should include user-friendly messages', () => {
            const error = new errors_1.AppError(error_responses_1.ERROR_MESSAGES.VALIDATION, error_codes_1.ErrorCodes.VALIDATION_ERROR, errors_1.ErrorCategory.VALIDATION, errors_1.ErrorSeverity.ERROR, { userMessage: 'Please check your input and try again' });
            (0, error_handler_middleware_1.errorHandler)(error, mockRequest, mockResponse, mockNext);
            expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
                error: expect.objectContaining({
                    userMessage: 'Please check your input and try again'
                })
            }));
        });
        it('should indicate if error is retryable', () => {
            const error = new errors_1.AppError(error_responses_1.ERROR_MESSAGES.INTERNAL, error_codes_1.ErrorCodes.SERVICE_UNAVAILABLE, errors_1.ErrorCategory.TECHNICAL, errors_1.ErrorSeverity.ERROR, { retryable: true });
            (0, error_handler_middleware_1.errorHandler)(error, mockRequest, mockResponse, mockNext);
            expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
                error: expect.objectContaining({
                    retryable: true
                })
            }));
        });
    });
});
