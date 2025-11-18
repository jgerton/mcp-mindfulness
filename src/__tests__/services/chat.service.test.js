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
const mongoose_1 = __importDefault(require("mongoose"));
const chat_service_1 = require("../../services/chat.service");
const chat_message_model_1 = require("../../models/chat-message.model");
const group_session_model_1 = require("../../models/group-session.model");
const user_model_1 = require("../../models/user.model");
const db_handler_1 = require("../test-utils/db-handler");
const user_factory_1 = require("../factories/user.factory");
describe('ChatService', () => {
    let userFactory;
    let sessionId;
    let hostId;
    let participantId;
    let nonParticipantId;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_handler_1.connectToTestDB)();
    }));
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        userFactory = new user_factory_1.UserTestFactory();
        // Create test users
        const host = userFactory.create({ username: 'host' });
        const participant = userFactory.create({ username: 'participant' });
        const nonParticipant = userFactory.create({ username: 'nonParticipant' });
        yield user_model_1.User.create([host, participant, nonParticipant]);
        hostId = host._id;
        participantId = participant._id;
        nonParticipantId = nonParticipant._id;
        // Create test session
        const session = new group_session_model_1.GroupSession({
            hostId,
            title: 'Test Session',
            scheduledTime: new Date(),
            duration: 1800,
            participants: [{
                    userId: participantId,
                    status: 'joined'
                }]
        });
        yield session.save();
        sessionId = session._id;
    }));
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_handler_1.clearDatabase)();
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_handler_1.disconnectFromTestDB)();
    }));
    describe('addMessage', () => {
        it('should add message from host', () => __awaiter(void 0, void 0, void 0, function* () {
            const message = yield chat_service_1.ChatService.addMessage(sessionId.toString(), hostId.toString(), 'Test message');
            expect(message.content).toBe('Test message');
            expect(message.senderId._id).toEqual(hostId);
            expect(message.type).toBe('text');
        }));
        it('should add message from participant', () => __awaiter(void 0, void 0, void 0, function* () {
            const message = yield chat_service_1.ChatService.addMessage(sessionId.toString(), participantId.toString(), 'Participant message');
            expect(message.content).toBe('Participant message');
            expect(message.senderId._id).toEqual(participantId);
        }));
        it('should reject messages from non-participants', () => __awaiter(void 0, void 0, void 0, function* () {
            yield expect(chat_service_1.ChatService.addMessage(sessionId.toString(), nonParticipantId.toString(), 'Invalid message')).rejects.toThrow('User is not a participant in this session');
        }));
        it('should reject messages for non-existent session', () => __awaiter(void 0, void 0, void 0, function* () {
            yield expect(chat_service_1.ChatService.addMessage(new mongoose_1.default.Types.ObjectId().toString(), hostId.toString(), 'Test message')).rejects.toThrow('Session not found');
        }));
        it('should reject messages in cancelled sessions', () => __awaiter(void 0, void 0, void 0, function* () {
            yield group_session_model_1.GroupSession.findByIdAndUpdate(sessionId, { status: 'cancelled' });
            yield expect(chat_service_1.ChatService.addMessage(sessionId.toString(), hostId.toString(), 'Test message')).rejects.toThrow('Cannot send messages in a cancelled session');
        }));
        it('should allow system messages in cancelled sessions', () => __awaiter(void 0, void 0, void 0, function* () {
            yield group_session_model_1.GroupSession.findByIdAndUpdate(sessionId, { status: 'cancelled' });
            const message = yield chat_service_1.ChatService.addMessage(sessionId.toString(), hostId.toString(), 'System notification', 'system');
            expect(message.type).toBe('system');
            expect(message.content).toBe('System notification');
        }));
    });
    describe('getSessionMessages', () => {
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            // Add test messages
            const messages = Array.from({ length: 5 }, (_, i) => ({
                sessionId,
                senderId: hostId,
                content: `Message ${i + 1}`,
                createdAt: new Date(Date.now() - i * 1000) // Messages 1 second apart
            }));
            yield chat_message_model_1.ChatMessage.insertMany(messages);
        }));
        it('should return messages in correct order', () => __awaiter(void 0, void 0, void 0, function* () {
            const messages = yield chat_service_1.ChatService.getSessionMessages(sessionId.toString());
            expect(messages).toHaveLength(5);
            expect(messages[0].content).toBe('Message 1');
            expect(messages[4].content).toBe('Message 5');
        }));
        it('should respect limit option', () => __awaiter(void 0, void 0, void 0, function* () {
            const messages = yield chat_service_1.ChatService.getSessionMessages(sessionId.toString(), { limit: 3 });
            expect(messages).toHaveLength(3);
        }));
        it('should respect before option', () => __awaiter(void 0, void 0, void 0, function* () {
            const cutoffDate = new Date(Date.now() - 2500); // Between 2nd and 3rd message
            const messages = yield chat_service_1.ChatService.getSessionMessages(sessionId.toString(), { before: cutoffDate });
            expect(messages.every(m => m.createdAt < cutoffDate)).toBe(true);
        }));
        it('should populate sender information', () => __awaiter(void 0, void 0, void 0, function* () {
            const messages = yield chat_service_1.ChatService.getSessionMessages(sessionId.toString());
            expect(messages[0].senderId).toHaveProperty('username', 'host');
        }));
    });
    describe('addSystemMessage', () => {
        it('should add system message', () => __awaiter(void 0, void 0, void 0, function* () {
            const message = yield chat_service_1.ChatService.addSystemMessage(sessionId.toString(), 'System notification');
            expect(message.type).toBe('system');
            expect(message.content).toBe('System notification');
            expect(message.senderId).toEqual(hostId);
        }));
        it('should reject for non-existent session', () => __awaiter(void 0, void 0, void 0, function* () {
            yield expect(chat_service_1.ChatService.addSystemMessage(new mongoose_1.default.Types.ObjectId().toString(), 'System message')).rejects.toThrow('Session not found');
        }));
    });
    describe('getSessionParticipants', () => {
        it('should return populated session participants', () => __awaiter(void 0, void 0, void 0, function* () {
            const session = yield chat_service_1.ChatService.getSessionParticipants(sessionId.toString());
            expect(session.participants).toHaveLength(1);
            expect(session.participants[0].userId).toHaveProperty('username', 'participant');
        }));
        it('should reject for non-existent session', () => __awaiter(void 0, void 0, void 0, function* () {
            yield expect(chat_service_1.ChatService.getSessionParticipants(new mongoose_1.default.Types.ObjectId().toString())).rejects.toThrow('Session not found');
        }));
    });
});
