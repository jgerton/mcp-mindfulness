import { Router } from 'express';
import { validateRequest } from '../middleware/validation.middleware';
import { MeditationSessionController } from '../controllers/meditation-session.controller';
import {
  createMeditationSessionSchema,
  getMeditationSessionsSchema,
  updateMeditationSessionSchema,
  completeMeditationSessionSchema,
  CreateMeditationSessionInput,
  UpdateMeditationSessionInput,
  CompleteMeditationSessionInput,
  GetMeditationSessionsQuery
} from '../validations/meditation-session.validation';
import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();
const meditationSessionController = new MeditationSessionController();

router.post(
  '/',
  authenticateToken,
  validateRequest({ body: createMeditationSessionSchema }),
  (req, res) => meditationSessionController.createSession(req, res)
);

router.get(
  '/',
  authenticateToken,
  validateRequest({ query: getMeditationSessionsSchema }),
  (req, res) => meditationSessionController.getUserSessions(req as any, res)
);

router.get(
  '/:id',
  authenticateToken,
  validateRequest({ params: z.object({ id: z.string() }) }),
  (req, res) => meditationSessionController.getSessionById(req as any, res)
);

router.patch(
  '/:id',
  authenticateToken,
  validateRequest({
    params: z.object({ id: z.string() }),
    body: updateMeditationSessionSchema
  }),
  (req, res) => meditationSessionController.updateSession(req as any, res)
);

router.get('/stats', authenticateToken, (req, res) => meditationSessionController.getUserStats(req, res));

router.post('/start', authenticateToken, (req, res) => meditationSessionController.createSession(req, res));

router.post(
  '/:sessionId/complete',
  authenticateToken,
  validateRequest({
    params: z.object({ sessionId: z.string() }),
    body: completeMeditationSessionSchema
  }),
  (req, res) => meditationSessionController.completeSession(req as any, res)
);

// This route needs to be implemented in the controller or removed
// router.get('/active', authenticateToken, (req, res) => meditationSessionController.getActiveSession(req, res));

export default router;