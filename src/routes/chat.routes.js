"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const chat_controller_1 = require("../controllers/chat.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
// Apply authentication middleware to all routes
router.use(auth_middleware_1.authenticateToken);
// Get messages for a session
router.get('/sessions/:sessionId/messages', async (req, res) => {
    try {
        await chat_controller_1.ChatController.getSessionMessages(req, res);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Send a message to a session
router.post('/sessions/:sessionId/messages', async (req, res) => {
    try {
        await chat_controller_1.ChatController.sendMessage(req, res);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Get active participants in a session
router.get('/sessions/:sessionId/participants', async (req, res) => {
    try {
        await chat_controller_1.ChatController.getActiveParticipants(req, res);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.default = router;
