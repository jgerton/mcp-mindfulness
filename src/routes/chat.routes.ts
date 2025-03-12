import express from 'express';
import { ChatController } from '../controllers/chat.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get messages for a session
router.get('/sessions/:sessionId/messages', async (req, res) => {
  try {
    await ChatController.getSessionMessages(req, res);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

// Send a message to a session
router.post('/sessions/:sessionId/messages', async (req, res) => {
  try {
    await ChatController.sendMessage(req, res);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

// Get active participants in a session
router.get('/sessions/:sessionId/participants', async (req, res) => {
  try {
    await ChatController.getActiveParticipants(req, res);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

export default router; 