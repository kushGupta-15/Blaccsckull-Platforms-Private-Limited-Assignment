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

const router = Router();

// GET  /api/v1/competitions           — public list (optional auth for status)
router.get('/', listQueryValidation, validate, optionalAuth, listCompetitions);

// GET  /api/v1/competitions/:id       — public detail (optional auth injects user status)
router.get('/:id', competitionIdValidation, validate, optionalAuth, getCompetition);

// POST /api/v1/competitions/:id/register   — protected
router.post('/:id/register', competitionIdValidation, validate, protect, registerForCompetition);

// DELETE /api/v1/competitions/:id/register — protected
router.delete('/:id/register', competitionIdValidation, validate, protect, withdrawFromCompetition);

// GET  /api/v1/competitions/:id/participants — public
router.get('/:id/participants', competitionIdValidation, validate, getParticipants);

export default router;
