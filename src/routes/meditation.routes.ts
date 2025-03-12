import { Router } from 'express';
import { MeditationController } from '../controllers/meditation.controller';
import { validateRequest } from '../middleware/validateRequest';
import { createMeditationSchema, updateMeditationSchema, getMeditationsQuerySchema } from '../validations/meditation.validation';
import { authenticate } from '../middleware/authenticate';

const router = Router();
const meditationController = new MeditationController();

// Public routes
router.get('/', validateRequest({ query: getMeditationsQuerySchema }), meditationController.getAll);
router.get('/:id', meditationController.getById);

// Protected routes (require authentication)
router.post('/', authenticate, validateRequest({ body: createMeditationSchema }), meditationController.create);
router.put('/:id', authenticate, validateRequest({ body: updateMeditationSchema }), meditationController.update);
router.delete('/:id', authenticate, meditationController.delete);

export default router; 