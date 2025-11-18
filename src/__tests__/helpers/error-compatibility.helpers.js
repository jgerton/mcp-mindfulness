"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockErrorResponse = exports.convertToStructuredError = exports.adaptLegacyErrorHandling = exports.mapStatusToCategory = exports.createTestErrorResponse = exports.verifyErrorResponse = void 0;
const errors_1 = require("../../utils/errors");
const error_codes_1 = require("../../utils/error-codes");
/**
 * Verifies error response in either legacy or new structured format
 */
const verifyErrorResponse = (response, expectedStatus, expectedErrorMessageOrCode, options = {}) => {
    const { expectedCategory, checkExactMessage = false, strictMode = false } = options;
    // Verify status code
    expect(response.status).toHaveBeenCalledWith(expectedStatus);
    // Get the response body from the JSON mock
    const responseBody = response.json.mock.calls[0][0];
    // Handle both error formats
    if (responseBody && typeof responseBody.error === 'string') {
        // Legacy format: { error: 'message' }
        if (checkExactMessage) {
            expect(responseBody.error).toBe(expectedErrorMessageOrCode);
        }
        else {
            expect(responseBody.error).toContain(expectedErrorMessageOrCode);
        }
    }
    else if (responseBody && typeof responseBody.error === 'object') {
        // New structure: { error: { code, message, category, ... } }
        if (typeof expectedErrorMessageOrCode === 'string') {
            // If we provided a message string, check against message
            if (checkExactMessage) {
                expect(responseBody.error.message).toBe(expectedErrorMessageOrCode);
            }
            else {
                expect(responseBody.error.message).toContain(expectedErrorMessageOrCode);
            }
        }
        else {
            // If we provided an error code, check against code
            expect(responseBody.error.code).toBe(expectedErrorMessageOrCode);
        }
        // Verify category if provided
        if (expectedCategory && strictMode) {
            expect(responseBody.error.category).toBe(expectedCategory);
        }
        // Verify timestamp exists
        expect(responseBody.error.timestamp).toBeDefined();
    }
    else if (strictMode) {
        // If strict mode is enabled and the response doesn't match either format, fail the test
        fail(`Response doesn't match either error format: ${JSON.stringify(responseBody)}`);
    }
};
exports.verifyErrorResponse = verifyErrorResponse;
/**
 * Creates an error response in the format expected by tests
 * Supports both legacy and new structured formats
 */
const createTestErrorResponse = (message, code = error_codes_1.ErrorCodes.INTERNAL_ERROR, category = errors_1.ErrorCategory.TECHNICAL, useStructuredFormat = true) => {
    if (useStructuredFormat) {
        return {
            error: {
                code,
                message,
                category,
                timestamp: expect.any(String)
            }
        };
    }
    else {
        return {
            error: message
        };
    }
};
exports.createTestErrorResponse = createTestErrorResponse;
/**
 * Maps HTTP status codes to error categories
 */
const mapStatusToCategory = (status) => {
    if (status >= 400 && status < 500) {
        if (status === 401 || status === 403) {
            return errors_1.ErrorCategory.SECURITY;
        }
        return errors_1.ErrorCategory.VALIDATION;
    }
    return errors_1.ErrorCategory.TECHNICAL;
};
exports.mapStatusToCategory = mapStatusToCategory;
/**
 * Adapts legacy controller error handling to the new AppError structure
 * Use this to wrap error handling blocks during migration
 */
const adaptLegacyErrorHandling = (error, res, defaultMessage = 'Operation failed', defaultStatus = 500, defaultCode = error_codes_1.ErrorCodes.INTERNAL_ERROR) => {
    console.error('Error:', error);
    if (error instanceof errors_1.AppError) {
        // Already using new error format
        res.status(error.statusCode).json({
            error: {
                code: error.code,
                message: error.message,
                category: error.category,
                timestamp: new Date().toISOString()
            }
        });
    }
    else {
        // Legacy error handling - simple format
        res.status(defaultStatus).json({
            error: error instanceof Error ? error.message : defaultMessage
        });
    }
};
exports.adaptLegacyErrorHandling = adaptLegacyErrorHandling;
/**
 * Converts legacy error response to structured format
 */
const convertToStructuredError = (legacyError, status = 500) => {
    return {
        error: {
            code: status >= 500 ? error_codes_1.ErrorCodes.INTERNAL_ERROR : error_codes_1.ErrorCodes.VALIDATION_ERROR,
            message: legacyError.error,
            category: (0, exports.mapStatusToCategory)(status),
            timestamp: new Date().toISOString()
        }
    };
};
exports.convertToStructuredError = convertToStructuredError;
/**
 * Mocks the response with a compatible error format
 * Automatically detects which format to use based on the test expectations
 */
const mockErrorResponse = (res, status, messageOrStructuredError) => {
    res.status(status);
    if (typeof messageOrStructuredError === 'string') {
        // Legacy format
        res.json({ error: messageOrStructuredError });
    }
    else {
        // New structured format
        res.json(messageOrStructuredError);
    }
};
exports.mockErrorResponse = mockErrorResponse;
