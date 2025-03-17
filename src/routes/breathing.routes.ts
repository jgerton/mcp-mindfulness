import { Router } from 'express';
import { BreathingController } from '../controllers/breathing.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { z } from 'zod';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Validation schemas
const startSessionSchema = {
  body: z.object({
    patternName: z.string(),
    stressLevelBefore: z.number().min(0).max(10).optional()
  })
};

const completeSessionSchema = {
  body: z.object({
    completedCycles: z.number().min(0),
    stressLevelAfter: z.number().min(0).max(10).optional()
  })
};

// Routes
router.get('/patterns/:name', BreathingController.getPatterns);
router.post('/session', validateRequest(startSessionSchema), BreathingController.startSession);
router.put('/session/:sessionId/complete', validateRequest(completeSessionSchema), BreathingController.completeSession);
router.get('/sessions', BreathingController.getUserSessions);
router.get('/effectiveness', BreathingController.getEffectiveness);

export default router; 