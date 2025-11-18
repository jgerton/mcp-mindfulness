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
exports.ChatController = void 0;
const chat_service_1 = require("../services/chat.service");
class ChatController {
    static getSessionMessages(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { sessionId } = req.params;
                const { before, limit } = req.query;
                const messages = yield chat_service_1.ChatService.getSessionMessages(sessionId, {
                    before: before ? new Date(before) : undefined,
                    limit: limit ? parseInt(limit) : undefined
                });
                res.json(messages);
            }
            catch (error) {
                res.status(400).json({ message: error.message });
            }
        });
    }
    static sendMessage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { sessionId } = req.params;
                const { content } = req.body;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
                if (!userId || !content) {
                    return res.status(400).json({ message: 'Missing required fields' });
                }
                const message = yield chat_service_1.ChatService.addMessage(sessionId, userId.toString(), content);
                res.status(201).json(message);
            }
            catch (error) {
                res.status(400).json({ message: error.message });
            }
        });
    }
    static getActiveParticipants(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { sessionId } = req.params;
                const session = yield chat_service_1.ChatService.getSessionParticipants(sessionId);
                res.json(session.participants.filter(p => p.status === 'joined'));
            }
            catch (error) {
                res.status(400).json({ message: error.message });
            }
        });
    }
}
exports.ChatController = ChatController;
