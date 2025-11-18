"use strict";
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
router.post('/', async (req, res) => {
    try {
        await group_session_controller_1.GroupSessionController.createSession(req, res);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Get all upcoming sessions
router.get('/', async (req, res) => {
    try {
        await group_session_controller_1.GroupSessionController.getUpcomingSessions(req, res);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Get user's sessions
router.get('/user', async (req, res) => {
    try {
        await group_session_controller_1.GroupSessionController.getUserSessions(req, res);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Join a session
router.post('/:sessionId/join', async (req, res) => {
    try {
        await group_session_controller_1.GroupSessionController.joinSession(req, res);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Leave a session
router.post('/:sessionId/leave', async (req, res) => {
    try {
        await group_session_controller_1.GroupSessionController.leaveSession(req, res);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Start a session
router.post('/:sessionId/start', async (req, res) => {
    try {
        await group_session_controller_1.GroupSessionController.startSession(req, res);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Complete a session
router.post('/:sessionId/complete', async (req, res) => {
    try {
        await group_session_controller_1.GroupSessionController.completeSession(req, res);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Cancel a session
router.post('/:sessionId/cancel', async (req, res) => {
    try {
        await group_session_controller_1.GroupSessionController.cancelSession(req, res);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.default = router;
