import { Request, Response, NextFunction } from 'express';
import { body, param, query } from 'express-validator';
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

export const createCompetitionValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 3, max: 120 }).withMessage('Title must be between 3 and 120 characters'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
  body('category')
    .trim()
    .notEmpty().withMessage('Category is required'),
  body('startDate')
    .notEmpty().withMessage('Start date is required')
    .isISO8601().withMessage('Start date must be a valid ISO 8601 date'),
  body('endDate')
    .notEmpty().withMessage('End date is required')
    .isISO8601().withMessage('End date must be a valid ISO 8601 date'),
  body('totalSpots')
    .notEmpty().withMessage('Total spots is required')
    .isInt({ min: 1 }).withMessage('Must have at least 1 spot')
    .toInt(),
  body('entryFee')
    .optional()
    .isFloat({ min: 0 }).withMessage('Entry fee cannot be negative')
    .toFloat(),
  body('prizePool')
    .optional()
    .trim(),
  body('rules')
    .optional()
    .isArray().withMessage('Rules must be an array of strings'),
  body('bannerImage')
    .optional()
    .trim(),
];

export const updateCompetitionValidation = [
  param('id')
    .isMongoId().withMessage('Invalid competition ID format'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 120 }).withMessage('Title must be between 3 and 120 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
  body('category')
    .optional()
    .trim(),
  body('startDate')
    .optional()
    .isISO8601().withMessage('Start date must be a valid ISO 8601 date'),
  body('endDate')
    .optional()
    .isISO8601().withMessage('End date must be a valid ISO 8601 date'),
  body('totalSpots')
    .optional()
    .isInt({ min: 1 }).withMessage('Must have at least 1 spot')
    .toInt(),
  body('entryFee')
    .optional()
    .isFloat({ min: 0 }).withMessage('Entry fee cannot be negative')
    .toFloat(),
  body('prizePool')
    .optional()
    .trim(),
  body('rules')
    .optional()
    .isArray().withMessage('Rules must be an array of strings'),
  body('bannerImage')
    .optional()
    .trim(),
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

/**
 * POST /api/v1/competitions
 * Protected — create a new competition (T9.1)
 */
export const createCompetition = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await competitionService.createCompetition({
      ...req.body,
      hostId: req.user!.userId,
    });
    sendSuccess(res, result, 201, 'Competition created successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/v1/competitions/:id
 * Protected — update a competition (T9.2)
 */
export const updateCompetition = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await competitionService.updateCompetition(
      req.params.id,
      req.user!.userId,
      req.body
    );
    sendSuccess(res, result, 200, 'Competition updated successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/competitions/hosted/me
 * Protected — list competitions hosted by the current user (T9.3)
 */
export const listHostedCompetitions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await competitionService.listHostedCompetitions(
      req.user!.userId
    );
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/competitions/:id/admin-stats
 * Protected — get host admin metrics for a competition (T9.3)
 */
export const getCompetitionAdminStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await competitionService.getCompetitionAdminStats(
      req.params.id,
      req.user!.userId
    );
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};
