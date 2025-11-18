"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MOCK_ERRORS = exports.createExpressValidationError = exports.createAppError = exports.createDuplicateKeyError = exports.createValidationError = exports.createMongoError = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const errors_1 = require("../../utils/errors");
// MongoDB Error Types
const createMongoError = (code, message) => {
    const error = new mongoose_1.default.Error(message);
    error.code = code;
    return error;
};
exports.createMongoError = createMongoError;
// Mongoose Validation Error
const createValidationError = (path, value, message) => {
    const error = new mongoose_1.default.Error.ValidationError();
    error.errors[path] = new mongoose_1.default.Error.ValidatorError({
        path,
        value,
        message,
        type: 'user defined'
    });
    return error;
};
exports.createValidationError = createValidationError;
// Mongoose Duplicate Key Error
const createDuplicateKeyError = (field, value) => {
    const error = (0, exports.createMongoError)(11000, 'E11000 duplicate key error');
    error.keyValue = { [field]: value };
    return error;
};
exports.createDuplicateKeyError = createDuplicateKeyError;
// Custom Application Errors
const createAppError = (code, message, category, context) => {
    return new errors_1.AppError(code, message, category, context);
};
exports.createAppError = createAppError;
// Mock Express Validation Error
const createExpressValidationError = (field, message, value) => ({
    errors: [{
            location: 'body',
            msg: message,
            param: field,
            value: value
        }]
});
exports.createExpressValidationError = createExpressValidationError;
// Common Test Errors
exports.MOCK_ERRORS = {
    MONGO: {
        CONNECTION: (0, exports.createMongoError)(-1, 'MongoNetworkError: connection timed out'),
        DUPLICATE_EMAIL: (0, exports.createDuplicateKeyError)('email', 'test@example.com'),
        INVALID_ID: (0, exports.createMongoError)(-2, 'BSONTypeError: Invalid ObjectId')
    },
    VALIDATION: {
        REQUIRED_FIELD: (0, exports.createValidationError)('name', undefined, 'Path `name` is required'),
        INVALID_EMAIL: (0, exports.createValidationError)('email', 'invalid-email', 'Invalid email format'),
        EXPRESS: (0, exports.createExpressValidationError)('password', 'Password must be at least 8 characters')
    },
    APP: {
        UNAUTHORIZED: (0, exports.createAppError)(errors_1.ErrorCodes.UNAUTHORIZED, 'User not authenticated', errors_1.ErrorCategory.AUTHENTICATION),
        NOT_FOUND: (0, exports.createAppError)(errors_1.ErrorCodes.NOT_FOUND, 'Resource not found', errors_1.ErrorCategory.NOT_FOUND, { resourceType: 'user', id: '123' }),
        BUSINESS_RULE: (0, exports.createAppError)(errors_1.ErrorCodes.BUSINESS_RULE_VIOLATION, 'Invalid state transition', errors_1.ErrorCategory.BUSINESS_RULE, { currentState: 'DRAFT', targetState: 'COMPLETED' })
    }
};
