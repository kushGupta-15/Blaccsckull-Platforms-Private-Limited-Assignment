import { Router } from 'express';
import { getMyRegistrations } from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';
import { query } from 'express-validator';
import { validate } from '../middleware/validate';

const router = Router();

// GET /api/v1/users/me/registrations — protected
router.get(
  '/me/registrations',
  protect,
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  ],
  validate,
  getMyRegistrations
);

export default router;
