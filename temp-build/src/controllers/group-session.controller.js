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
exports.GroupSessionController = void 0;
const group_session_service_1 = require("../services/group-session.service");
class GroupSessionController {
    static createSession(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const hostId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
                const { meditationId, title, scheduledTime, duration, description, maxParticipants, isPrivate, allowedParticipants } = req.body;
                if (!hostId || !meditationId || !title || !scheduledTime || !duration) {
                    return res.status(400).json({ message: 'Missing required fields' });
                }
                const session = yield group_session_service_1.GroupSessionService.createSession(hostId.toString(), meditationId, title, new Date(scheduledTime), duration, {
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
        });
    }
    static joinSession(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { sessionId } = req.params;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
                if (!userId || !sessionId) {
                    return res.status(400).json({ message: 'Missing required fields' });
                }
                const session = yield group_session_service_1.GroupSessionService.joinSession(sessionId, userId.toString());
                res.json(session);
            }
            catch (error) {
                res.status(400).json({ message: error.message });
            }
        });
    }
    static startSession(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { sessionId } = req.params;
                const hostId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
                if (!hostId || !sessionId) {
                    return res.status(400).json({ message: 'Missing required fields' });
                }
                const session = yield group_session_service_1.GroupSessionService.startSession(sessionId, hostId.toString());
                res.json(session);
            }
            catch (error) {
                res.status(400).json({ message: error.message });
            }
        });
    }
    static completeSession(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { sessionId } = req.params;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
                const { durationCompleted, moodBefore, moodAfter } = req.body;
                if (!userId || !sessionId || !durationCompleted) {
                    return res.status(400).json({ message: 'Missing required fields' });
                }
                const session = yield group_session_service_1.GroupSessionService.completeSession(sessionId, userId.toString(), {
                    durationCompleted,
                    moodBefore,
                    moodAfter
                });
                res.json(session);
            }
            catch (error) {
                res.status(400).json({ message: error.message });
            }
        });
    }
    static leaveSession(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { sessionId } = req.params;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
                if (!userId || !sessionId) {
                    return res.status(400).json({ message: 'Missing required fields' });
                }
                const session = yield group_session_service_1.GroupSessionService.leaveSession(sessionId, userId.toString());
                res.json(session);
            }
            catch (error) {
                res.status(400).json({ message: error.message });
            }
        });
    }
    static cancelSession(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { sessionId } = req.params;
                const hostId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
                if (!hostId || !sessionId) {
                    return res.status(400).json({ message: 'Missing required fields' });
                }
                const session = yield group_session_service_1.GroupSessionService.cancelSession(sessionId, hostId.toString());
                res.json(session);
            }
            catch (error) {
                res.status(400).json({ message: error.message });
            }
        });
    }
    static getUpcomingSessions(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
                if (!userId) {
                    return res.status(400).json({ message: 'User ID is required' });
                }
                const sessions = yield group_session_service_1.GroupSessionService.getUpcomingSessions(userId.toString());
                res.json(sessions);
            }
            catch (error) {
                res.status(400).json({ message: error.message });
            }
        });
    }
    static getUserSessions(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
                if (!userId) {
                    return res.status(400).json({ message: 'User ID is required' });
                }
                const sessions = yield group_session_service_1.GroupSessionService.getUserSessions(userId.toString());
                res.json(sessions);
            }
            catch (error) {
                res.status(400).json({ message: error.message });
            }
        });
    }
}
exports.GroupSessionController = GroupSessionController;
