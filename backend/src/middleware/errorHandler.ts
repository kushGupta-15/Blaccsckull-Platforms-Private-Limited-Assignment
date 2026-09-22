import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/apiResponse';

export interface AppError extends Error {
  statusCode?: number;
  details?: string[];
}

export const createError = (
  message: string,
  statusCode = 500,
  details?: string[]
): AppError => {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.details = details;
  return error;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode ?? 500;
  const message =
    process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'Internal server error'
      : err.message;

  if (statusCode === 500) {
    console.error('Unhandled error:', err);
  }

  sendError(res, message, statusCode, err.details);
};

export const notFoundHandler = (_req: Request, res: Response): void => {
  sendError(res, 'Route not found', 404);
};
