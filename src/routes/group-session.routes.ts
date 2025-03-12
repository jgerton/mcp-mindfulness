import express from 'express';
import { GroupSessionController } from '../controllers/group-session.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Session management
router.post('/', GroupSessionController.createSession);
router.get('/upcoming', GroupSessionController.getUpcomingSessions);
router.get('/my-sessions', GroupSessionController.getUserSessions);

// Session participation
router.post('/:sessionId/join', GroupSessionController.joinSession);
router.post('/:sessionId/start', GroupSessionController.startSession);
router.post('/:sessionId/complete', GroupSessionController.completeSession);
router.post('/:sessionId/leave', GroupSessionController.leaveSession);
router.post('/:sessionId/cancel', GroupSessionController.cancelSession);

export default router; 