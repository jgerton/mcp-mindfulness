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
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateUser = exports.authenticateToken = void 0;
const jwt_utils_1 = require("../utils/jwt.utils");
const user_model_1 = require("../models/user.model");
const authenticateToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).json({ error: 'No token provided' });
        return;
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json({ error: 'No token provided' });
        return;
    }
    try {
        const decoded = (0, jwt_utils_1.verifyToken)(token);
        req.user = { _id: decoded._id, username: decoded.username };
        if (process.env.NODE_ENV === 'test') {
            next();
            return;
        }
        const user = yield user_model_1.User.findById(decoded._id);
        if (!user) {
            res.status(401).json({ error: 'User not found' });
            return;
        }
        req.user = { _id: user._id.toString(), username: user.username };
        next();
    }
    catch (error) {
        console.error('Authentication error:', error);
        res.status(401).json({ error: 'Invalid token' });
        return;
    }
});
exports.authenticateToken = authenticateToken;
// Export alias for backward compatibility
exports.authenticateUser = exports.authenticateToken;
