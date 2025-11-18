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
exports.SessionController = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const auth_error_1 = require("../errors/auth.error");
const validation_error_1 = require("../errors/validation.error");
const not_found_error_1 = require("../errors/not-found.error");
/**
 * Example Controller with proper error handling
 *
 * This controller demonstrates best practices for:
 * - ObjectId validation
 * - Error handling with appropriate status codes
 * - Consistent error response format
 * - Authorization checks
 * - Try/catch blocks for async operations
 */
class SessionController {
    constructor(sessionService) {
        this.sessionService = sessionService;
    }
    /**
     * Get a session by ID
     *
     * @param req Express request object
     * @param res Express response object
     */
    getSessionById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const userId = req.user._id;
                // Validate ObjectId
                if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                    res.status(400).json({ error: 'Invalid session ID format' });
                    return;
                }
                // Get session
                const session = yield this.sessionService.getSessionById(id);
                // Check if session exists
                if (!session) {
                    res.status(404).json({ error: 'Session not found' });
                    return;
                }
                // Authorization check
                if (session.userId.toString() !== userId.toString()) {
                    res.status(403).json({ error: 'Access denied' });
                    return;
                }
                // Return session
                res.status(200).json(session);
            }
            catch (error) {
                this.handleError(error, res);
            }
        });
    }
    /**
     * Create a new session
     *
     * @param req Express request object
     * @param res Express response object
     */
    createSession(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user._id;
                const { duration, type, stressLevelBefore } = req.body;
                // Validate required fields
                if (!duration || !type) {
                    res.status(400).json({ error: 'Duration and type are required' });
                    return;
                }
                // Validate stress level if provided
                if (stressLevelBefore !== undefined && (stressLevelBefore < 1 || stressLevelBefore > 10)) {
                    res.status(400).json({ error: 'Stress level must be between 1 and 10' });
                    return;
                }
                // Create session
                const session = yield this.sessionService.createSession({
                    userId,
                    duration,
                    type,
                    stressLevelBefore,
                    startTime: new Date()
                });
                // Return created session
                res.status(201).json(session);
            }
            catch (error) {
                this.handleError(error, res);
            }
        });
    }
    /**
     * Complete a session
     *
     * @param req Express request object
     * @param res Express response object
     */
    completeSession(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const userId = req.user._id;
                const { stressLevelAfter } = req.body;
                // Validate ObjectId
                if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                    res.status(400).json({ error: 'Invalid session ID format' });
                    return;
                }
                // Validate stress level
                if (stressLevelAfter === undefined || stressLevelAfter < 1 || stressLevelAfter > 10) {
                    res.status(400).json({ error: 'Stress level after must be between 1 and 10' });
                    return;
                }
                // Get session
                const session = yield this.sessionService.getSessionById(id);
                // Check if session exists
                if (!session) {
                    res.status(404).json({ error: 'Session not found' });
                    return;
                }
                // Authorization check
                if (session.userId.toString() !== userId.toString()) {
                    res.status(403).json({ error: 'Access denied' });
                    return;
                }
                // Check if session is already completed
                if (session.completed) {
                    res.status(400).json({ error: 'Session already completed' });
                    return;
                }
                // Complete session
                const completedSession = yield this.sessionService.completeSession(id, {
                    endTime: new Date(),
                    stressLevelAfter,
                    completed: true
                });
                // Return completed session
                res.status(200).json(completedSession);
            }
            catch (error) {
                this.handleError(error, res);
            }
        });
    }
    /**
     * Handle errors with appropriate status codes
     *
     * @param error Error object
     * @param res Express response object
     */
    handleError(error, res) {
        console.error('Controller error:', error);
        if (error instanceof validation_error_1.ValidationError) {
            res.status(400).json({ error: error.message });
        }
        else if (error instanceof not_found_error_1.NotFoundError) {
            res.status(404).json({ error: error.message });
        }
        else if (error instanceof auth_error_1.AuthError) {
            res.status(401).json({ error: error.message });
        }
        else if (error instanceof mongoose_1.default.Error.CastError) {
            res.status(400).json({ error: 'Invalid ID format' });
        }
        else if (error instanceof mongoose_1.default.Error.ValidationError) {
            res.status(400).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}
exports.SessionController = SessionController;
