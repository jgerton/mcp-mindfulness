"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errors_1 = require("../utils/errors");
const zod_1 = require("zod");
const error_codes_1 = require("../utils/error-codes");
const errorHandler = (err, req, res, next) => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const requestId = req.headers['x-request-id'];
    // Base error response
    const errorResponse = {
        status: 'error',
        code: error_codes_1.ErrorCodes.INTERNAL_ERROR,
        message: isDevelopment ? err.message : 'An unexpected error occurred',
        timestamp: new Date().toISOString(),
        requestId
    };
    // Log error (we'll enhance this when we add the logging system)
    console.error('Error:', {
        name: err.name,
        message: err.message,
        stack: isDevelopment ? err.stack : undefined,
        requestId,
        context: err instanceof errors_1.AppError ? err.context : undefined,
        category: err instanceof errors_1.AppError ? err.category : errors_1.ErrorCategory.TECHNICAL,
        severity: err instanceof errors_1.AppError ? err.severity : errors_1.ErrorSeverity.ERROR
    });
    // Handle AppError instances
    if (err instanceof errors_1.AppError) {
        errorResponse.code = err.code;
        errorResponse.message = err.message;
        if (err.recovery) {
            errorResponse.userMessage = err.recovery.userMessage;
            errorResponse.suggestedAction = err.recovery.suggestedAction;
        }
        // Include additional context in development
        if (isDevelopment) {
            Object.assign(errorResponse, {
                category: err.category,
                severity: err.severity,
                context: err.context
            });
        }
        return res.status(err.httpStatus).json(errorResponse);
    }
    // Handle Zod validation errors
    if (err instanceof zod_1.ZodError) {
        errorResponse.code = error_codes_1.ErrorCodes.VALIDATION_ERROR;
        errorResponse.message = 'Validation error';
        errorResponse.userMessage = 'Please check your input and try again.';
        errorResponse.errors = err.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
        }));
        return res.status(400).json(errorResponse);
    }
    // Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
        errorResponse.code = error_codes_1.ErrorCodes.VALIDATION_ERROR;
        errorResponse.message = 'Data validation error';
        errorResponse.userMessage = 'Please check your input and try again.';
        return res.status(400).json(errorResponse);
    }
    // Handle MongoDB duplicate key errors
    if (err.name === 'MongoError' && err.code === 11000) {
        errorResponse.code = error_codes_1.ErrorCodes.ALREADY_EXISTS;
        errorResponse.message = 'Duplicate entry error';
        errorResponse.userMessage = 'This record already exists.';
        return res.status(409).json(errorResponse);
    }
    // Include stack trace in development
    if (isDevelopment) {
        Object.assign(errorResponse, {
            stack: err.stack,
            category: errors_1.ErrorCategory.TECHNICAL,
            severity: errors_1.ErrorSeverity.ERROR
        });
    }
    // Return generic error for unhandled cases
    return res.status(500).json(errorResponse);
};
exports.errorHandler = errorHandler;
