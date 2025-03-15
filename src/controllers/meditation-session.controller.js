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
exports.MeditationSessionController = void 0;
const meditation_session_service_1 = require("../services/meditation-session.service");
class MeditationSessionController {
    constructor() {
        this.meditationSessionService = new meditation_session_service_1.MeditationSessionService();
    }
    // Start a new meditation session
    startSession(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
                if (!userId) {
                    res.status(401).json({ message: 'Unauthorized' });
                    return;
                }
                // Check for active session
                const activeSession = yield this.meditationSessionService.getActiveSession(userId);
                if (activeSession) {
                    res.status(400).json({ message: 'Active session already exists' });
                    return;
                }
                const session = yield this.meditationSessionService.startSession(userId, req.body);
                res.status(201).json(session);
            }
            catch (error) {
                if (error instanceof Error) {
                    res.status(400).json({ message: error.message });
                    return;
                }
                res.status(500).json({ message: 'Internal server error' });
            }
        });
    }
    // Complete a meditation session
    completeSession(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
                if (!userId) {
                    res.status(401).json({ message: 'Unauthorized' });
                    return;
                }
                const session = yield this.meditationSessionService.completeSession(req.params.sessionId, req.body);
                if (!session) {
                    res.status(404).json({ message: 'Session not found' });
                    return;
                }
                res.status(200).json(session);
            }
            catch (error) {
                if (error instanceof Error && error.message === 'Session not found') {
                    res.status(404).json({ message: error.message });
                    return;
                }
                if (error instanceof Error) {
                    res.status(400).json({ message: error.message });
                    return;
                }
                res.status(500).json({ message: 'Internal server error' });
            }
        });
    }
    // Get active session for user
    getActiveSession(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
                if (!userId) {
                    res.status(401).json({ message: 'Unauthorized' });
                    return;
                }
                const session = yield this.meditationSessionService.getActiveSession(userId);
                if (!session) {
                    res.status(404).json({ message: 'No active session found' });
                    return;
                }
                res.json(session);
            }
            catch (error) {
                res.status(500).json({ message: 'Internal server error' });
            }
        });
    }
    // Get all meditation sessions for the current user
    getAll(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
                if (!userId) {
                    res.status(401).json({ message: 'Unauthorized' });
                    return;
                }
                const sessions = yield this.meditationSessionService.getAllSessions(userId, req.query);
                res.json(sessions);
            }
            catch (error) {
                res.status(500).json({ message: 'Internal server error' });
            }
        });
    }
    // Get a single meditation session
    getById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
                if (!userId) {
                    res.status(401).json({ message: 'Unauthorized' });
                    return;
                }
                const session = yield this.meditationSessionService.getSessionById(req.params.id, userId);
                if (!session) {
                    res.status(404).json({ message: 'Session not found' });
                    return;
                }
                res.json(session);
            }
            catch (error) {
                res.status(500).json({ message: 'Internal server error' });
            }
        });
    }
    // Update a meditation session (e.g., mark as completed, add notes)
    update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
                if (!userId) {
                    res.status(401).json({ message: 'Unauthorized' });
                    return;
                }
                const session = yield this.meditationSessionService.updateSession(req.params.id, userId, req.body);
                if (!session) {
                    res.status(404).json({ message: 'Session not found' });
                    return;
                }
                res.json(session);
            }
            catch (error) {
                res.status(500).json({ message: 'Internal server error' });
            }
        });
    }
    // Get user's meditation statistics
    getStats(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
                if (!userId) {
                    res.status(401).json({ message: 'Unauthorized' });
                    return;
                }
                const stats = yield this.meditationSessionService.getUserStats(userId);
                res.json(stats);
            }
            catch (error) {
                res.status(500).json({ message: 'Internal server error' });
            }
        });
    }
}
exports.MeditationSessionController = MeditationSessionController;
