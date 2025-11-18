"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupSessionController = void 0;
const group_session_service_1 = require("../services/group-session.service");
class GroupSessionController {
    static async createSession(req, res) {
        var _a;
        try {
            const hostId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            const { meditationId, title, scheduledTime, duration, description, maxParticipants, isPrivate, allowedParticipants } = req.body;
            if (!hostId || !meditationId || !title || !scheduledTime || !duration) {
                return res.status(400).json({ message: 'Missing required fields' });
            }
            const session = await group_session_service_1.GroupSessionService.createSession(hostId.toString(), meditationId, title, new Date(scheduledTime), duration, {
                description,
                maxParticipants,
                isPrivate,
                allowedParticipants
            });
            res.status(201).json(session);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async joinSession(req, res) {
        var _a;
        try {
            const { sessionId } = req.params;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            if (!userId || !sessionId) {
                return res.status(400).json({ message: 'Missing required fields' });
            }
            const session = await group_session_service_1.GroupSessionService.joinSession(sessionId, userId.toString());
            res.json(session);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async startSession(req, res) {
        var _a;
        try {
            const { sessionId } = req.params;
            const hostId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            if (!hostId || !sessionId) {
                return res.status(400).json({ message: 'Missing required fields' });
            }
            const session = await group_session_service_1.GroupSessionService.startSession(sessionId, hostId.toString());
            res.json(session);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async completeSession(req, res) {
        var _a;
        try {
            const { sessionId } = req.params;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            const { durationCompleted, moodBefore, moodAfter } = req.body;
            if (!userId || !sessionId || !durationCompleted) {
                return res.status(400).json({ message: 'Missing required fields' });
            }
            const session = await group_session_service_1.GroupSessionService.completeSession(sessionId, userId.toString(), {
                durationCompleted,
                moodBefore,
                moodAfter
            });
            res.json(session);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async leaveSession(req, res) {
        var _a;
        try {
            const { sessionId } = req.params;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            if (!userId || !sessionId) {
                return res.status(400).json({ message: 'Missing required fields' });
            }
            const session = await group_session_service_1.GroupSessionService.leaveSession(sessionId, userId.toString());
            res.json(session);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async cancelSession(req, res) {
        var _a;
        try {
            const { sessionId } = req.params;
            const hostId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            if (!hostId || !sessionId) {
                return res.status(400).json({ message: 'Missing required fields' });
            }
            const session = await group_session_service_1.GroupSessionService.cancelSession(sessionId, hostId.toString());
            res.json(session);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async getUpcomingSessions(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            if (!userId) {
                return res.status(400).json({ message: 'User ID is required' });
            }
            const sessions = await group_session_service_1.GroupSessionService.getUpcomingSessions(userId.toString());
            res.json(sessions);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async getUserSessions(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            if (!userId) {
                return res.status(400).json({ message: 'User ID is required' });
            }
            const sessions = await group_session_service_1.GroupSessionService.getUserSessions(userId.toString());
            res.json(sessions);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}
exports.GroupSessionController = GroupSessionController;
