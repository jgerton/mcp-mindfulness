"use strict";
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
exports.sanitizeErrorContext = exports.createMockReqRes = exports.createMockMongoError = exports.createMockValidationError = exports.verifyErrorRecovery = exports.verifyHttpStatus = exports.verifyErrorMessage = exports.createMockUserContext = exports.createMockRequestContext = exports.createMockDbError = exports.createAuthError = exports.createValidationError = exports.createMongoError = exports.createMockError = exports.verifyErrorContext = exports.verifyErrorLogging = exports.verifyErrorResponse = void 0;
const errors_1 = require("../../utils/errors");
const error_codes_1 = require("../../utils/error-codes");
const error_responses_1 = require("../fixtures/error-responses");
// Error Response Verification
const verifyErrorResponse = (response, expectedStatus, expectedCode, expectedCategory) => {
    expect(response.status).toHaveBeenCalledWith(expectedStatus);
    expect(response.json).toHaveBeenCalledWith({
        error: expect.objectContaining({
            code: expectedCode,
            category: expectedCategory,
            message: expect.any(String),
            timestamp: expect.any(String)
        })
    });
};
exports.verifyErrorResponse = verifyErrorResponse;
// Error Logging Verification
const verifyErrorLogging = (mockLogger, expectedLevel, expectedMessage, expectedContext) => {
    expect(mockLogger).toHaveBeenCalledWith(expectedLevel, expect.stringContaining(expectedMessage), expect.objectContaining(Object.assign(Object.assign({}, (expectedContext || {})), { statusCode: expect.any(Number), errorCode: expect.any(String), errorCategory: expect.any(String) })));
};
exports.verifyErrorLogging = verifyErrorLogging;
// Verify error context structure
const verifyErrorContext = (error, expectedContext) => {
    expect(error.context).toBeDefined();
    expect(error.context).toMatchObject(expectedContext);
};
exports.verifyErrorContext = verifyErrorContext;
// Mock Error Generation
const createMockError = (code = error_codes_1.ErrorCodes.INTERNAL_ERROR, message = 'Test error', category = errors_1.ErrorCategory.TECHNICAL, context = {}) => {
    const error = new errors_1.AppError(message, code, category, errors_1.ErrorSeverity.ERROR, context);
    return error;
};
exports.createMockError = createMockError;
// MongoDB Error Mocks
const createMongoError = (code, message) => {
    const error = new Error(message);
    error.name = 'MongoError';
    error.code = code;
    return error;
};
exports.createMongoError = createMongoError;
// Validation Error Mocks
const createValidationError = (field, kind, message) => {
    const error = new Error('Validation failed');
    error.name = 'ValidationError';
    error.errors = {
        [field]: {
            kind,
            message,
            path: field,
            value: undefined
        }
    };
    return error;
};
exports.createValidationError = createValidationError;
// Authentication Error Mocks
const createAuthError = (message) => {
    return new errors_1.AppError(message, error_codes_1.ErrorCodes.AUTHENTICATION_ERROR, errors_1.ErrorCategory.SECURITY);
};
exports.createAuthError = createAuthError;
// Create mock database error
const createMockDbError = (code, message, operation) => {
    const error = new Error(message);
    error.code = code;
    if (operation) {
        error.operation = operation;
    }
    return error;
};
exports.createMockDbError = createMockDbError;
// Create mock request context
const createMockRequestContext = (overrides) => (Object.assign(Object.assign(Object.assign({}, error_responses_1.ERROR_CONTEXTS.REQUEST), overrides), { requestId: (overrides === null || overrides === void 0 ? void 0 : overrides.requestId) || `test-${Date.now()}` }));
exports.createMockRequestContext = createMockRequestContext;
// Create mock user context
const createMockUserContext = (overrides) => (Object.assign(Object.assign({}, error_responses_1.ERROR_CONTEXTS.USER), overrides));
exports.createMockUserContext = createMockUserContext;
// Verify error message matches expected message
const verifyErrorMessage = (error, expectedMessage) => {
    expect(error.message).toBe(error_responses_1.ERROR_MESSAGES[expectedMessage]);
};
exports.verifyErrorMessage = verifyErrorMessage;
// Verify HTTP status matches expected status
const verifyHttpStatus = (response, expectedStatus) => {
    expect(response.status).toHaveBeenCalledWith(expectedStatus);
};
exports.verifyHttpStatus = verifyHttpStatus;
// Verify error recovery info
const verifyErrorRecovery = (response, isRetryable, hasSuggestion) => {
    if (isRetryable) {
        expect(response.error.details).toHaveProperty('retryable', true);
    }
    if (hasSuggestion) {
        expect(response.error.details).toHaveProperty('suggestion');
    }
};
exports.verifyErrorRecovery = verifyErrorRecovery;
// Create a mock ValidationError (mongoose style)
const createMockValidationError = (errors) => {
    const error = new Error('Validation failed');
    error.name = 'ValidationError';
    error.errors = errors;
    return error;
};
exports.createMockValidationError = createMockValidationError;
// Create a mock MongoDB error
const createMockMongoError = (code, message = 'Database error') => {
    const error = new Error(message);
    error.name = 'MongoError';
    error.code = code;
    return error;
};
exports.createMockMongoError = createMockMongoError;
// Create mock request and response objects
const createMockReqRes = (reqOptions = {}, headers = {}) => {
    const req = Object.assign({ path: '/test', method: 'GET', headers: Object.assign({ 'x-request-id': 'test-request-id' }, headers) }, reqOptions);
    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis()
    };
    const next = jest.fn();
    return { req, res, next };
};
exports.createMockReqRes = createMockReqRes;
// Sanitize error context (helper to simulate what the middleware should do)
const sanitizeErrorContext = (context) => {
    // Filter out sensitive data (passwords, tokens, etc.)
    const { password, token, secret } = context, safeContext = __rest(context, ["password", "token", "secret"]);
    return safeContext;
};
exports.sanitizeErrorContext = sanitizeErrorContext;
