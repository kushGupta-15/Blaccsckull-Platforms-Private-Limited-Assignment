import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { sendError } from '../utils/apiResponse';

/**
 * Runs after express-validator chains.
 * Collects all validation errors and returns a 400 with details.
 */
export const validate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const details = errors.array().map((e) => e.msg as string);
    sendError(res, 'Validation failed', 400, details);
    return;
  }

  next();
};
