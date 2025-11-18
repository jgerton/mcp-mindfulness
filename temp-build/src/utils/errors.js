"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationError = exports.ConcurrencyError = exports.SessionError = exports.NotFoundError = exports.ValidationError = exports.AuthenticationError = exports.AppError = exports.ErrorSeverity = exports.ErrorCategory = void 0;
const error_codes_1 = require("./error-codes");
var ErrorCategory;
(function (ErrorCategory) {
    ErrorCategory["VALIDATION"] = "validation";
    ErrorCategory["BUSINESS"] = "business";
    ErrorCategory["TECHNICAL"] = "technical";
    ErrorCategory["SECURITY"] = "security";
    ErrorCategory["INTEGRATION"] = "integration";
})(ErrorCategory || (exports.ErrorCategory = ErrorCategory = {}));
var ErrorSeverity;
(function (ErrorSeverity) {
    ErrorSeverity["DEBUG"] = "debug";
    ErrorSeverity["INFO"] = "info";
    ErrorSeverity["WARNING"] = "warning";
    ErrorSeverity["ERROR"] = "error";
    ErrorSeverity["CRITICAL"] = "critical";
})(ErrorSeverity || (exports.ErrorSeverity = ErrorSeverity = {}));
class AppError extends Error {
    constructor(message, code, category, severity = ErrorSeverity.ERROR, context = {}, recovery, httpStatus = 500) {
        super(message);
        this.code = code;
        this.category = category;
        this.severity = severity;
        this.context = context;
        this.recovery = recovery;
        this.httpStatus = httpStatus;
        this.name = this.constructor.name;
        this.timestamp = new Date();
        Error.captureStackTrace(this, this.constructor);
    }
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            category: this.category,
            severity: this.severity,
            context: this.context,
            recovery: this.recovery,
            timestamp: this.timestamp
        };
    }
}
exports.AppError = AppError;
// Authentication Errors
class AuthenticationError extends AppError {
    constructor(message, code = error_codes_1.ErrorCodes.AUTHENTICATION_ERROR, context = {}) {
        super(message, code, ErrorCategory.SECURITY, ErrorSeverity.ERROR, context, {
            userMessage: 'Please sign in again to continue.',
            retryable: true
        }, 401);
    }
}
exports.AuthenticationError = AuthenticationError;
// Validation Errors
class ValidationError extends AppError {
    constructor(message, context = {}) {
        super(message, error_codes_1.ErrorCodes.VALIDATION_ERROR, ErrorCategory.VALIDATION, ErrorSeverity.WARNING, context, {
            userMessage: 'Please check your input and try again.',
            retryable: true
        }, 400);
    }
}
exports.ValidationError = ValidationError;
// Resource Not Found Errors
class NotFoundError extends AppError {
    constructor(message, context = {}) {
        super(message, error_codes_1.ErrorCodes.NOT_FOUND, ErrorCategory.BUSINESS, ErrorSeverity.WARNING, context, {
            userMessage: 'The requested resource could not be found.',
            retryable: false
        }, 404);
    }
}
exports.NotFoundError = NotFoundError;
// Session Errors
class SessionError extends AppError {
    constructor(message, code, context = {}) {
        super(message, code, ErrorCategory.BUSINESS, ErrorSeverity.WARNING, context, {
            userMessage: 'There was an issue with your meditation session.',
            retryable: true
        }, 400);
    }
}
exports.SessionError = SessionError;
// Concurrency Errors
class ConcurrencyError extends AppError {
    constructor(message, context = {}) {
        super(message, error_codes_1.ErrorCodes.CONCURRENCY_ERROR, ErrorCategory.TECHNICAL, ErrorSeverity.ERROR, context, {
            userMessage: 'The operation could not be completed due to a conflict.',
            retryable: true
        }, 409);
    }
}
exports.ConcurrencyError = ConcurrencyError;
// Integration Errors (for external service issues)
class IntegrationError extends AppError {
    constructor(message, service, context = {}) {
        super(message, error_codes_1.ErrorCodes.EXTERNAL_SERVICE_ERROR, ErrorCategory.INTEGRATION, ErrorSeverity.ERROR, Object.assign(Object.assign({}, context), { service }), {
            userMessage: 'We are experiencing technical difficulties.',
            retryable: true,
            suggestedAction: 'Please try again in a few minutes.'
        }, 503);
    }
}
exports.IntegrationError = IntegrationError;
