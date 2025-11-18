import { Router } from 'express';
import { StressManagementController } from '../controllers/stress-management.controller';
import { validateAssessment, validatePreferences } from '../middleware/validation.middleware';

const router = Router();

// Assessment routes
router.post('/:userId/assess', validateAssessment, StressManagementController.assessStressLevel);
router.get('/:userId/recommendations', StressManagementController.getRecommendations);
router.post('/:userId/recommendations', StressManagementController.getRecommendationsWithLevel);
router.post('/:userId/record-change', StressManagementController.recordStressChange);

// Analytics routes
router.get('/:userId/history', StressManagementController.getStressHistory);
router.get('/:userId/analytics', StressManagementController.getStressAnalytics);
router.get('/:userId/patterns', StressManagementController.getStressPatterns);
router.get('/:userId/peak-hours', StressManagementController.getPeakStressHours);

export default router; 