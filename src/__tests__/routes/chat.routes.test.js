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
const supertest_1 = __importDefault(require("supertest"));
const test_server_1 = require("../utils/test-server");
const chat_controller_1 = require("../../controllers/chat.controller");
const error_codes_1 = require("../../utils/error-codes");
jest.mock('../../controllers/chat.controller');
describe('Chat Routes', () => {
    let app;
    let authToken;
    const mockMessages = [
        {
            id: 'msg1',
            sessionId: 'session123',
            senderId: 'user123',
            content: 'Hello everyone!',
            type: 'text',
            createdAt: '2024-01-01T10:00:00Z'
        },
        {
            id: 'msg2',
            sessionId: 'session123',
            senderId: 'user456',
            content: 'Hi there!',
            type: 'text',
            createdAt: '2024-01-01T10:01:00Z'
        }
    ];
    const mockParticipants = [
        {
            userId: 'user123',
            username: 'john_doe',
            status: 'joined',
            joinedAt: '2024-01-01T09:55:00Z'
        },
        {
            userId: 'user456',
            username: 'jane_doe',
            status: 'joined',
            joinedAt: '2024-01-01T09:56:00Z'
        }
    ];
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        app = yield (0, test_server_1.createServer)();
        authToken = 'valid.jwt.token';
    }));
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('GET /sessions/:sessionId/messages', () => {
        it('should get session messages successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            chat_controller_1.ChatController.getSessionMessages.mockImplementation((req, res) => {
                res.json(mockMessages);
            });
            const response = yield (0, supertest_1.default)(app)
                .get('/api/chat/sessions/session123/messages')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockMessages);
        }));
        it('should handle pagination parameters', () => __awaiter(void 0, void 0, void 0, function* () {
            chat_controller_1.ChatController.getSessionMessages.mockImplementation((req, res) => {
                res.json(mockMessages.slice(0, 1));
            });
            const response = yield (0, supertest_1.default)(app)
                .get('/api/chat/sessions/session123/messages')
                .query({ before: '2024-01-01T10:01:00Z', limit: '1' })
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(1);
        }));
        it('should handle non-existent session', () => __awaiter(void 0, void 0, void 0, function* () {
            chat_controller_1.ChatController.getSessionMessages.mockImplementation((req, res) => {
                res.status(404).json({ message: 'Session not found' });
            });
            const response = yield (0, supertest_1.default)(app)
                .get('/api/chat/sessions/nonexistent/messages')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('message', 'Session not found');
        }));
        it('should require authentication', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get('/api/chat/sessions/session123/messages');
            expect(response.status).toBe(401);
            expect(response.body.error.code).toBe(error_codes_1.ErrorCodes.AUTHENTICATION_ERROR);
        }));
    });
    describe('POST /sessions/:sessionId/messages', () => {
        const validMessage = {
            content: 'Hello everyone!'
        };
        it('should send message successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockNewMessage = {
                id: 'msg3',
                sessionId: 'session123',
                senderId: 'user123',
                content: validMessage.content,
                type: 'text',
                createdAt: '2024-01-01T10:02:00Z'
            };
            chat_controller_1.ChatController.sendMessage.mockImplementation((req, res) => {
                res.status(201).json(mockNewMessage);
            });
            const response = yield (0, supertest_1.default)(app)
                .post('/api/chat/sessions/session123/messages')
                .set('Authorization', `Bearer ${authToken}`)
                .send(validMessage);
            expect(response.status).toBe(201);
            expect(response.body).toEqual(mockNewMessage);
        }));
        it('should validate message content', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .post('/api/chat/sessions/session123/messages')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ content: '' });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message');
        }));
        it('should handle non-existent session', () => __awaiter(void 0, void 0, void 0, function* () {
            chat_controller_1.ChatController.sendMessage.mockImplementation((req, res) => {
                res.status(404).json({ message: 'Session not found' });
            });
            const response = yield (0, supertest_1.default)(app)
                .post('/api/chat/sessions/nonexistent/messages')
                .set('Authorization', `Bearer ${authToken}`)
                .send(validMessage);
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('message', 'Session not found');
        }));
        it('should require authentication', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .post('/api/chat/sessions/session123/messages')
                .send(validMessage);
            expect(response.status).toBe(401);
            expect(response.body.error.code).toBe(error_codes_1.ErrorCodes.AUTHENTICATION_ERROR);
        }));
    });
    describe('GET /sessions/:sessionId/participants', () => {
        it('should get active participants successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            chat_controller_1.ChatController.getActiveParticipants.mockImplementation((req, res) => {
                res.json(mockParticipants);
            });
            const response = yield (0, supertest_1.default)(app)
                .get('/api/chat/sessions/session123/participants')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockParticipants);
        }));
        it('should handle non-existent session', () => __awaiter(void 0, void 0, void 0, function* () {
            chat_controller_1.ChatController.getActiveParticipants.mockImplementation((req, res) => {
                res.status(404).json({ message: 'Session not found' });
            });
            const response = yield (0, supertest_1.default)(app)
                .get('/api/chat/sessions/nonexistent/participants')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('message', 'Session not found');
        }));
        it('should require authentication', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get('/api/chat/sessions/session123/participants');
            expect(response.status).toBe(401);
            expect(response.body.error.code).toBe(error_codes_1.ErrorCodes.AUTHENTICATION_ERROR);
        }));
    });
});
