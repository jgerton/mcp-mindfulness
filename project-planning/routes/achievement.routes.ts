import { Router } from 'express';
import achievementController from '../controllers/achievement.controller';
import { authenticateJWT, isAdmin } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/achievements', achievementController.getAllAchievements);
router.get('/achievements/:id', achievementController.getAchievementById);

// Protected routes - require authentication
router.get('/user/achievements', authenticateJWT, achievementController.getUserAchievements);
router.get('/user/achievements/completed', authenticateJWT, achievementController.getCompletedAchievements);
router.get('/user/achievements/points', authenticateJWT, achievementController.getUserPoints);
router.post('/user/activity', authenticateJWT, achievementController.processUserActivity);

// Admin routes - require admin role
router.post('/achievements', authenticateJWT, isAdmin, achievementController.createAchievement);
router.put('/achievements/:id', authenticateJWT, isAdmin, achievementController.updateAchievement);
router.delete('/achievements/:id', authenticateJWT, isAdmin, achievementController.deleteAchievement);

export default router; 