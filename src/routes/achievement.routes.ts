import express from 'express';
import { AchievementController } from '../controllers/achievement.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = express.Router();
const achievementController = new AchievementController();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get user's achievements
router.get('/', (req, res) => {
  achievementController.getUserAchievements(req, res)
    .catch((error: Error) => {
      res.status(500).json({ message: error.message });
    });
});

// Get achievement details
router.get('/:achievementId', (req, res) => {
  achievementController.getAchievementById(req, res)
    .catch((error: Error) => {
      res.status(500).json({ message: error.message });
    });
});

export default router; 