"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpError = void 0;
const error_codes_1 = require("../utils/error-codes");
class HttpError extends Error {
    constructor(statusCode, message, errorDetails) {
        super(message);
        this.name = 'HttpError';
        this.statusCode = statusCode;
        this.code = (errorDetails === null || errorDetails === void 0 ? void 0 : errorDetails.code) || error_codes_1.ErrorCodes.INTERNAL_ERROR;
        this.category = (errorDetails === null || errorDetails === void 0 ? void 0 : errorDetails.category) || error_codes_1.ErrorCategory.INTERNAL;
        this.details = errorDetails === null || errorDetails === void 0 ? void 0 : errorDetails.details;
    }
    static notFound(message = 'Resource not found') {
        return new HttpError(404, message);
    }
    static badRequest(message, details) {
        return new HttpError(400, message, { code: error_codes_1.ErrorCodes.BAD_REQUEST, category: error_codes_1.ErrorCategory.BAD_REQUEST, details });
    }
    static unauthorized(message = 'Unauthorized') {
        return new HttpError(401, message, { code: error_codes_1.ErrorCodes.UNAUTHORIZED, category: error_codes_1.ErrorCategory.UNAUTHORIZED });
    }
    static forbidden(message = 'Forbidden') {
        return new HttpError(403, message, { code: error_codes_1.ErrorCodes.FORBIDDEN, category: error_codes_1.ErrorCategory.FORBIDDEN });
    }
    static conflict(message) {
        return new HttpError(409, message, { code: error_codes_1.ErrorCodes.CONFLICT, category: error_codes_1.ErrorCategory.CONFLICT });
    }
    static internal(message = 'Internal server error') {
        return new HttpError(500, message, { code: error_codes_1.ErrorCodes.INTERNAL_ERROR, category: error_codes_1.ErrorCategory.INTERNAL });
    }
}
exports.HttpError = HttpError;
