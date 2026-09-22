import { Router } from 'express';
import {
  register,
  login,
  getMe,
  registerValidation,
  loginValidation,
} from '../controllers/authController';
import { validate } from '../middleware/validate';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// POST /api/v1/auth/register
router.post('/register', registerValidation, validate, register);

// POST /api/v1/auth/login
router.post('/login', loginValidation, validate, login);

// GET /api/v1/auth/me  (protected)
router.get('/me', protect, getMe);

export default router;
