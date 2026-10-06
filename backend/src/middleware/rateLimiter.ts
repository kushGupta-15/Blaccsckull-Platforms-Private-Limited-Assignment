import rateLimit from 'express-rate-limit';

/**
 * Auth endpoints — limit brute-force login/register attempts.
 * 10 requests per IP per 15 minutes.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many attempts. Please wait 15 minutes and try again.',
  },
  skipSuccessfulRequests: false,
});

/**
 * Registration endpoint — stricter limit to prevent spam registrations.
 * 5 registration attempts per IP per 15 minutes.
 */
export const registrationActionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many registration attempts. Please wait 15 minutes and try again.',
  },
});

/**
 * General API limiter — protects all public endpoints.
 * 100 requests per IP per minute.
 */
export const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests. Please slow down.',
  },
});
