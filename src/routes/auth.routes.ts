import { Router } from 'express';
import { register, login } from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validateRequest';
import { loginSchema, registerSchema } from '../validations/auth.validation';

const router = Router();

// Auth routes
router.post('/register', validateRequest({ body: registerSchema }), register);
router.post('/login', validateRequest({ body: loginSchema }), login);

export default router; 