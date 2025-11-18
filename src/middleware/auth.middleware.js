"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateUser = void 0;
exports.authenticateToken = authenticateToken;
const jwt_1 = require("../utils/jwt");
const user_model_1 = require("../models/user.model");
const http_error_1 = require("../errors/http-error");
const error_codes_1 = require("../utils/error-codes");
async function authenticateToken(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader === null || authHeader === void 0 ? void 0 : authHeader.split(' ')[1];
        if (!token) {
            throw new http_error_1.HttpError(401, 'No token provided', {
                code: error_codes_1.ErrorCodes.AUTHENTICATION_ERROR,
                category: error_codes_1.ErrorCategory.AUTHENTICATION
            });
        }
        const decoded = (0, jwt_1.verifyToken)(token);
        const user = await user_model_1.User.findById(decoded.userId);
        if (!user) {
            throw new http_error_1.HttpError(401, 'Invalid token', {
                code: error_codes_1.ErrorCodes.AUTHENTICATION_ERROR,
                category: error_codes_1.ErrorCategory.AUTHENTICATION
            });
        }
        // Update last login
        await user_model_1.User.findByIdAndUpdate(decoded.userId, {
            lastLogin: new Date()
        });
        req.user = { _id: user.id, username: user.username || '' };
        next();
    }
    catch (error) {
        next(error);
    }
}
// Export alias for backward compatibility
exports.authenticateUser = authenticateToken;
