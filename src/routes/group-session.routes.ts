import express from 'express';
import { GroupSessionController } from '../controllers/group-session.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Create a new group session
router.post('/', async (req, res) => {
  try {
    await GroupSessionController.createSession(req, res);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

// Get all upcoming sessions
router.get('/', async (req, res) => {
  try {
    await GroupSessionController.getUpcomingSessions(req, res);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

// Get user's sessions
router.get('/user', async (req, res) => {
  try {
    await GroupSessionController.getUserSessions(req, res);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

// Join a session
router.post('/:sessionId/join', async (req, res) => {
  try {
    await GroupSessionController.joinSession(req, res);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

// Leave a session
router.post('/:sessionId/leave', async (req, res) => {
  try {
    await GroupSessionController.leaveSession(req, res);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

// Start a session
router.post('/:sessionId/start', async (req, res) => {
  try {
    await GroupSessionController.startSession(req, res);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

// Complete a session
router.post('/:sessionId/complete', async (req, res) => {
  try {
    await GroupSessionController.completeSession(req, res);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

// Cancel a session
router.post('/:sessionId/cancel', async (req, res) => {
  try {
    await GroupSessionController.cancelSession(req, res);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

export default router; 