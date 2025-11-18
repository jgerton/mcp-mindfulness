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
const chat_controller_1 = require("../../controllers/chat.controller");
const chat_service_1 = require("../../services/chat.service");
const mongoose_1 = __importDefault(require("mongoose"));
jest.mock('../../services/chat.service');
describe('ChatController', () => {
    let mockReq;
    let mockRes;
    const mockUserId = new mongoose_1.default.Types.ObjectId().toString();
    const mockSessionId = new mongoose_1.default.Types.ObjectId().toString();
    beforeEach(() => {
        mockReq = {
            params: { sessionId: mockSessionId },
            query: {},
            body: {},
            user: { _id: mockUserId },
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        jest.clearAllMocks();
    });
    describe('getSessionMessages', () => {
        const mockMessages = [
            {
                _id: new mongoose_1.default.Types.ObjectId().toString(),
                sessionId: mockSessionId,
                userId: mockUserId,
                content: 'Test message 1',
                timestamp: new Date(),
            },
            {
                _id: new mongoose_1.default.Types.ObjectId().toString(),
                sessionId: mockSessionId,
                userId: mockUserId,
                content: 'Test message 2',
                timestamp: new Date(),
            },
        ];
        it('should return messages successfully without query params', () => __awaiter(void 0, void 0, void 0, function* () {
            chat_service_1.ChatService.getSessionMessages.mockResolvedValue(mockMessages);
            yield chat_controller_1.ChatController.getSessionMessages(mockReq, mockRes);
            expect(chat_service_1.ChatService.getSessionMessages).toHaveBeenCalledWith(mockSessionId, { before: undefined, limit: undefined });
            expect(mockRes.json).toHaveBeenCalledWith(mockMessages);
        }));
        it('should return messages with pagination params', () => __awaiter(void 0, void 0, void 0, function* () {
            const beforeDate = new Date();
            mockReq.query = {
                before: beforeDate.toISOString(),
                limit: '10',
            };
            chat_service_1.ChatService.getSessionMessages.mockResolvedValue(mockMessages);
            yield chat_controller_1.ChatController.getSessionMessages(mockReq, mockRes);
            expect(chat_service_1.ChatService.getSessionMessages).toHaveBeenCalledWith(mockSessionId, { before: beforeDate, limit: 10 });
            expect(mockRes.json).toHaveBeenCalledWith(mockMessages);
        }));
        it('should handle service errors', () => __awaiter(void 0, void 0, void 0, function* () {
            const error = new Error('Failed to fetch messages');
            chat_service_1.ChatService.getSessionMessages.mockRejectedValue(error);
            yield chat_controller_1.ChatController.getSessionMessages(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({ message: error.message });
        }));
    });
    describe('sendMessage', () => {
        const mockMessage = {
            _id: new mongoose_1.default.Types.ObjectId().toString(),
            sessionId: mockSessionId,
            userId: mockUserId,
            content: 'Test message',
            timestamp: new Date(),
        };
        beforeEach(() => {
            mockReq.body = { content: 'Test message' };
        });
        it('should send message successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            chat_service_1.ChatService.addMessage.mockResolvedValue(mockMessage);
            yield chat_controller_1.ChatController.sendMessage(mockReq, mockRes);
            expect(chat_service_1.ChatService.addMessage).toHaveBeenCalledWith(mockSessionId, mockUserId, 'Test message');
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith(mockMessage);
        }));
        it('should return 400 if user is not authenticated', () => __awaiter(void 0, void 0, void 0, function* () {
            mockReq.user = undefined;
            yield chat_controller_1.ChatController.sendMessage(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Missing required fields' });
            expect(chat_service_1.ChatService.addMessage).not.toHaveBeenCalled();
        }));
        it('should return 400 if content is missing', () => __awaiter(void 0, void 0, void 0, function* () {
            mockReq.body = {};
            yield chat_controller_1.ChatController.sendMessage(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Missing required fields' });
            expect(chat_service_1.ChatService.addMessage).not.toHaveBeenCalled();
        }));
        it('should handle service errors', () => __awaiter(void 0, void 0, void 0, function* () {
            const error = new Error('Failed to send message');
            chat_service_1.ChatService.addMessage.mockRejectedValue(error);
            yield chat_controller_1.ChatController.sendMessage(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({ message: error.message });
        }));
    });
    describe('getActiveParticipants', () => {
        const mockParticipants = [
            { userId: new mongoose_1.default.Types.ObjectId().toString(), status: 'joined' },
            { userId: new mongoose_1.default.Types.ObjectId().toString(), status: 'joined' },
            { userId: new mongoose_1.default.Types.ObjectId().toString(), status: 'left' },
        ];
        const mockSession = {
            _id: mockSessionId,
            participants: mockParticipants,
        };
        it('should return active participants successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            chat_service_1.ChatService.getSessionParticipants.mockResolvedValue(mockSession);
            yield chat_controller_1.ChatController.getActiveParticipants(mockReq, mockRes);
            expect(chat_service_1.ChatService.getSessionParticipants).toHaveBeenCalledWith(mockSessionId);
            expect(mockRes.json).toHaveBeenCalledWith(mockParticipants.filter(p => p.status === 'joined'));
        }));
        it('should handle service errors', () => __awaiter(void 0, void 0, void 0, function* () {
            const error = new Error('Failed to fetch participants');
            chat_service_1.ChatService.getSessionParticipants.mockRejectedValue(error);
            yield chat_controller_1.ChatController.getActiveParticipants(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({ message: error.message });
        }));
    });
});
