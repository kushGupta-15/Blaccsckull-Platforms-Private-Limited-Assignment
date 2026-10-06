import { Request, Response, NextFunction } from 'express';
import { body, param } from 'express-validator';
import * as submissionService from '../services/submissionService';
import { sendSuccess } from '../utils/apiResponse';

// ── Validation Rules ──────────────────────────────────────────────────────────

export const submitProjectValidation = [
  param('id').isMongoId().withMessage('Invalid competition ID'),
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Project title is required')
    .isLength({ min: 3, max: 120 })
    .withMessage('Project title must be between 3 and 120 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10, max: 3000 })
    .withMessage('Description must be between 10 and 3000 characters'),
  body('repositoryUrl')
    .trim()
    .notEmpty()
    .withMessage('Repository URL is required')
    .isURL()
    .withMessage('Please provide a valid repository URL (e.g. GitHub link)'),
  body('demoUrl')
    .optional({ checkFalsy: true })
    .trim()
    .isURL()
    .withMessage('Demo URL must be a valid URL'),
  body('mediaUrl')
    .optional({ checkFalsy: true })
    .trim()
    .isURL()
    .withMessage('Media preview URL must be a valid URL'),
];

export const submissionIdValidation = [
  param('id').isMongoId().withMessage('Invalid submission ID'),
];

export const evaluateSubmissionValidation = [
  param('id').isMongoId().withMessage('Invalid submission ID'),
  body('score')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Score must be a number between 0 and 100'),
  body('feedback')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Feedback cannot exceed 2000 characters'),
  body('awardRank')
    .optional()
    .isIn([1, 2, 3])
    .withMessage('Award rank must be 1, 2, or 3'),
  body('isWinner')
    .optional()
    .isBoolean()
    .withMessage('isWinner must be a boolean'),
];

export const finalizeWinnersValidation = [
  param('id').isMongoId().withMessage('Invalid competition ID'),
  body('winners')
    .isArray({ min: 1, max: 3 })
    .withMessage('Winners must be an array of 1 to 3 items'),
  body('winners.*.submissionId')
    .isMongoId()
    .withMessage('Each winner must include a valid submission ID'),
  body('winners.*.rank')
    .isIn([1, 2, 3])
    .withMessage('Each winner rank must be 1, 2, or 3'),
];

// ── Handlers ──────────────────────────────────────────────────────────────────

// POST /api/v1/competitions/:id/submissions (T10.2)
export const submitProject = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const competitionId = req.params['id'] as string;
    const userId = req.user!.userId;
    const { title, description, repositoryUrl, demoUrl, mediaUrl } = req.body;

    const submission = await submissionService.createOrUpdateSubmission(
      competitionId,
      userId,
      {
        title,
        description,
        repositoryUrl,
        demoUrl,
        mediaUrl,
      }
    );

    sendSuccess(res, submission, 201);
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/competitions/:id/submissions (T10.3)
export const listSubmissions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const competitionId = req.params['id'] as string;
    const currentUserId = req.user?.userId;

    const result = await submissionService.getCompetitionSubmissions(
      competitionId,
      currentUserId
    );

    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/competitions/:id/submissions/mine (T10.3)
export const getMySubmission = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const competitionId = req.params['id'] as string;
    const userId = req.user!.userId;

    const submission = await submissionService.getMySubmission(
      competitionId,
      userId
    );

    sendSuccess(res, submission);
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/submissions/:id/upvote (T10.4)
export const toggleUpvote = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const submissionId = req.params['id'] as string;
    const userId = req.user!.userId;

    const result = await submissionService.toggleUpvoteSubmission(
      submissionId,
      userId
    );

    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};

// PUT /api/v1/submissions/:id/evaluate (T10.5)
export const evaluateSubmission = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const submissionId = req.params['id'] as string;
    const hostId = req.user!.userId;
    const { score, feedback, awardRank, isWinner } = req.body;

    const submission = await submissionService.evaluateSubmission(
      submissionId,
      hostId,
      { score, feedback, awardRank, isWinner }
    );

    sendSuccess(res, submission);
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/competitions/:id/finalize-winners (T10.5 & T11.1)
export const finalizeWinners = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const competitionId = req.params['id'] as string;
    const hostId = req.user!.userId;
    const { winners } = req.body;

    const results = await submissionService.finalizeWinners(
      competitionId,
      hostId,
      winners
    );

    sendSuccess(res, results);
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/competitions/:id/winners (T11.1)
export const getWinners = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const competitionId = req.params['id'] as string;
    const winners = await submissionService.getCompetitionWinners(competitionId);
    sendSuccess(res, winners);
  } catch (err) {
    next(err);
  }
};
