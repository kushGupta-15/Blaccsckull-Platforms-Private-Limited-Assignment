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
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

// POST /api/v1/auth/register  — rate limited
router.post('/register', authLimiter, registerValidation, validate, register);

// POST /api/v1/auth/login  — rate limited
router.post('/login', authLimiter, loginValidation, validate, login);

// GET /api/v1/auth/me  (protected)
router.get('/me', protect, getMe);

export default router;
