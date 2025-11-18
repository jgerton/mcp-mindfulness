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
exports.GroupSessionService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const group_session_model_1 = require("../models/group-session.model");
const friend_service_1 = require("./friend.service");
const user_model_1 = require("../models/user.model");
const achievement_service_1 = require("./achievement.service");
const chat_service_1 = require("./chat.service");
class GroupSessionService {
    static createSession(hostId_1, meditationId_1, title_1, scheduledTime_1, duration_1) {
        return __awaiter(this, arguments, void 0, function* (hostId, meditationId, title, scheduledTime, duration, options = {}) {
            var _a;
            const now = new Date();
            if (scheduledTime < now) {
                throw new Error('Cannot schedule session in the past');
            }
            const session = yield group_session_model_1.GroupSession.create({
                hostId: new mongoose_1.default.Types.ObjectId(hostId),
                meditationId: new mongoose_1.default.Types.ObjectId(meditationId),
                title,
                description: options.description,
                scheduledTime,
                duration,
                maxParticipants: options.maxParticipants || 10,
                isPrivate: options.isPrivate || false,
                allowedParticipants: ((_a = options.allowedParticipants) === null || _a === void 0 ? void 0 : _a.map(id => new mongoose_1.default.Types.ObjectId(id))) || [],
                participants: []
            });
            return session;
        });
    }
    static joinSession(sessionId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield group_session_model_1.GroupSession.findById(sessionId);
            if (!session) {
                throw new Error('Session not found');
            }
            const userObjectId = new mongoose_1.default.Types.ObjectId(userId);
            if (!session.canUserJoin(userObjectId)) {
                throw new Error('Session is full');
            }
            session.participants.push({
                userId: userObjectId,
                status: 'joined',
                duration: 0,
                joinedAt: new Date(),
                sessionData: {
                    durationCompleted: 0,
                    startTime: new Date(),
                    endTime: undefined
                }
            });
            yield session.save();
            return session;
        });
    }
    static startSession(sessionId, hostId) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield group_session_model_1.GroupSession.findOne({
                _id: sessionId,
                hostId,
                status: 'scheduled'
            });
            if (!session) {
                throw new Error('Session not found or cannot be started');
            }
            // Add host as participant if not already joined
            const hostParticipant = session.participants.find(p => p.userId.equals(hostId));
            if (!hostParticipant) {
                session.participants.push({
                    userId: new mongoose_1.default.Types.ObjectId(hostId),
                    status: 'joined',
                    duration: 0,
                    joinedAt: new Date(),
                    sessionData: {
                        durationCompleted: 0,
                        startTime: new Date(),
                        endTime: undefined
                    }
                });
            }
            session.status = 'in_progress';
            const startTime = new Date();
            // Initialize session data for all participants
            for (const p of session.participants) {
                if (p.status === 'joined') {
                    p.sessionData = {
                        durationCompleted: 0,
                        startTime: startTime,
                        endTime: undefined
                    };
                }
            }
            yield session.save();
            return session.populate([
                { path: 'participants.userId', select: 'username' },
                { path: 'meditationId' }
            ]);
        });
    }
    static completeSession(sessionId, userId, sessionData) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield group_session_model_1.GroupSession.findById(sessionId);
            if (!session) {
                throw new Error('Session not found');
            }
            const participant = session.participants.find(p => p.userId.equals(userId) && p.status === 'joined');
            if (!participant) {
                throw new Error('Participant not found or already completed');
            }
            participant.status = 'completed';
            participant.sessionData = {
                durationCompleted: session.duration,
                startTime: new Date(),
                endTime: new Date()
            };
            participant.duration = session.duration;
            // If all participants completed or left, mark session as completed
            const activeParticipants = session.participants.filter(p => p.status === 'joined');
            if (activeParticipants.length === 0) {
                session.status = 'completed';
            }
            yield session.save();
            // Process achievements for group meditation
            if (session.participants.length >= 3) {
                yield achievement_service_1.AchievementService.processGroupSession(userId);
            }
            return session;
        });
    }
    static leaveSession(sessionId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield group_session_model_1.GroupSession.findById(sessionId);
            if (!session) {
                throw new Error('Session not found');
            }
            const participant = session.participants.find(p => p.userId.equals(userId) && p.status === 'joined');
            if (!participant) {
                throw new Error('Participant not found or already left/completed');
            }
            // Get participant's username for the message
            const user = yield user_model_1.User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            participant.status = 'left';
            yield session.save();
            // Add system message about participant leaving
            yield chat_service_1.ChatService.addMessage(sessionId, userId, `${user.username} has left the session`, 'system');
            return session;
        });
    }
    static cancelSession(sessionId, hostId) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield group_session_model_1.GroupSession.findOne({
                _id: sessionId,
                hostId,
                status: { $in: ['scheduled', 'in-progress'] }
            });
            if (!session) {
                throw new Error('Session not found or cannot be cancelled');
            }
            session.status = 'cancelled';
            yield session.save();
            // Add system message about session cancellation
            yield chat_service_1.ChatService.addMessage(sessionId, hostId, 'Session has been cancelled by the host', 'system');
            return session;
        });
    }
    static getUpcomingSessions(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield user_model_1.User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            const friendIds = yield friend_service_1.FriendService.getFriendList(userId)
                .then(friends => friends.map(f => f.requesterId.equals(userId) ? f.recipientId : f.requesterId));
            return group_session_model_1.GroupSession.find({
                scheduledTime: { $gt: new Date() },
                status: 'scheduled',
                $or: [
                    { isPrivate: false },
                    { hostId: { $in: [userId, ...friendIds] } },
                    { allowedParticipants: userId }
                ]
            }).populate([
                { path: 'hostId', select: 'username' },
                { path: 'meditationId' },
                { path: 'participants.userId', select: 'username' }
            ]).sort({ scheduledTime: 1 });
        });
    }
    static getUserSessions(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const sessions = yield group_session_model_1.GroupSession.find({
                $or: [
                    { hostId: new mongoose_1.default.Types.ObjectId(userId) },
                    { 'participants.userId': new mongoose_1.default.Types.ObjectId(userId) }
                ]
            }).populate([
                { path: 'hostId', select: 'username' },
                { path: 'meditationId' },
                { path: 'participants.userId', select: 'username' }
            ]).sort({ scheduledTime: -1 }).lean();
            // Convert populated ObjectIds to strings for comparison
            return sessions.map(session => (Object.assign(Object.assign({}, session), { hostId: session.hostId._id || session.hostId })));
        });
    }
    static endSession(sessionId, hostId) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield group_session_model_1.GroupSession.findById(sessionId);
            if (!session) {
                throw new Error('Session not found');
            }
            if (!session.hostId.equals(hostId)) {
                throw new Error('Only the host can end the session');
            }
            if (session.status !== 'in_progress') {
                throw new Error('Session must be in progress to end it');
            }
            session.status = 'completed';
            session.endTime = new Date();
            yield session.save();
            // Add system message about session ending
            yield chat_service_1.ChatService.addSystemMessage(sessionId, 'Session ended by the host');
            return session;
        });
    }
}
exports.GroupSessionService = GroupSessionService;
