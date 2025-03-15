import { Router } from 'express';
import { StressManagementController } from '../controllers/stress-management.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateAssessment, validatePreferences } from '../middleware/validation.middleware';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Assessment routes
router.post('/assessment', validateAssessment, StressManagementController.submitAssessment);
router.get('/assessment/history', StressManagementController.getStressHistory);
router.get('/assessment/latest', StressManagementController.getLatestAssessment);

// Preferences routes
router.put('/preferences', validatePreferences, StressManagementController.updatePreferences);
router.get('/preferences', StressManagementController.getPreferences);

// Insights route
router.get('/insights', StressManagementController.getStressInsights);

export default router; 