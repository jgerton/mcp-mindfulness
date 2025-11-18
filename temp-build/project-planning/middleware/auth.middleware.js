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
exports.isResourceOwnerOrAdmin = exports.isAdmin = exports.authenticateJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
/**
 * Middleware to authenticate JWT tokens
 */
const authenticateJWT = (req, res, next) => {
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).json({ error: 'Unauthorized: No token provided' });
        return;
    }
    // Extract the token (Bearer token format)
    const token = authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json({ error: 'Unauthorized: Invalid token format' });
        return;
    }
    try {
        // Verify the token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'default_secret');
        // Add the decoded user to the request object
        req.user = decoded;
        // Continue to the next middleware or route handler
        next();
    }
    catch (error) {
        if (error.name === 'TokenExpiredError') {
            res.status(401).json({ error: 'Unauthorized: Token expired' });
        }
        else {
            res.status(401).json({ error: 'Unauthorized: Invalid token' });
        }
    }
};
exports.authenticateJWT = authenticateJWT;
/**
 * Middleware to check if user has admin role
 */
const isAdmin = (req, res, next) => {
    // Check if user exists and has admin role
    if (!req.user || !req.user.isAdmin) {
        res.status(403).json({ error: 'Forbidden: Admin access required' });
        return;
    }
    // User is admin, continue
    next();
};
exports.isAdmin = isAdmin;
/**
 * Middleware to check if user owns the resource or is an admin
 * @param getResourceUserId Function to extract the user ID from the resource
 */
const isResourceOwnerOrAdmin = (getResourceUserId) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Check if user exists
            if (!req.user) {
                res.status(401).json({ error: 'Unauthorized: User not authenticated' });
                return;
            }
            // If user is admin, allow access
            if (req.user.isAdmin) {
                next();
                return;
            }
            // Get the resource owner's user ID
            const resourceUserId = yield getResourceUserId(req);
            // If resource doesn't exist or doesn't have a user ID
            if (!resourceUserId) {
                res.status(404).json({ error: 'Resource not found' });
                return;
            }
            // Check if the authenticated user is the resource owner
            if (req.user._id.toString() !== resourceUserId.toString()) {
                res.status(403).json({ error: 'Forbidden: You do not have permission to access this resource' });
                return;
            }
            // User is the resource owner, continue
            next();
        }
        catch (error) {
            console.error('Error in isResourceOwnerOrAdmin middleware:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
};
exports.isResourceOwnerOrAdmin = isResourceOwnerOrAdmin;
