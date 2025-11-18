"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const session_analytics_service_1 = require("../services/session-analytics.service");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
const analyticsService = new session_analytics_service_1.SessionAnalyticsService();
// Get user's session history
router.get('/history', auth_middleware_1.authenticateToken, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const userId = req.user._id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const history = await analyticsService.getUserSessionHistory(userId.toString(), { page, limit });
        res.json(history);
    }
    catch (error) {
        console.error('Error fetching session history:', error);
        res.status(500).json({ message: 'Failed to fetch session history' });
    }
});
// Get user's meditation stats for a time period
router.get('/stats', auth_middleware_1.authenticateToken, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const userId = req.user._id;
        const stats = await analyticsService.getUserStats(userId.toString());
        res.json(stats);
    }
    catch (error) {
        console.error('Error fetching meditation stats:', error);
        res.status(500).json({ message: 'Failed to fetch meditation stats' });
    }
});
// Get mood improvement stats
router.get('/mood-stats', auth_middleware_1.authenticateToken, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const userId = req.user._id;
        const startTime = req.query.startTime ? new Date(req.query.startTime) : new Date(0);
        const stats = await analyticsService.getMoodImprovementStats(userId.toString(), startTime);
        res.json(stats);
    }
    catch (error) {
        console.error('Error fetching mood improvement stats:', error);
        res.status(500).json({ message: 'Failed to fetch mood improvement stats' });
    }
});
exports.default = router;
