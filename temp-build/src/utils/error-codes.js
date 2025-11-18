"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorCodes = void 0;
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
})(ErrorCodes || (exports.ErrorCodes = ErrorCodes = {}));
