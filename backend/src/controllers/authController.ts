import { Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { sendSuccess } from '../utils/apiResponse';
import * as authService from '../services/authService';

// ── Validation Rules ──────────────────────────────────────────────────────────
export const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2–50 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number'),
];

export const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required'),
];

// ── Controllers ───────────────────────────────────────────────────────────────

/**
 * POST /api/v1/auth/register
 * Public — create a new account and return a JWT
 */
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password } = req.body as {
      name: string;
      email: string;
      password: string;
    };

    const result = await authService.registerUser(name, email, password);
    sendSuccess(res, result, 201, 'Account created successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/auth/login
 * Public — authenticate and return a JWT
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body as {
      email: string;
      password: string;
    };

    const result = await authService.loginUser(email, password);
    sendSuccess(res, result, 200, 'Login successful');
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/auth/me
 * Protected — return the currently authenticated user's profile
 */
export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // req.user is attached by the `protect` middleware
    const user = await authService.getCurrentUser(req.user!.userId);
    sendSuccess(res, user);
  } catch (err) {
    next(err);
  }
};
