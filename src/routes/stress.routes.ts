import { Router } from 'express';
import { StressController } from '../controllers/stress.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateStressTracking } from '../middleware/validation.middleware';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Stress tracking routes
router.post('/track', validateStressTracking, StressController.trackDailyStress);
router.get('/history', StressController.getStressTrackingHistory);
router.get('/trends', StressController.getStressTrends);
router.get('/statistics', StressController.getStressStatistics);

export default router; 