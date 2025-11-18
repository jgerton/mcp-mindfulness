import { Router } from 'express';
import exportRoutes from './export.routes';

const router = Router();
router.use('/export', exportRoutes);

export default router; 