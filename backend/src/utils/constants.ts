export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '7d';

export const COMPETITION_STATUS = {
  UPCOMING: 'upcoming',
  ACTIVE: 'active',
  FULL: 'full',
  ENDED: 'ended',
  CANCELLED: 'cancelled',
} as const;

export type CompetitionStatus =
  (typeof COMPETITION_STATUS)[keyof typeof COMPETITION_STATUS];

export const REGISTRATION_STATUS = {
  ACTIVE: 'active',
  WITHDRAWN: 'withdrawn',
} as const;

export type RegistrationStatus =
  (typeof REGISTRATION_STATUS)[keyof typeof REGISTRATION_STATUS];

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
