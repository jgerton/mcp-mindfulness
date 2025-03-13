import express from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get user profile
router.get('/profile', (req, res) => {
  UserController.getProfile(req, res)
    .catch((error: Error) => {
      res.status(500).json({ message: error.message });
    });
});

// Update user profile
router.put('/profile', (req, res) => {
  UserController.updateProfile(req, res)
    .catch((error: Error) => {
      res.status(500).json({ message: error.message });
    });
});

// Get user stats
router.get('/stats', (req, res) => {
  UserController.getStats(req, res)
    .catch((error: Error) => {
      res.status(500).json({ message: error.message });
    });
});

export default router; 