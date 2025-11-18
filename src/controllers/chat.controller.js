"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatController = void 0;
const chat_service_1 = require("../services/chat.service");
class ChatController {
    static async getSessionMessages(req, res) {
        try {
            const { sessionId } = req.params;
            const { before, limit } = req.query;
            const messages = await chat_service_1.ChatService.getSessionMessages(sessionId, {
                before: before ? new Date(before) : undefined,
                limit: limit ? parseInt(limit) : undefined
            });
            res.json(messages);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async sendMessage(req, res) {
        var _a;
        try {
            const { sessionId } = req.params;
            const { content } = req.body;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            if (!userId || !content) {
                return res.status(400).json({ message: 'Missing required fields' });
            }
            const message = await chat_service_1.ChatService.addMessage(sessionId, userId.toString(), content);
            res.status(201).json(message);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    static async getActiveParticipants(req, res) {
        try {
            const { sessionId } = req.params;
            const session = await chat_service_1.ChatService.getSessionParticipants(sessionId);
            res.json(session.participants.filter(p => p.status === 'joined'));
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}
exports.ChatController = ChatController;
