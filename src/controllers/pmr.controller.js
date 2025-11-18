"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PMRController = void 0;
const pmr_service_1 = require("../services/pmr.service");
class PMRController {
    static async getMuscleGroups(req, res) {
        try {
            await pmr_service_1.PMRService.initializeDefaultMuscleGroups();
            const muscleGroups = await pmr_service_1.PMRService.getMuscleGroups();
            res.json(muscleGroups);
        }
        catch (error) {
            console.error('Error getting muscle groups:', error);
            res.status(500).json({ error: 'Failed to get muscle groups' });
        }
    }
    static async startSession(req, res) {
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
            const session = await pmr_service_1.PMRService.startSession(userId, stressLevelBefore);
            res.json(session);
        }
        catch (error) {
            console.error('Error starting PMR session:', error);
            res.status(500).json({ error: 'Failed to start PMR session' });
        }
    }
    static async completeSession(req, res) {
        var _a;
        try {
            const { sessionId } = req.params;
            const { completedGroups, stressLevelAfter } = req.body;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            // Check if session belongs to user
            const session = await pmr_service_1.PMRService.getSessionById(sessionId);
            if (!session) {
                res.status(404).json({ error: 'Session not found' });
                return;
            }
            if (session.userId !== userId) {
                res.status(403).json({ error: 'Unauthorized access to session' });
                return;
            }
            const updatedSession = await pmr_service_1.PMRService.completeSession(sessionId, completedGroups, stressLevelAfter);
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
    }
    static async updateProgress(req, res) {
        var _a;
        try {
            const { sessionId } = req.params;
            const { completedGroup } = req.body;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            // Check if session belongs to user
            const session = await pmr_service_1.PMRService.getSessionById(sessionId);
            if (!session) {
                res.status(404).json({ error: 'Session not found' });
                return;
            }
            if (session.userId !== userId) {
                res.status(403).json({ error: 'Unauthorized access to session' });
                return;
            }
            const updatedSession = await pmr_service_1.PMRService.updateMuscleGroupProgress(sessionId, completedGroup);
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
    }
    static async getUserSessions(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            const limit = req.query.limit ? parseInt(req.query.limit) : 10;
            if (!userId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            const sessions = await pmr_service_1.PMRService.getUserSessions(userId, limit);
            res.json(sessions);
        }
        catch (error) {
            console.error('Error getting user PMR sessions:', error);
            res.status(500).json({ error: 'Failed to get user PMR sessions' });
        }
    }
    static async getEffectiveness(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            if (!userId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            const effectiveness = await pmr_service_1.PMRService.getEffectiveness(userId);
            res.json(effectiveness);
        }
        catch (error) {
            console.error('Error getting PMR effectiveness:', error);
            res.status(500).json({ error: 'Failed to get PMR effectiveness' });
        }
    }
}
exports.PMRController = PMRController;
