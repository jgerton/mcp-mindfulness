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
const chat_message_model_1 = require("../../models/chat-message.model");
const db_handler_1 = require("../test-utils/db-handler");
describe('ChatMessage Model', () => {
    let testMessage;
    let sessionId;
    let senderId;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_handler_1.connectToTestDB)();
    }));
    beforeEach(() => {
        sessionId = new mongoose_1.default.Types.ObjectId();
        senderId = new mongoose_1.default.Types.ObjectId();
        testMessage = {
            sessionId,
            senderId,
            content: 'Test message',
            type: 'text'
        };
        jest.spyOn(mongoose_1.default.Model.prototype, 'save')
            .mockImplementation(function () {
            return Promise.resolve(this);
        });
    });
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_handler_1.clearDatabase)();
        jest.clearAllMocks();
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_handler_1.disconnectFromTestDB)();
    }));
    describe('Success Cases', () => {
        it('should create chat message successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const message = yield chat_message_model_1.ChatMessage.create(testMessage);
            expect(message.sessionId).toEqual(testMessage.sessionId);
            expect(message.senderId).toEqual(testMessage.senderId);
            expect(message.content).toBe(testMessage.content);
            expect(message.type).toBe(testMessage.type);
        }));
        it('should set default values correctly', () => __awaiter(void 0, void 0, void 0, function* () {
            const message = yield chat_message_model_1.ChatMessage.create(Object.assign(Object.assign({}, testMessage), { type: undefined }));
            expect(message.type).toBe('text');
            expect(message.createdAt).toBeDefined();
            expect(message.updatedAt).toBeDefined();
        }));
        it('should handle virtual fields correctly', () => __awaiter(void 0, void 0, void 0, function* () {
            const message = yield chat_message_model_1.ChatMessage.create(testMessage);
            expect(message.userId).toBe(senderId.toString());
        }));
    });
    describe('Error Cases', () => {
        it('should reject missing required fields', () => __awaiter(void 0, void 0, void 0, function* () {
            const message = new chat_message_model_1.ChatMessage({});
            const validationError = yield message.validateSync();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.sessionId).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.senderId).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.content).toBeDefined();
        }));
        it('should reject invalid type values', () => __awaiter(void 0, void 0, void 0, function* () {
            const message = new chat_message_model_1.ChatMessage(Object.assign(Object.assign({}, testMessage), { type: 'invalid' }));
            const validationError = yield message.validateSync();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.type).toBeDefined();
        }));
        it('should reject invalid ObjectId references', () => __awaiter(void 0, void 0, void 0, function* () {
            const message = new chat_message_model_1.ChatMessage(Object.assign(Object.assign({}, testMessage), { sessionId: 'invalid', senderId: 'invalid' }));
            const validationError = yield message.validateSync();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.sessionId).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.senderId).toBeDefined();
        }));
    });
    describe('Edge Cases', () => {
        it('should handle whitespace in content', () => __awaiter(void 0, void 0, void 0, function* () {
            const message = yield chat_message_model_1.ChatMessage.create(Object.assign(Object.assign({}, testMessage), { content: '  Test message with spaces  ' }));
            expect(message.content).toBe('Test message with spaces');
        }));
        it('should handle timestamp updates on modification', () => __awaiter(void 0, void 0, void 0, function* () {
            const message = yield chat_message_model_1.ChatMessage.create(testMessage);
            const originalUpdatedAt = message.updatedAt;
            yield new Promise(resolve => setTimeout(resolve, 1000)); // ensure time difference
            message.content = 'Updated content';
            yield message.save();
            expect(message.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
        }));
        it('should handle system message type', () => __awaiter(void 0, void 0, void 0, function* () {
            const systemMessage = yield chat_message_model_1.ChatMessage.create(Object.assign(Object.assign({}, testMessage), { type: 'system', content: 'User joined the chat' }));
            expect(systemMessage.type).toBe('system');
            expect(systemMessage.content).toBe('User joined the chat');
        }));
    });
});
