"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationError = exports.ConcurrencyError = exports.ConflictError = exports.BadRequestError = exports.InternalError = exports.AuthorizationError = exports.AuthenticationError = exports.DuplicateError = exports.NotFoundError = exports.ValidationError = exports.AppError = exports.BaseError = exports.ErrorSeverity = exports.ErrorCategory = exports.ErrorCodes = void 0;
exports.handleError = handleError;
const error_codes_1 = require("./error-codes");
Object.defineProperty(exports, "ErrorCodes", { enumerable: true, get: function () { return error_codes_1.ErrorCodes; } });
Object.defineProperty(exports, "ErrorCategory", { enumerable: true, get: function () { return error_codes_1.ErrorCategory; } });
var ErrorSeverity;
(function (ErrorSeverity) {
    ErrorSeverity["ERROR"] = "error";
    ErrorSeverity["WARNING"] = "warning";
    ErrorSeverity["INFO"] = "info";
    ErrorSeverity["DEBUG"] = "debug";
})(ErrorSeverity || (exports.ErrorSeverity = ErrorSeverity = {}));
class BaseError extends Error {
    constructor(name, code, message, category = error_codes_1.ErrorCategory.INTERNAL, severity = ErrorSeverity.ERROR, context, recovery) {
        super(message);
        this.name = name;
        this.code = code;
        this.message = message;
        this.category = category;
        this.severity = severity;
        this.context = context;
        this.recovery = recovery;
        this.httpStatus = this.getStatusCodeFromCategory(category);
        Object.setPrototypeOf(this, new.target.prototype);
    }
    getStatusCodeFromCategory(category) {
        switch (category) {
            case error_codes_1.ErrorCategory.VALIDATION:
            case error_codes_1.ErrorCategory.BAD_REQUEST:
                return 400;
            case error_codes_1.ErrorCategory.AUTHENTICATION:
                return 401;
            case error_codes_1.ErrorCategory.AUTHORIZATION:
            case error_codes_1.ErrorCategory.FORBIDDEN:
                return 403;
            case error_codes_1.ErrorCategory.NOT_FOUND:
                return 404;
            case error_codes_1.ErrorCategory.CONFLICT:
                return 409;
            case error_codes_1.ErrorCategory.INTERNAL:
            case error_codes_1.ErrorCategory.TECHNICAL:
            default:
                return 500;
        }
    }
}
exports.BaseError = BaseError;
// Alias for compatibility
class AppError extends BaseError {
}
exports.AppError = AppError;
class ValidationError extends BaseError {
    constructor(message) {
        super('ValidationError', error_codes_1.ErrorCodes.VALIDATION_ERROR, message, error_codes_1.ErrorCategory.VALIDATION);
    }
}
exports.ValidationError = ValidationError;
class NotFoundError extends BaseError {
    constructor(message) {
        super('NotFoundError', error_codes_1.ErrorCodes.NOT_FOUND, message, error_codes_1.ErrorCategory.NOT_FOUND);
    }
}
exports.NotFoundError = NotFoundError;
class DuplicateError extends BaseError {
    constructor(message) {
        super('DuplicateError', error_codes_1.ErrorCodes.DUPLICATE_ERROR, message, error_codes_1.ErrorCategory.CONFLICT);
    }
}
exports.DuplicateError = DuplicateError;
class AuthenticationError extends BaseError {
    constructor(message) {
        super('AuthenticationError', error_codes_1.ErrorCodes.AUTHENTICATION_ERROR, message, error_codes_1.ErrorCategory.AUTHENTICATION);
    }
}
exports.AuthenticationError = AuthenticationError;
class AuthorizationError extends BaseError {
    constructor(message) {
        super('AuthorizationError', error_codes_1.ErrorCodes.AUTHORIZATION_ERROR, message, error_codes_1.ErrorCategory.AUTHORIZATION);
    }
}
exports.AuthorizationError = AuthorizationError;
class InternalError extends BaseError {
    constructor(message) {
        super('InternalError', error_codes_1.ErrorCodes.INTERNAL_ERROR, message, error_codes_1.ErrorCategory.INTERNAL);
    }
}
exports.InternalError = InternalError;
class BadRequestError extends BaseError {
    constructor(message) {
        super('BadRequestError', error_codes_1.ErrorCodes.BAD_REQUEST, message, error_codes_1.ErrorCategory.BAD_REQUEST);
    }
}
exports.BadRequestError = BadRequestError;
class ConflictError extends BaseError {
    constructor(message) {
        super('ConflictError', error_codes_1.ErrorCodes.CONFLICT, message, error_codes_1.ErrorCategory.CONFLICT);
    }
}
exports.ConflictError = ConflictError;
// Concurrency Errors
class ConcurrencyError extends BaseError {
    constructor(message) {
        super('ConcurrencyError', error_codes_1.ErrorCodes.CONCURRENCY_ERROR, message, error_codes_1.ErrorCategory.CONFLICT);
    }
}
exports.ConcurrencyError = ConcurrencyError;
// Integration Errors (for external service issues)
class IntegrationError extends BaseError {
    constructor(message) {
        super('IntegrationError', error_codes_1.ErrorCodes.EXTERNAL_SERVICE_ERROR, message, error_codes_1.ErrorCategory.INTERNAL);
    }
}
exports.IntegrationError = IntegrationError;
function handleError(error, res) {
    console.error('Error:', error);
    if (error instanceof BaseError) {
        const statusCode = getStatusCodeFromCategory(error.category);
        res.status(statusCode).json({
            error: {
                name: error.name,
                code: error.code,
                message: error.message,
                category: error.category
            }
        });
    }
    else {
        const internalError = error instanceof Error ? error : new Error(String(error));
        res.status(500).json({
            error: {
                name: 'InternalError',
                code: error_codes_1.ErrorCodes.INTERNAL_ERROR,
                message: internalError.message || 'An unexpected error occurred',
                category: error_codes_1.ErrorCategory.INTERNAL
            }
        });
    }
}
function getStatusCodeFromCategory(category) {
    switch (category) {
        case error_codes_1.ErrorCategory.VALIDATION:
        case error_codes_1.ErrorCategory.BAD_REQUEST:
            return 400;
        case error_codes_1.ErrorCategory.AUTHENTICATION:
            return 401;
        case error_codes_1.ErrorCategory.AUTHORIZATION:
            return 403;
        case error_codes_1.ErrorCategory.NOT_FOUND:
            return 404;
        case error_codes_1.ErrorCategory.CONFLICT:
            return 409;
        case error_codes_1.ErrorCategory.INTERNAL:
        default:
            return 500;
    }
}
