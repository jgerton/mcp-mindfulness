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
exports.BreathingController = void 0;
const breathing_service_1 = require("../services/breathing.service");
const mongoose_1 = __importDefault(require("mongoose"));
class BreathingController {
    static getPatterns(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield breathing_service_1.BreathingService.initializeDefaultPatterns();
                const pattern = yield breathing_service_1.BreathingService.getPattern(req.params.name);
                if (!pattern) {
                    res.status(404).json({ error: 'Breathing pattern not found' });
                    return;
                }
                res.json(pattern);
            }
            catch (error) {
                console.error('Error getting breathing pattern:', error);
                res.status(500).json({ error: 'Failed to get breathing pattern' });
            }
        });
    }
    static startSession(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
                const { patternName, stressLevelBefore } = req.body;
                if (!userId) {
                    res.status(401).json({ error: 'Unauthorized' });
                    return;
                }
                if (!patternName) {
                    res.status(400).json({ error: 'Pattern name is required' });
                    return;
                }
                if (stressLevelBefore !== undefined && (stressLevelBefore < 0 || stressLevelBefore > 10 || !Number.isInteger(stressLevelBefore))) {
                    res.status(400).json({ error: 'Stress level must be an integer between 0 and 10' });
                    return;
                }
                // Check if pattern exists before creating session
                const pattern = yield breathing_service_1.BreathingService.getPattern(patternName);
                if (!pattern) {
                    res.status(400).json({ error: 'Invalid pattern' });
                    return;
                }
                const session = yield breathing_service_1.BreathingService.startSession(userId, patternName, stressLevelBefore);
                res.json(session);
            }
            catch (error) {
                console.error('Error starting breathing session:', error);
                res.status(500).json({ error: 'Failed to start breathing session' });
            }
        });
    }
    static completeSession(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { sessionId } = req.params;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
                const { completedCycles, stressLevelAfter } = req.body;
                if (!userId) {
                    res.status(401).json({ error: 'Unauthorized' });
                    return;
                }
                if (!mongoose_1.default.Types.ObjectId.isValid(sessionId)) {
                    res.status(404).json({ error: 'Invalid session ID' });
                    return;
                }
                if (completedCycles !== undefined && (completedCycles < 0 || !Number.isInteger(completedCycles))) {
                    res.status(400).json({ error: 'Completed cycles must be a non-negative integer' });
                    return;
                }
                if (stressLevelAfter !== undefined && (stressLevelAfter < 0 || stressLevelAfter > 10 || !Number.isInteger(stressLevelAfter))) {
                    res.status(400).json({ error: 'Stress level must be an integer between 0 and 10' });
                    return;
                }
                // Check if session belongs to user
                const session = yield breathing_service_1.BreathingService.getUserSessionById(sessionId);
                if (!session) {
                    res.status(404).json({ error: 'Session not found' });
                    return;
                }
                if (session.userId.toString() !== userId.toString()) {
                    res.status(403).json({ error: 'Unauthorized access to this session' });
                    return;
                }
                if (session.endTime) {
                    res.status(400).json({ error: 'Session already completed' });
                    return;
                }
                const updatedSession = yield breathing_service_1.BreathingService.completeSession(sessionId, completedCycles, stressLevelAfter);
                res.json(updatedSession);
            }
            catch (error) {
                console.error('Error completing breathing session:', error);
                res.status(500).json({ error: 'Failed to complete breathing session' });
            }
        });
    }
    static getUserSessions(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
                const limitParam = req.query.limit ? parseInt(req.query.limit) : 10;
                if (!userId) {
                    res.status(401).json({ error: 'Unauthorized' });
                    return;
                }
                // Validate limit parameter
                if (isNaN(limitParam)) {
                    res.status(400).json({ error: 'Limit must be a number' });
                    return;
                }
                if (limitParam < 1 || limitParam > 100) {
                    res.status(400).json({ error: 'Limit must be between 1 and 100' });
                    return;
                }
                const sessions = yield breathing_service_1.BreathingService.getUserSessions(userId, limitParam);
                res.json(sessions);
            }
            catch (error) {
                console.error('Error getting user breathing sessions:', error);
                res.status(500).json({ error: 'Failed to get user breathing sessions' });
            }
        });
    }
    static getEffectiveness(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
                if (!userId) {
                    res.status(401).json({ error: 'Unauthorized' });
                    return;
                }
                const effectiveness = yield breathing_service_1.BreathingService.getEffectiveness(userId);
                res.json(effectiveness);
            }
            catch (error) {
                console.error('Error getting breathing effectiveness:', error);
                res.status(500).json({ error: 'Failed to get breathing effectiveness' });
            }
        });
    }
}
exports.BreathingController = BreathingController;
