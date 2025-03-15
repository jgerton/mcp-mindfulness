import { Router } from 'express';
import meditationSessionController from '../controllers/meditation-session.controller';
import { authenticateJWT, isResourceOwnerOrAdmin } from '../middleware/auth.middleware';
import { MeditationSession } from '../models/meditation-session.model';

const router = Router();

// Helper function to get the user ID of a meditation session
const getMeditationSessionUserId = async (req) => {
  const { id } = req.params;
  const session = await MeditationSession.findById(id);
  return session ? session.userId.toString() : null;
};

// All routes require authentication
router.use(authenticateJWT);

// Session listing and creation
router.get('/meditation-sessions', meditationSessionController.getUserSessions);
router.post('/meditation-sessions', meditationSessionController.createSession);

// Session statistics
router.get('/meditation-sessions/stats', meditationSessionController.getSessionStats);

// Individual session operations
router.get('/meditation-sessions/:id', isResourceOwnerOrAdmin(getMeditationSessionUserId), meditationSessionController.getSessionById);
router.put('/meditation-sessions/:id', isResourceOwnerOrAdmin(getMeditationSessionUserId), meditationSessionController.updateSession);
router.delete('/meditation-sessions/:id', isResourceOwnerOrAdmin(getMeditationSessionUserId), meditationSessionController.deleteSession);
router.post('/meditation-sessions/:id/complete', isResourceOwnerOrAdmin(getMeditationSessionUserId), meditationSessionController.completeSession);

export default router; 