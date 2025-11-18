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
const express_1 = __importDefault(require("express"));
const chat_controller_1 = require("../controllers/chat.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
// Apply authentication middleware to all routes
router.use(auth_middleware_1.authenticateToken);
// Get messages for a session
router.get('/sessions/:sessionId/messages', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield chat_controller_1.ChatController.getSessionMessages(req, res);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
// Send a message to a session
router.post('/sessions/:sessionId/messages', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield chat_controller_1.ChatController.sendMessage(req, res);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
// Get active participants in a session
router.get('/sessions/:sessionId/participants', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield chat_controller_1.ChatController.getActiveParticipants(req, res);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
exports.default = router;
