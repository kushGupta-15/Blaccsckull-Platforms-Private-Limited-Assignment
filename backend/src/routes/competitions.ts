import { Router } from 'express';
import {
  listCompetitions,
  getCompetition,
  createCompetition,
  updateCompetition,
  listHostedCompetitions,
  getCompetitionAdminStats,
  registerForCompetition,
  withdrawFromCompetition,
  getParticipants,
  competitionIdValidation,
  listQueryValidation,
  createCompetitionValidation,
  updateCompetitionValidation,
} from '../controllers/competitionController';
import { validate } from '../middleware/validate';
import { protect, optionalAuth } from '../middleware/authMiddleware';
import { registrationActionLimiter } from '../middleware/rateLimiter';

const router = Router();

// GET  /api/v1/competitions
router.get('/', listQueryValidation, validate, optionalAuth, listCompetitions);

// POST /api/v1/competitions — Create new competition (T9.1)
router.post('/', protect, createCompetitionValidation, validate, createCompetition);

// GET  /api/v1/competitions/hosted/me — List competitions hosted by current user (T9.3)
router.get('/hosted/me', protect, listHostedCompetitions);

// GET  /api/v1/competitions/:id/admin-stats — Get host admin metrics (T9.3)
router.get('/:id/admin-stats', protect, competitionIdValidation, validate, getCompetitionAdminStats);

// PUT  /api/v1/competitions/:id — Update competition (T9.2)
router.put('/:id', protect, updateCompetitionValidation, validate, updateCompetition);

// GET  /api/v1/competitions/:id
router.get('/:id', competitionIdValidation, validate, optionalAuth, getCompetition);

// POST /api/v1/competitions/:id/register — rate limited to prevent spam
router.post('/:id/register', registrationActionLimiter, competitionIdValidation, validate, protect, registerForCompetition);

// DELETE /api/v1/competitions/:id/register
router.delete('/:id/register', competitionIdValidation, validate, protect, withdrawFromCompetition);

// GET  /api/v1/competitions/:id/participants
router.get('/:id/participants', competitionIdValidation, validate, getParticipants);

export default router;
