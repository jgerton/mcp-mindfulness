import { Router } from 'express';
import { PMRController } from '../controllers/pmr.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { z } from 'zod';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Validation schemas
const startSessionSchema = {
  body: z.object({
    stressLevelBefore: z.number().min(0).max(10).optional()
  })
};

const completeSessionSchema = {
  body: z.object({
    completedGroups: z.array(z.string()),
    stressLevelAfter: z.number().min(0).max(10).optional()
  })
};

const updateProgressSchema = {
  body: z.object({
    completedGroup: z.string()
  })
};

// Routes
router.get('/muscle-groups', PMRController.getMuscleGroups);
router.post('/session', validateRequest(startSessionSchema), PMRController.startSession);
router.put('/session/:sessionId/complete', validateRequest(completeSessionSchema), PMRController.completeSession);
router.put('/session/:sessionId/progress', validateRequest(updateProgressSchema), PMRController.updateProgress);
router.get('/sessions', PMRController.getUserSessions);
router.get('/effectiveness', PMRController.getEffectiveness);

export default router; 