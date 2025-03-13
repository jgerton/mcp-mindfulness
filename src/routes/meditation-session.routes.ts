import express from 'express';
import { MeditationSessionController } from '../controllers/meditation-session.controller';
import { authenticate } from '../middleware/authenticate';
import { validateRequest } from '../middleware/validateRequest';
import { 
  createMeditationSessionSchema,
  updateMeditationSessionSchema,
  getMeditationSessionsQuerySchema
} from '../validations/meditation-session.validation';

const router = express.Router();
const meditationSessionController = new MeditationSessionController();

// All routes require authentication
router.use(authenticate);

// Create a new meditation session
router.post(
  '/',
  validateRequest({ body: createMeditationSessionSchema }),
  meditationSessionController.create.bind(meditationSessionController)
);

// Get all meditation sessions for the current user
router.get(
  '/',
  validateRequest({ query: getMeditationSessionsQuerySchema }),
  meditationSessionController.getAll.bind(meditationSessionController)
);

// Get a single meditation session
router.get(
  '/:id',
  meditationSessionController.getById.bind(meditationSessionController)
);

// Update a meditation session
router.put(
  '/:id',
  validateRequest({ body: updateMeditationSessionSchema }),
  meditationSessionController.update.bind(meditationSessionController)
);

// Get meditation statistics
router.get(
  '/stats/summary',
  meditationSessionController.getStats.bind(meditationSessionController)
);

export default router; 