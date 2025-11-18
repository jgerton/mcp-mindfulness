"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERROR_CONTEXTS = exports.VALIDATION_ERROR_DETAILS = exports.ERROR_SCENARIOS = exports.sampleErrors = exports.validationErrorDetailsMatcher = exports.errorResponseMatcher = exports.createErrorResponse = exports.ERROR_MESSAGES = exports.HTTP_STATUS = void 0;
const errors_1 = require("../../utils/errors");
const error_codes_1 = require("../../utils/error-codes");
// HTTP Status Codes
exports.HTTP_STATUS = {
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_ERROR: 500
};
// Common Error Messages
exports.ERROR_MESSAGES = {
    VALIDATION: 'Invalid input data',
    AUTHENTICATION: 'Authentication required',
    NOT_FOUND: 'Resource not found',
    INTERNAL: 'Internal server error',
    UNAUTHORIZED: 'Not authorized to perform this action',
    CONCURRENCY: 'Resource was modified by another request'
};
// Test Error Responses
const createErrorResponse = (code, message, category, details) => ({
    error: Object.assign(Object.assign({ code,
        message,
        category }, (details ? { details } : {})), { timestamp: expect.any(String) })
});
exports.createErrorResponse = createErrorResponse;
// Error response matchers
exports.errorResponseMatcher = {
    code: expect.any(String),
    message: expect.any(String),
    category: expect.any(String),
    timestamp: expect.any(String)
};
// Validation error details matcher
exports.validationErrorDetailsMatcher = {
    fields: expect.any(Object)
};
// Sample errors for different scenarios
exports.sampleErrors = {
    validation: {
        code: error_codes_1.ErrorCodes.VALIDATION_ERROR,
        message: 'Validation failed',
        category: errors_1.ErrorCategory.VALIDATION,
        details: {
            fields: {
                email: 'Invalid email format',
                password: 'Password too short'
            }
        }
    },
    notFound: {
        code: error_codes_1.ErrorCodes.NOT_FOUND,
        message: 'Resource not found',
        category: errors_1.ErrorCategory.BUSINESS
    },
    authentication: {
        code: error_codes_1.ErrorCodes.AUTHENTICATION_ERROR,
        message: 'Authentication required',
        category: errors_1.ErrorCategory.SECURITY
    },
    database: {
        code: error_codes_1.ErrorCodes.DATABASE_ERROR,
        message: 'Database operation failed',
        category: errors_1.ErrorCategory.TECHNICAL
    }
};
// Common Test Error Scenarios
exports.ERROR_SCENARIOS = {
    validation: {
        status: exports.HTTP_STATUS.BAD_REQUEST,
        response: (0, exports.createErrorResponse)(error_codes_1.ErrorCodes.VALIDATION_ERROR, exports.ERROR_MESSAGES.VALIDATION, errors_1.ErrorCategory.VALIDATION)
    },
    authentication: {
        status: exports.HTTP_STATUS.UNAUTHORIZED,
        response: (0, exports.createErrorResponse)(error_codes_1.ErrorCodes.AUTHENTICATION_ERROR, exports.ERROR_MESSAGES.AUTHENTICATION, errors_1.ErrorCategory.SECURITY)
    },
    authorization: {
        status: exports.HTTP_STATUS.FORBIDDEN,
        response: (0, exports.createErrorResponse)(error_codes_1.ErrorCodes.UNAUTHORIZED, exports.ERROR_MESSAGES.AUTHENTICATION, errors_1.ErrorCategory.SECURITY)
    },
    notFound: {
        status: exports.HTTP_STATUS.NOT_FOUND,
        response: (0, exports.createErrorResponse)(error_codes_1.ErrorCodes.NOT_FOUND, exports.ERROR_MESSAGES.NOT_FOUND, errors_1.ErrorCategory.BUSINESS)
    },
    concurrency: {
        status: exports.HTTP_STATUS.CONFLICT,
        response: (0, exports.createErrorResponse)(error_codes_1.ErrorCodes.CONCURRENCY_ERROR, exports.ERROR_MESSAGES.CONCURRENCY, errors_1.ErrorCategory.TECHNICAL)
    },
    internal: {
        status: exports.HTTP_STATUS.INTERNAL_ERROR,
        response: (0, exports.createErrorResponse)(error_codes_1.ErrorCodes.INTERNAL_ERROR, exports.ERROR_MESSAGES.INTERNAL, errors_1.ErrorCategory.TECHNICAL)
    }
};
// Common validation error details
exports.VALIDATION_ERROR_DETAILS = {
    REQUIRED_FIELD: {
        type: 'REQUIRED',
        message: 'Field is required'
    },
    INVALID_FORMAT: {
        type: 'INVALID_FORMAT',
        message: 'Invalid format'
    },
    OUT_OF_RANGE: {
        type: 'OUT_OF_RANGE',
        message: 'Value is out of allowed range'
    },
    INVALID_VALUE: {
        type: 'INVALID_VALUE',
        message: 'Invalid value'
    }
};
// Test error contexts
exports.ERROR_CONTEXTS = {
    REQUEST: {
        path: '/api/v1/test',
        method: 'POST',
        requestId: 'test-request-id'
    },
    USER: {
        userId: 'test-user-id',
        role: 'USER'
    }
};
