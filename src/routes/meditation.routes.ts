import express, { Request, Response } from 'express';
import { MeditationController } from '../controllers/meditation.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = express.Router();

// Get all meditations
// No authentication required for viewing meditations
router.get('/', (req: Request, res: Response): void => {
  MeditationController.getAllMeditations(req, res)
    .catch((error: Error) => {
      if (!res.headersSent) {
        res.status(500).json({ message: error.message });
      }
    });
});

// Get meditation by ID
// No authentication required for viewing a meditation
router.get('/:id', (req: Request<{ id: string }>, res: Response): void => {
  MeditationController.getMeditationById(req, res)
    .catch((error: Error) => {
      if (!res.headersSent) {
        res.status(500).json({ message: error.message });
      }
    });
});

// Start a meditation session
router.post('/:id/start', authenticateToken, (req: Request<{ id: string }>, res: Response): void => {
  MeditationController.startMeditation(req, res)
    .catch((error: Error) => {
      if (!res.headersSent) {
        res.status(500).json({ message: error.message });
      }
    });
});

// Complete a meditation session
router.post('/:id/complete', authenticateToken, (req: Request<{ id: string }>, res: Response): void => {
  MeditationController.completeMeditation(req, res)
    .catch((error: Error) => {
      if (!res.headersSent) {
        res.status(500).json({ message: error.message });
      }
    });
});

export default router; 