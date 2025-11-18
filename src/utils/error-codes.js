"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorCategory = exports.ErrorCodes = void 0;
var ErrorCodes;
(function (ErrorCodes) {
    // Authentication Errors
    ErrorCodes["AUTHENTICATION_ERROR"] = "AUTH_001";
    ErrorCodes["INVALID_TOKEN"] = "AUTH_002";
    ErrorCodes["TOKEN_EXPIRED"] = "AUTH_003";
    ErrorCodes["UNAUTHORIZED"] = "AUTH_004";
    // Validation Errors
    ErrorCodes["VALIDATION_ERROR"] = "VAL_001";
    ErrorCodes["INVALID_INPUT"] = "VAL_002";
    // Session Errors
    ErrorCodes["SESSION_NOT_FOUND"] = "SES_001";
    ErrorCodes["SESSION_ALREADY_COMPLETED"] = "SES_002";
    ErrorCodes["SESSION_ALREADY_EXISTS"] = "SES_003";
    ErrorCodes["SESSION_NOT_ACTIVE"] = "SES_004";
    // Group Session Errors
    ErrorCodes["GROUP_SESSION_FULL"] = "GRP_001";
    ErrorCodes["GROUP_SESSION_NOT_FOUND"] = "GRP_002";
    ErrorCodes["GROUP_SESSION_ALREADY_STARTED"] = "GRP_003";
    ErrorCodes["GROUP_SESSION_NOT_STARTED"] = "GRP_004";
    // Resource Errors
    ErrorCodes["NOT_FOUND"] = "RES_001";
    ErrorCodes["ALREADY_EXISTS"] = "RES_002";
    // Concurrency Errors
    ErrorCodes["CONCURRENCY_ERROR"] = "CON_001";
    ErrorCodes["LOCK_ACQUISITION_FAILED"] = "CON_002";
    // External Service Errors
    ErrorCodes["EXTERNAL_SERVICE_ERROR"] = "EXT_001";
    // General Errors
    ErrorCodes["INTERNAL_ERROR"] = "GEN_001";
    ErrorCodes["OPERATION_FAILED"] = "GEN_002";
    // New errors
    ErrorCodes["DUPLICATE_ERROR"] = "DUP_001";
    ErrorCodes["AUTHORIZATION_ERROR"] = "AUTH_005";
    // Additional errors
    ErrorCodes["BAD_REQUEST"] = "BAD_REQUEST";
    ErrorCodes["FORBIDDEN"] = "FORBIDDEN";
    ErrorCodes["CONFLICT"] = "CONFLICT";
    ErrorCodes["DATABASE_ERROR"] = "DB_001";
})(ErrorCodes || (exports.ErrorCodes = ErrorCodes = {}));
var ErrorCategory;
(function (ErrorCategory) {
    ErrorCategory["NOT_FOUND"] = "NOT_FOUND";
    ErrorCategory["VALIDATION"] = "VALIDATION";
    ErrorCategory["AUTHENTICATION"] = "AUTHENTICATION";
    ErrorCategory["AUTHORIZATION"] = "AUTHORIZATION";
    ErrorCategory["INTERNAL"] = "INTERNAL";
    ErrorCategory["BAD_REQUEST"] = "BAD_REQUEST";
    ErrorCategory["UNAUTHORIZED"] = "UNAUTHORIZED";
    ErrorCategory["FORBIDDEN"] = "FORBIDDEN";
    ErrorCategory["CONFLICT"] = "CONFLICT";
    ErrorCategory["TECHNICAL"] = "TECHNICAL";
})(ErrorCategory || (exports.ErrorCategory = ErrorCategory = {}));
