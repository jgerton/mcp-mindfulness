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
  (req, res) => meditationSessionController.startSession(req, res)
);

router.get(
  '/',
  authenticateToken,
  validateRequest({ query: getMeditationSessionsSchema }),
  (req, res) => meditationSessionController.getAll(req as any, res)
);

router.get(
  '/:id',
  authenticateToken,
  validateRequest({ params: z.object({ id: z.string() }) }),
  (req, res) => meditationSessionController.getById(req as any, res)
);

router.patch(
  '/:id',
  authenticateToken,
  validateRequest({
    params: z.object({ id: z.string() }),
    body: updateMeditationSessionSchema
  }),
  (req, res) => meditationSessionController.update(req as any, res)
);

router.get('/stats', authenticateToken, (req, res) => meditationSessionController.getStats(req, res));

router.post('/start', authenticateToken, (req, res) => meditationSessionController.startSession(req, res));

router.post(
  '/:sessionId/complete',
  authenticateToken,
  validateRequest({
    params: z.object({ sessionId: z.string() }),
    body: completeMeditationSessionSchema
  }),
  (req, res) => meditationSessionController.completeSession(req as any, res)
);

router.get('/active', authenticateToken, (req, res) => meditationSessionController.getActiveSession(req, res));

export default router;