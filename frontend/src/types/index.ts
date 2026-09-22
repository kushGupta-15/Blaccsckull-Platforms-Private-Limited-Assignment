// ── User ──────────────────────────────────────────────────────────────────────
export interface IUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Competition ───────────────────────────────────────────────────────────────
export type CompetitionStatus =
  | 'upcoming'
  | 'active'
  | 'full'
  | 'ended'
  | 'cancelled';

export interface ICompetition {
  _id: string;
  title: string;
  description: string;
  bannerImage?: string;
  category: string;
  status: CompetitionStatus;
  startDate: string;   // ISO 8601
  endDate: string;     // ISO 8601
  totalSpots: number;
  registeredCount: number;
  entryFee: number;    // 0 = free
  prizePool: string;
  rules: string[];
  host: Pick<IUser, '_id' | 'name' | 'avatar'>;
  createdAt: string;
  updatedAt: string;
  // Injected by the API when a valid auth token is present
  userRegistrationStatus?: 'registered' | 'not_registered' | 'withdrawn';
}

// ── Registration ──────────────────────────────────────────────────────────────
export interface IRegistration {
  _id: string;
  userId: string;
  competitionId: string;
  registeredAt: string;
  status: 'active' | 'withdrawn';
}

// ── API Response Wrappers ─────────────────────────────────────────────────────
export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  details?: string[];
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ── Pagination ────────────────────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ── Navigation ────────────────────────────────────────────────────────────────
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  CompetitionsList: undefined;
  CompetitionDetails: { competitionId: string };
};
