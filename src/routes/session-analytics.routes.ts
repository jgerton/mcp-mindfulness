import express from 'express';
import { SessionAnalyticsService } from '../services/session-analytics.service';
import { authenticateToken } from '../middleware/auth.middleware';

const router = express.Router();
const analyticsService = new SessionAnalyticsService();

// Get user's session history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const userId = req.user._id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const history = await analyticsService.getUserSessionHistory(userId.toString(), { page, limit });
    res.json(history);
  } catch (error) {
    console.error('Error fetching session history:', error);
    res.status(500).json({ message: 'Failed to fetch session history' });
  }
});

// Get user's meditation stats for a time period
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const userId = req.user._id;
    const stats = await analyticsService.getUserStats(userId.toString());
    res.json(stats);
  } catch (error) {
    console.error('Error fetching meditation stats:', error);
    res.status(500).json({ message: 'Failed to fetch meditation stats' });
  }
});

// Get mood improvement stats
router.get('/mood-stats', authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const userId = req.user._id;
    const startTime = req.query.startTime ? new Date(req.query.startTime as string) : new Date(0);
    const stats = await analyticsService.getMoodImprovementStats(userId.toString(), startTime);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching mood improvement stats:', error);
    res.status(500).json({ message: 'Failed to fetch mood improvement stats' });
  }
});

export default router; 