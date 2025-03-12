import express, { Request, Response } from 'express';
import { AuthController } from '../controllers/auth.controller';

const router = express.Router();

// Authentication routes
router.post('/register', async (req: Request, res: Response) => {
  await AuthController.register(req, res);
});

router.post('/login', async (req: Request, res: Response) => {
  await AuthController.login(req, res);
});

router.post('/refresh-token', async (req: Request, res: Response) => {
  await AuthController.refreshToken(req, res);
});

export default router; 