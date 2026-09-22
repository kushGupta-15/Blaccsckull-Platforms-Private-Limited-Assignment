import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User, { IUserDocument } from '../models/User';
import { createError } from '../middleware/errorHandler';
import { JwtPayload } from '../middleware/authMiddleware';

const BCRYPT_SALT_ROUNDS = 12;

// ── Helpers ───────────────────────────────────────────────────────────────────
const signToken = (user: IUserDocument): string => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN ?? '7d';

  if (!secret) throw createError('JWT_SECRET not configured', 500);

  const payload: JwtPayload = {
    userId: user._id.toString(),
    email: user.email,
  };

  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
};

// ── Register ──────────────────────────────────────────────────────────────────
export const registerUser = async (
  name: string,
  email: string,
  password: string
): Promise<{ token: string; user: object }> => {
  // Check for existing account
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw createError('An account with this email already exists', 409);
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

  // Create user
  const user = await User.create({ name, email, passwordHash });

  const token = signToken(user);

  return { token, user: user.toJSON() };
};

// ── Login ─────────────────────────────────────────────────────────────────────
export const loginUser = async (
  email: string,
  password: string
): Promise<{ token: string; user: object }> => {
  // Explicitly select passwordHash (excluded by default via select: false)
  const user = await User.findOne({ email: email.toLowerCase() }).select(
    '+passwordHash'
  );

  if (!user) {
    // Use generic message to avoid user enumeration
    throw createError('Invalid email or password', 401);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw createError('Invalid email or password', 401);
  }

  const token = signToken(user);

  return { token, user: user.toJSON() };
};

// ── Get Current User ──────────────────────────────────────────────────────────
export const getCurrentUser = async (userId: string): Promise<object> => {
  const user = await User.findById(userId);

  if (!user) {
    throw createError('User not found', 404);
  }

  return user.toJSON();
};
