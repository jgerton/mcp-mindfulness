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
const group_session_controller_1 = require("../controllers/group-session.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
// Apply authentication middleware to all routes
router.use(auth_middleware_1.authenticateToken);
// Create a new group session
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield group_session_controller_1.GroupSessionController.createSession(req, res);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
// Get all upcoming sessions
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield group_session_controller_1.GroupSessionController.getUpcomingSessions(req, res);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
// Get user's sessions
router.get('/user', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield group_session_controller_1.GroupSessionController.getUserSessions(req, res);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
// Join a session
router.post('/:sessionId/join', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield group_session_controller_1.GroupSessionController.joinSession(req, res);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
// Leave a session
router.post('/:sessionId/leave', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield group_session_controller_1.GroupSessionController.leaveSession(req, res);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
// Start a session
router.post('/:sessionId/start', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield group_session_controller_1.GroupSessionController.startSession(req, res);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
// Complete a session
router.post('/:sessionId/complete', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield group_session_controller_1.GroupSessionController.completeSession(req, res);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
// Cancel a session
router.post('/:sessionId/cancel', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield group_session_controller_1.GroupSessionController.cancelSession(req, res);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}));
exports.default = router;
