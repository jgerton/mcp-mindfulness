"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DB_ERROR_MOCKS = exports.createServiceError = exports.SERVICE_CONTEXTS = exports.DATABASE_ERROR_TYPES = exports.TEST_IDS = exports.OPERATION_STATES = exports.DATABASE_OPERATIONS = void 0;
const mongoose_1 = require("mongoose");
const errors_1 = require("../../utils/errors");
const error_codes_1 = require("../../utils/error-codes");
const error_responses_1 = require("./error-responses");
// Database Operations
exports.DATABASE_OPERATIONS = {
    CREATE: 'CREATE',
    UPDATE: 'UPDATE',
    DELETE: 'DELETE',
    FIND: 'FIND',
    AGGREGATE: 'AGGREGATE'
};
// Operation States
exports.OPERATION_STATES = {
    STARTED: 'started',
    IN_PROGRESS: 'in_progress',
    FAILED: 'failed',
    COMPLETED: 'completed'
};
// Test Entity IDs
exports.TEST_IDS = {
    USER: new mongoose_1.Types.ObjectId(),
    SESSION: new mongoose_1.Types.ObjectId(),
    MEDITATION: new mongoose_1.Types.ObjectId(),
    EXPORT: new mongoose_1.Types.ObjectId()
};
// Database Error Types
exports.DATABASE_ERROR_TYPES = {
    CONNECTION: 'CONNECTION_ERROR',
    TIMEOUT: 'TIMEOUT_ERROR',
    DUPLICATE: 'DUPLICATE_ERROR',
    VALIDATION: 'VALIDATION_ERROR'
};
// Service contexts for error mocks
exports.SERVICE_CONTEXTS = {
    MEDITATION: {
        entity: 'meditation',
        entityId: exports.TEST_IDS.MEDITATION.toString(),
        fields: ['duration', 'type', 'completed']
    },
    USER: {
        entity: 'user',
        entityId: exports.TEST_IDS.USER.toString(),
        fields: ['email', 'name', 'role']
    },
    SESSION: {
        entity: 'session',
        entityId: exports.TEST_IDS.SESSION.toString(),
        fields: ['startTime', 'endTime', 'duration']
    }
};
// Helper to create service errors
const createServiceError = (operation, message, code, category, context, severity = errors_1.ErrorSeverity.ERROR) => {
    return new errors_1.AppError(message, code, category, severity, Object.assign({ operation, timestamp: new Date() }, context));
};
exports.createServiceError = createServiceError;
// Database error mocks
exports.DB_ERROR_MOCKS = {
    CONNECTION_ERROR: (0, exports.createServiceError)('FIND', 'Database connection failed', error_codes_1.ErrorCodes.DATABASE_ERROR, errors_1.ErrorCategory.TECHNICAL, exports.SERVICE_CONTEXTS.MEDITATION),
    TIMEOUT_ERROR: (0, exports.createServiceError)('CREATE', 'Database operation timeout', error_codes_1.ErrorCodes.SERVICE_UNAVAILABLE, errors_1.ErrorCategory.TECHNICAL, exports.SERVICE_CONTEXTS.USER),
    DUPLICATE_ERROR: (0, exports.createServiceError)('UPDATE', error_responses_1.ERROR_MESSAGES.CONCURRENCY, error_codes_1.ErrorCodes.DUPLICATE_ERROR, errors_1.ErrorCategory.VALIDATION, exports.SERVICE_CONTEXTS.SESSION),
    VALIDATION_ERROR: (0, exports.createServiceError)('CREATE', error_responses_1.ERROR_MESSAGES.VALIDATION, error_codes_1.ErrorCodes.VALIDATION_ERROR, errors_1.ErrorCategory.VALIDATION, exports.SERVICE_CONTEXTS.MEDITATION)
};
