import express, { Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { MeditationController } from '../controllers/meditation.controller';

const router = express.Router();

// Get all meditations
router.get('/', (req: Request, res: Response) => {
  MeditationController.getAllMeditations(req, res);
});

// Get meditation by ID
router.get('/:id', (req: Request<{ id: string }>, res: Response) => {
  MeditationController.getMeditationById(req, res);
});

// Create new meditation
router.post('/', authenticateToken, (req: Request, res: Response) => {
  MeditationController.createMeditation(req, res);
});

// Update meditation
router.put('/:id', authenticateToken, (req: Request<{ id: string }>, res: Response) => {
  MeditationController.updateMeditation(req, res);
});

// Delete meditation
router.delete('/:id', authenticateToken, (req: Request<{ id: string }>, res: Response) => {
  MeditationController.deleteMeditation(req, res);
});

// Start meditation session
router.post('/:id/start', authenticateToken, (req: Request<{ id: string }>, res: Response) => {
  MeditationController.startSession(req, res);
});

// Complete meditation session
router.post('/:id/complete', authenticateToken, (req: Request<{ id: string }>, res: Response) => {
  MeditationController.completeSession(req, res);
});

// Get active session
router.get('/session/active', authenticateToken, (req: Request, res: Response) => {
  MeditationController.getActiveSession(req, res);
});

// Record interruption
router.post('/session/:id/interrupt', authenticateToken, (req: Request<{ id: string }>, res: Response) => {
  MeditationController.recordInterruption(req, res);
});

export default router; 