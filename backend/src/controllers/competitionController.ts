import { Request, Response, NextFunction } from 'express';
import { param, query } from 'express-validator';
import { sendSuccess } from '../utils/apiResponse';
import * as competitionService from '../services/competitionService';
import { DEFAULT_PAGE_SIZE } from '../utils/constants';

// ── Validation Rules ──────────────────────────────────────────────────────────
export const competitionIdValidation = [
  param('id')
    .notEmpty().withMessage('Competition ID is required')
    .isMongoId().withMessage('Invalid competition ID format'),
];

export const listQueryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
    .toInt(),
  query('status')
    .optional()
    .isIn(['upcoming', 'active', 'full', 'ended', 'cancelled'])
    .withMessage('Invalid status filter'),
  query('search')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 }).withMessage('Search query too long'),
];

// ── Controllers ───────────────────────────────────────────────────────────────

/**
 * GET /api/v1/competitions
 * Public — paginated list of competitions, optional status/search filter
 */
export const listCompetitions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = (req.query.page as unknown as number) ?? 1;
    const limit = (req.query.limit as unknown as number) ?? DEFAULT_PAGE_SIZE;
    const status = req.query.status as string | undefined;
    const search = req.query.search as string | undefined;

    const result = await competitionService.listCompetitions(page, limit, status, search);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/competitions/:id
 * Public (optionally authenticated) — single competition detail
 * If a valid JWT is present, injects `userRegistrationStatus`
 */
export const getCompetition = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await competitionService.getCompetition(
      req.params.id,
      req.user?.userId
    );
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/competitions/:id/register
 * Protected — register the current user for a competition
 */
export const registerForCompetition = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await competitionService.registerForCompetition(
      req.params.id,
      req.user!.userId
    );
    sendSuccess(res, result, 201, result.message);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/v1/competitions/:id/register
 * Protected — withdraw from a competition
 */
export const withdrawFromCompetition = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await competitionService.withdrawFromCompetition(
      req.params.id,
      req.user!.userId
    );
    sendSuccess(res, result, 200, result.message);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/competitions/:id/participants
 * Public — paginated participant list for a competition
 */
export const getParticipants = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || DEFAULT_PAGE_SIZE;

    const result = await competitionService.getParticipants(
      req.params.id,
      page,
      limit
    );
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};
