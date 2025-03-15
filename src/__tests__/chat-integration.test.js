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
const socket_io_1 = require("socket.io");
const http_1 = require("http");
const socket_io_client_1 = require("socket.io-client");
const user_model_1 = require("../models/user.model");
const group_session_model_1 = require("../models/group-session.model");
const chat_message_model_1 = require("../models/chat-message.model");
const group_session_service_1 = require("../services/group-session.service");
const chat_service_1 = require("../services/chat.service");
const jwt_utils_1 = require("../utils/jwt.utils");
const app_1 = require("../app");
describe('Chat Integration with Group Sessions', () => {
    let httpServer;
    let ioServer;
    let hostSocket;
    let participant1Socket;
    let participant2Socket;
    let port;
    let host;
    let participant1;
    let participant2;
    let session;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        httpServer = (0, http_1.createServer)(app_1.app);
        ioServer = new socket_io_1.Server(httpServer);
        httpServer.listen(0);
        port = httpServer.address().port;
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield mongoose_1.default.disconnect();
        yield new Promise((resolve) => {
            ioServer.close(() => {
                httpServer.close(() => {
                    resolve();
                });
            });
        });
    }));
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield user_model_1.User.deleteMany({});
        yield group_session_model_1.GroupSession.deleteMany({});
        yield chat_message_model_1.ChatMessage.deleteMany({});
        // Create test users
        host = yield user_model_1.User.create({
            username: 'host',
            email: 'host@test.com',
            password: 'password123'
        });
        participant1 = yield user_model_1.User.create({
            username: 'participant1',
            email: 'participant1@test.com',
            password: 'password123'
        });
        participant2 = yield user_model_1.User.create({
            username: 'participant2',
            email: 'participant2@test.com',
            password: 'password123'
        });
        // Create test session
        const scheduledTime = new Date();
        scheduledTime.setHours(scheduledTime.getHours() + 1);
        const mockMeditationId = new mongoose_1.default.Types.ObjectId();
        session = yield group_session_service_1.GroupSessionService.createSession(host._id.toString(), mockMeditationId.toString(), 'Test Session', scheduledTime, 15, { maxParticipants: 3 });
        // Connect sockets
        hostSocket = (0, socket_io_client_1.io)(`http://localhost:${port}`, {
            auth: { token: (0, jwt_utils_1.generateToken)(host._id.toString(), host.username) }
        });
        participant1Socket = (0, socket_io_client_1.io)(`http://localhost:${port}`, {
            auth: { token: (0, jwt_utils_1.generateToken)(participant1._id.toString(), participant1.username) }
        });
        participant2Socket = (0, socket_io_client_1.io)(`http://localhost:${port}`, {
            auth: { token: (0, jwt_utils_1.generateToken)(participant2._id.toString(), participant2.username) }
        });
        // Wait for all sockets to connect
        yield Promise.all([
            new Promise((resolve) => hostSocket.on('connect', resolve)),
            new Promise((resolve) => participant1Socket.on('connect', resolve)),
            new Promise((resolve) => participant2Socket.on('connect', resolve))
        ]);
    }));
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        [hostSocket, participant1Socket, participant2Socket].forEach(socket => {
            if (socket.connected)
                socket.disconnect();
        });
    }));
    describe('Session Lifecycle Integration', () => {
        it('should handle chat messages during session lifecycle', () => __awaiter(void 0, void 0, void 0, function* () {
            // Join session
            yield group_session_service_1.GroupSessionService.joinSession(session._id.toString(), participant1._id.toString());
            yield group_session_service_1.GroupSessionService.joinSession(session._id.toString(), participant2._id.toString());
            // Emit join events
            hostSocket.emit('join_session', session._id.toString());
            participant1Socket.emit('join_session', session._id.toString());
            participant2Socket.emit('join_session', session._id.toString());
            // Wait for join messages
            yield new Promise(resolve => setTimeout(resolve, 100));
            // Start session
            yield group_session_service_1.GroupSessionService.startSession(session._id.toString(), host._id.toString());
            // Send messages during session
            yield chat_service_1.ChatService.addMessage(session._id.toString(), host._id.toString(), 'Welcome to the meditation session!');
            yield chat_service_1.ChatService.addMessage(session._id.toString(), participant1._id.toString(), 'Thank you for hosting!');
            // Verify messages
            const messages = yield chat_service_1.ChatService.getSessionMessages(session._id.toString());
            expect(messages).toHaveLength(2);
            expect(messages[0].content).toBe('Thank you for hosting!');
            expect(messages[1].content).toBe('Welcome to the meditation session!');
            // End session
            yield group_session_service_1.GroupSessionService.endSession(session._id.toString(), host._id.toString());
            // Verify system message about session ending
            const allMessages = yield chat_service_1.ChatService.getSessionMessages(session._id.toString());
            const lastMessage = allMessages[0];
            expect(lastMessage.type).toBe('system');
            expect(lastMessage.content).toContain('Session ended');
        }));
        it('should handle participant leaving during session', () => __awaiter(void 0, void 0, void 0, function* () {
            // Join session
            yield group_session_service_1.GroupSessionService.joinSession(session._id.toString(), participant1._id.toString());
            yield group_session_service_1.GroupSessionService.joinSession(session._id.toString(), participant2._id.toString());
            // Start session
            yield group_session_service_1.GroupSessionService.startSession(session._id.toString(), host._id.toString());
            // Participant leaves
            yield group_session_service_1.GroupSessionService.leaveSession(session._id.toString(), participant1._id.toString());
            // Verify leave message
            const messages = yield chat_service_1.ChatService.getSessionMessages(session._id.toString());
            const leaveMessage = messages.find(m => m.type === 'system' &&
                m.content.includes('participant1') &&
                m.content.includes('left the session'));
            expect(leaveMessage).toBeTruthy();
            // Verify participant can't send messages after leaving
            yield expect(chat_service_1.ChatService.addMessage(session._id.toString(), participant1._id.toString(), 'Can I still chat?')).rejects.toThrow('User is not a participant in this session');
        }));
        it('should handle session cancellation', () => __awaiter(void 0, void 0, void 0, function* () {
            // Join session
            yield group_session_service_1.GroupSessionService.joinSession(session._id.toString(), participant1._id.toString());
            // Send some messages
            yield chat_service_1.ChatService.addMessage(session._id.toString(), host._id.toString(), 'Session will start soon!');
            // Cancel session
            yield group_session_service_1.GroupSessionService.cancelSession(session._id.toString(), host._id.toString());
            // Verify cancellation message
            const messages = yield chat_service_1.ChatService.getSessionMessages(session._id.toString());
            const cancelMessage = messages.find(m => m.type === 'system' &&
                m.content.includes('cancelled'));
            expect(cancelMessage).toBeTruthy();
            // Verify no new messages can be sent
            yield expect(chat_service_1.ChatService.addMessage(session._id.toString(), participant1._id.toString(), 'Hello?')).rejects.toThrow('Cannot send messages in a cancelled session');
        }));
    });
});
