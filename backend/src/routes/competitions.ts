import { Router } from 'express';
import {
  listCompetitions,
  getCompetition,
  registerForCompetition,
  withdrawFromCompetition,
  getParticipants,
  competitionIdValidation,
  listQueryValidation,
} from '../controllers/competitionController';
import { validate } from '../middleware/validate';
import { protect, optionalAuth } from '../middleware/authMiddleware';
import { registrationActionLimiter } from '../middleware/rateLimiter';

const router = Router();

// GET  /api/v1/competitions
router.get('/', listQueryValidation, validate, optionalAuth, listCompetitions);

// GET  /api/v1/competitions/:id
router.get('/:id', competitionIdValidation, validate, optionalAuth, getCompetition);

// POST /api/v1/competitions/:id/register — rate limited to prevent spam
router.post('/:id/register', registrationActionLimiter, competitionIdValidation, validate, protect, registerForCompetition);

// DELETE /api/v1/competitions/:id/register
router.delete('/:id/register', competitionIdValidation, validate, protect, withdrawFromCompetition);

// GET  /api/v1/competitions/:id/participants
router.get('/:id/participants', competitionIdValidation, validate, getParticipants);

export default router;
