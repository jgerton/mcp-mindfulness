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
exports.ChatService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const chat_message_model_1 = require("../models/chat-message.model");
const group_session_model_1 = require("../models/group-session.model");
const user_model_1 = require("../models/user.model");
class ChatService {
    static addMessage(sessionId_1, senderId_1, content_1) {
        return __awaiter(this, arguments, void 0, function* (sessionId, senderId, content, type = 'text') {
            const session = yield group_session_model_1.GroupSession.findById(sessionId);
            if (!session) {
                throw new Error('Session not found');
            }
            // Don't allow messages in cancelled sessions unless it's a system message
            if (session.status === 'cancelled' && type !== 'system') {
                throw new Error('Cannot send messages in a cancelled session');
            }
            const sender = yield user_model_1.User.findById(senderId);
            if (!sender) {
                throw new Error('User not found');
            }
            // Check if user is a participant in the session
            const participant = session.participants.find(p => p.userId.equals(senderId));
            const isParticipant = participant && participant.status === 'joined';
            if (!isParticipant && !session.hostId.equals(senderId) && type !== 'system') {
                throw new Error('User is not a participant in this session');
            }
            const message = yield chat_message_model_1.ChatMessage.create({
                sessionId: new mongoose_1.default.Types.ObjectId(sessionId),
                senderId: new mongoose_1.default.Types.ObjectId(senderId),
                content,
                type
            });
            return message.populate([
                { path: 'senderId', select: 'username' }
            ]);
        });
    }
    static getSessionMessages(sessionId_1) {
        return __awaiter(this, arguments, void 0, function* (sessionId, options = {}) {
            const query = { sessionId: new mongoose_1.default.Types.ObjectId(sessionId) };
            if (options.before) {
                query.createdAt = { $lt: options.before };
            }
            return chat_message_model_1.ChatMessage.find(query)
                .sort({ createdAt: -1 })
                .limit(options.limit || 50)
                .populate('senderId', 'username');
        });
    }
    static addSystemMessage(sessionId, content) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield group_session_model_1.GroupSession.findById(sessionId);
            if (!session) {
                throw new Error('Session not found');
            }
            const message = yield chat_message_model_1.ChatMessage.create({
                sessionId: new mongoose_1.default.Types.ObjectId(sessionId),
                senderId: session.hostId, // Use host's ID for system messages
                content,
                type: 'system'
            });
            return message;
        });
    }
    static getSessionParticipants(sessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield group_session_model_1.GroupSession.findById(sessionId).populate('participants.userId', 'username');
            if (!session) {
                throw new Error('Session not found');
            }
            return session;
        });
    }
}
exports.ChatService = ChatService;
