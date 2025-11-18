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
exports.exampleRouteHandler = exports.catchAsync = exports.errorHandler = exports.handleJWTExpiredError = exports.handleJWTError = exports.handleDuplicateKeyError = exports.handleCastError = exports.handleValidationError = exports.APIError = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = require("../../src/utils/logger");
/**
 * Example API error handling middleware
 *
 * This file demonstrates best practices for API error handling:
 * 1. Centralized error handling middleware
 * 2. Proper error classification
 * 3. Consistent error response format
 * 4. Appropriate HTTP status codes
 * 5. Error logging
 */
// Custom error class for API errors
class APIError extends Error {
    constructor(message, statusCode, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.APIError = APIError;
// Validation error handler - converts Mongoose validation errors to API errors
const handleValidationError = (err) => {
    const message = Object.values(err.errors)
        .map(error => error.message)
        .join(', ');
    return new APIError(`Validation Error: ${message}`, 400);
};
exports.handleValidationError = handleValidationError;
// Cast error handler - converts Mongoose cast errors (e.g., invalid ObjectId) to API errors
const handleCastError = (err) => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new APIError(message, 400);
};
exports.handleCastError = handleCastError;
// Duplicate key error handler - converts MongoDB duplicate key errors to API errors
const handleDuplicateKeyError = (err) => {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    const message = `Duplicate value: ${value} for field ${field}. Please use another value.`;
    return new APIError(message, 409); // 409 Conflict
};
exports.handleDuplicateKeyError = handleDuplicateKeyError;
// JWT error handler - converts JWT errors to API errors
const handleJWTError = () => {
    return new APIError('Invalid token. Please log in again.', 401);
};
exports.handleJWTError = handleJWTError;
// JWT expired error handler
const handleJWTExpiredError = () => {
    return new APIError('Your token has expired. Please log in again.', 401);
};
exports.handleJWTExpiredError = handleJWTExpiredError;
// Global error handling middleware
const errorHandler = (err, req, res, next) => {
    // Default to 500 server error
    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'Internal Server Error';
    // Log error
    logger_1.logger.error({
        error: err,
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        ip: req.ip,
        user: req.user ? req.user._id : 'unauthenticated'
    });
    // Handle specific error types
    let error = Object.assign({}, err);
    error.message = err.message;
    // Mongoose validation error
    if (err instanceof mongoose_1.default.Error.ValidationError) {
        error = (0, exports.handleValidationError)(err);
    }
    // Mongoose cast error (e.g., invalid ObjectId)
    if (err instanceof mongoose_1.default.Error.CastError) {
        error = (0, exports.handleCastError)(err);
    }
    // MongoDB duplicate key error
    if (err.code === 11000) {
        error = (0, exports.handleDuplicateKeyError)(err);
    }
    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        error = (0, exports.handleJWTError)();
    }
    if (err.name === 'TokenExpiredError') {
        error = (0, exports.handleJWTExpiredError)();
    }
    // Development vs. Production error responses
    if (process.env.NODE_ENV === 'development') {
        // In development, send detailed error information
        return res.status(error.statusCode).json({
            status: 'error',
            message: error.message,
            error: error,
            stack: err.stack
        });
    }
    else {
        // In production, don't leak error details for non-operational errors
        if (error.isOperational) {
            return res.status(error.statusCode).json({
                status: 'error',
                message: error.message
            });
        }
        else {
            // For programming or unknown errors, don't leak error details
            logger_1.logger.error('Non-operational error:', err);
            return res.status(500).json({
                status: 'error',
                message: 'Something went wrong'
            });
        }
    }
};
exports.errorHandler = errorHandler;
// Async error handler wrapper to avoid try/catch blocks in route handlers
const catchAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};
exports.catchAsync = catchAsync;
// Example usage in a route handler
exports.exampleRouteHandler = (0, exports.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // This will automatically catch any errors and pass them to the error handler
    const { id } = req.params;
    // Validate ObjectId
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        throw new APIError('Invalid ID format', 400);
    }
    // Example of throwing a custom error
    const item = yield SomeModel.findById(id);
    if (!item) {
        throw new APIError('Resource not found', 404);
    }
    // Example of successful response
    res.status(200).json({
        status: 'success',
        data: item
    });
}));
