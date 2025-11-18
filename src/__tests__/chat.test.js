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
// Set test environment
process.env.NODE_ENV = 'test';
const mongoose_1 = __importDefault(require("mongoose"));
const socket_io_client_1 = require("socket.io-client");
const user_model_1 = require("../models/user.model");
const group_session_model_1 = require("../models/group-session.model");
const chat_message_model_1 = require("../models/chat-message.model");
const group_session_service_1 = require("../services/group-session.service");
const chat_service_1 = require("../services/chat.service");
const jwt_utils_1 = require("../utils/jwt.utils");
const app_1 = require("../app");
describe('Chat System', () => {
    let clientSocket;
    let port;
    let host;
    let participant1;
    let participant2;
    let session;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        // Start the server
        app_1.httpServer.listen(0);
        port = app_1.httpServer.address().port;
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        if (clientSocket) {
            clientSocket.disconnect();
        }
        yield mongoose_1.default.disconnect();
        yield new Promise((resolve) => {
            app_1.httpServer.close(() => {
                resolve();
            });
        });
        // Ensure all handles are closed
        yield new Promise(resolve => setTimeout(resolve, 500));
    }));
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield user_model_1.User.deleteMany({});
        yield group_session_model_1.GroupSession.deleteMany({});
        yield chat_message_model_1.ChatMessage.deleteMany({});
        // Create test users with unique usernames
        host = yield user_model_1.User.create({
            username: `host_${Date.now()}`,
            email: 'host@test.com',
            password: 'password123',
            friendIds: [],
            blockedUserIds: []
        });
        participant1 = yield user_model_1.User.create({
            username: `participant1_${Date.now()}`,
            email: 'participant1@test.com',
            password: 'password123',
            friendIds: [],
            blockedUserIds: []
        });
        participant2 = yield user_model_1.User.create({
            username: `participant2_${Date.now()}`,
            email: 'participant2@test.com',
            password: 'password123',
            friendIds: [],
            blockedUserIds: []
        });
        // Create test session with current time
        const scheduledTime = new Date();
        scheduledTime.setMinutes(scheduledTime.getMinutes() + 5); // Schedule 5 minutes from now
        const mockMeditationId = new mongoose_1.default.Types.ObjectId();
        session = yield group_session_service_1.GroupSessionService.createSession(host._id.toString(), mockMeditationId.toString(), 'Test Session', scheduledTime, 15, { maxParticipants: 3, isPrivate: false });
        // Ensure session is created
        if (!session) {
            throw new Error('Failed to create test session');
        }
        // Join the session as participant1
        yield group_session_service_1.GroupSessionService.joinSession(session._id.toString(), participant1._id.toString());
        // Connect client socket with proper error handling
        return new Promise((resolve, reject) => {
            const token = (0, jwt_utils_1.generateToken)(participant1._id.toString(), participant1.username);
            clientSocket = (0, socket_io_client_1.io)(`http://localhost:${port}`, {
                auth: { token },
                reconnection: true,
                reconnectionAttempts: 3,
                reconnectionDelay: 1000,
                timeout: 5000
            });
            const timeout = setTimeout(() => {
                reject(new Error('Socket connection timeout'));
            }, 5000);
            clientSocket.on('connect', () => {
                clearTimeout(timeout);
                resolve();
            });
            clientSocket.on('connect_error', (error) => {
                clearTimeout(timeout);
                reject(error);
            });
        });
    }));
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        if (clientSocket) {
            clientSocket.disconnect();
        }
        yield user_model_1.User.deleteMany({});
        yield group_session_model_1.GroupSession.deleteMany({});
        yield chat_message_model_1.ChatMessage.deleteMany({});
    }));
    describe('REST API', () => {
        it('should get session messages', () => __awaiter(void 0, void 0, void 0, function* () {
            // Add some test messages
            yield chat_service_1.ChatService.addMessage(session._id.toString(), participant1._id.toString(), 'Hello everyone!');
            yield chat_service_1.ChatService.addMessage(session._id.toString(), host._id.toString(), 'Welcome!');
            const messages = yield chat_service_1.ChatService.getSessionMessages(session._id.toString());
            expect(messages).toHaveLength(2);
            expect(messages[0].content).toBe('Welcome!');
            expect(messages[1].content).toBe('Hello everyone!');
        }));
        it('should not allow non-participants to send messages', () => __awaiter(void 0, void 0, void 0, function* () {
            const nonParticipant = yield user_model_1.User.create({
                username: 'nonparticipant',
                email: 'nonpart@test.com',
                password: 'password123'
            });
            yield expect(chat_service_1.ChatService.addMessage(session._id.toString(), nonParticipant._id.toString(), 'Hello!')).rejects.toThrow('User is not a participant in this session');
        }));
    });
    describe('WebSocket Events', () => {
        it('should handle join_session event', (done) => {
            const timeout = setTimeout(() => {
                done(new Error('Test timed out'));
            }, 5000);
            clientSocket.on('connect_error', (error) => {
                clearTimeout(timeout);
                done(error);
            });
            clientSocket.on('error', (error) => {
                clearTimeout(timeout);
                done(error);
            });
            clientSocket.on('user_joined', (data) => {
                try {
                    clearTimeout(timeout);
                    expect(data.userId).toBe(participant1._id.toString());
                    expect(data.username).toBe(participant1.username);
                    done();
                }
                catch (error) {
                    done(error);
                }
            });
            clientSocket.emit('join_session', session._id.toString());
        }, 10000);
        it('should handle send_message event', (done) => {
            const timeout = setTimeout(() => {
                done(new Error('Test timed out'));
            }, 5000);
            const cleanup = (error) => {
                clearTimeout(timeout);
                if (error)
                    done(error);
            };
            clientSocket.on('connect_error', cleanup);
            clientSocket.on('error', cleanup);
            clientSocket.on('new_message', (message) => {
                try {
                    expect(message.content).toBe('Hello, world!');
                    expect(message.userId).toBe(participant1._id.toString());
                    cleanup();
                    done();
                }
                catch (error) {
                    cleanup(error);
                }
            });
            clientSocket.emit('join_session', session._id.toString());
            clientSocket.on('user_joined', () => {
                clientSocket.emit('send_message', {
                    sessionId: session._id.toString(),
                    content: 'Hello, world!'
                });
            });
        }, 10000);
        it('should handle typing indicators', (done) => {
            const timeout = setTimeout(() => {
                done(new Error('Test timed out'));
            }, 5000);
            const cleanup = (error) => {
                clearTimeout(timeout);
                if (error)
                    done(error);
            };
            clientSocket.on('connect_error', cleanup);
            clientSocket.on('error', cleanup);
            let typingStartReceived = false;
            clientSocket.on('typing_start', (data) => {
                try {
                    expect(data.userId).toBe(participant1._id.toString());
                    expect(data.username).toBe(participant1.username);
                    typingStartReceived = true;
                    clientSocket.emit('typing_end', session._id.toString());
                }
                catch (error) {
                    cleanup(error);
                }
            });
            clientSocket.on('typing_end', (data) => {
                try {
                    expect(typingStartReceived).toBe(true);
                    expect(data.userId).toBe(participant1._id.toString());
                    expect(data.username).toBe(participant1.username);
                    cleanup();
                    done();
                }
                catch (error) {
                    cleanup(error);
                }
            });
            clientSocket.emit('join_session', session._id.toString());
            clientSocket.on('user_joined', () => {
                clientSocket.emit('typing_start', session._id.toString());
            });
        }, 10000);
    });
});
