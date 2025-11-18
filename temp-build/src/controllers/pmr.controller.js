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
exports.PMRController = void 0;
const pmr_service_1 = require("../services/pmr.service");
class PMRController {
    static getMuscleGroups(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield pmr_service_1.PMRService.initializeDefaultMuscleGroups();
                const muscleGroups = yield pmr_service_1.PMRService.getMuscleGroups();
                res.json(muscleGroups);
            }
            catch (error) {
                console.error('Error getting muscle groups:', error);
                res.status(500).json({ error: 'Failed to get muscle groups' });
            }
        });
    }
    static startSession(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
                const { stressLevelBefore } = req.body;
                if (!userId) {
                    res.status(401).json({ error: 'Unauthorized' });
                    return;
                }
                // Validate stressLevelBefore is provided
                if (stressLevelBefore === undefined) {
                    res.status(400).json({ error: 'Stress level is required' });
                    return;
                }
                const session = yield pmr_service_1.PMRService.startSession(userId, stressLevelBefore);
                res.json(session);
            }
            catch (error) {
                console.error('Error starting PMR session:', error);
                res.status(500).json({ error: 'Failed to start PMR session' });
            }
        });
    }
    static completeSession(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { sessionId } = req.params;
                const { completedGroups, stressLevelAfter } = req.body;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
                // Check if session belongs to user
                const session = yield pmr_service_1.PMRService.getSessionById(sessionId);
                if (!session) {
                    res.status(404).json({ error: 'Session not found' });
                    return;
                }
                if (session.userId !== userId) {
                    res.status(403).json({ error: 'Unauthorized access to session' });
                    return;
                }
                const updatedSession = yield pmr_service_1.PMRService.completeSession(sessionId, completedGroups, stressLevelAfter);
                res.json(updatedSession);
            }
            catch (error) {
                console.error('Error completing PMR session:', error);
                if (error instanceof Error && error.message === 'Session not found') {
                    res.status(404).json({ error: 'Session not found' });
                }
                else if (error instanceof Error && error.message.includes('already completed')) {
                    res.status(400).json({ error: error.message });
                }
                else {
                    res.status(500).json({ error: 'Failed to complete PMR session' });
                }
            }
        });
    }
    static updateProgress(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { sessionId } = req.params;
                const { completedGroup } = req.body;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
                // Check if session belongs to user
                const session = yield pmr_service_1.PMRService.getSessionById(sessionId);
                if (!session) {
                    res.status(404).json({ error: 'Session not found' });
                    return;
                }
                if (session.userId !== userId) {
                    res.status(403).json({ error: 'Unauthorized access to session' });
                    return;
                }
                const updatedSession = yield pmr_service_1.PMRService.updateMuscleGroupProgress(sessionId, completedGroup);
                res.json(updatedSession);
            }
            catch (error) {
                console.error('Error updating PMR progress:', error);
                if (error instanceof Error && error.message === 'Session not found') {
                    res.status(404).json({ error: 'Session not found' });
                }
                else if (error instanceof Error && error.message.includes('Invalid muscle group')) {
                    res.status(400).json({ error: error.message });
                }
                else if (error instanceof Error && error.message.includes('already completed')) {
                    res.status(400).json({ error: error.message });
                }
                else {
                    res.status(500).json({ error: 'Failed to update PMR progress' });
                }
            }
        });
    }
    static getUserSessions(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
                const limit = req.query.limit ? parseInt(req.query.limit) : 10;
                if (!userId) {
                    res.status(401).json({ error: 'Unauthorized' });
                    return;
                }
                const sessions = yield pmr_service_1.PMRService.getUserSessions(userId, limit);
                res.json(sessions);
            }
            catch (error) {
                console.error('Error getting user PMR sessions:', error);
                res.status(500).json({ error: 'Failed to get user PMR sessions' });
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
                const effectiveness = yield pmr_service_1.PMRService.getEffectiveness(userId);
                res.json(effectiveness);
            }
            catch (error) {
                console.error('Error getting PMR effectiveness:', error);
                res.status(500).json({ error: 'Failed to get PMR effectiveness' });
            }
        });
    }
}
exports.PMRController = PMRController;
