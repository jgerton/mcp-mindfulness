import express from 'express';
import { AchievementController } from '../controllers/achievement.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get user's achievements
router.get('/', (req, res) => {
  AchievementController.getUserAchievements(req, res)
    .catch((error: Error) => {
      res.status(500).json({ message: error.message });
    });
});

// Get achievement details
router.get('/:achievementId', (req, res) => {
  AchievementController.getAchievementDetails(req, res)
    .catch((error: Error) => {
      res.status(500).json({ message: error.message });
    });
});

export default router; 