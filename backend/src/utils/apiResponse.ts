import { Response } from 'express';

interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

interface ErrorResponse {
  success: false;
  error: string;
  details?: string[];
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  statusCode = 200,
  message?: string
): Response => {
  const body: SuccessResponse<T> = { success: true, data };
  if (message) body.message = message;
  return res.status(statusCode).json(body);
};

export const sendError = (
  res: Response,
  error: string,
  statusCode = 500,
  details?: string[]
): Response => {
  const body: ErrorResponse = { success: false, error };
  if (details?.length) body.details = details;
  return res.status(statusCode).json(body);
};
