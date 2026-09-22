import Constants from 'expo-constants';

// API base URL — set in app.json extra or override with .env
export const API_BASE_URL: string =
  (Constants.expoConfig?.extra as { apiBaseUrl?: string } | undefined)
    ?.apiBaseUrl ?? 'http://localhost:5000/api/v1';

export const SECURE_STORE_KEYS = {
  AUTH_TOKEN: 'feedants_auth_token',
  USER_DATA: 'feedants_user_data',
} as const;

// Color palette — matches design.md
export const COLORS = {
  // Backgrounds
  bgDark: '#0D0D1A',
  bgSurface: '#1A1A2E',
  bgElevated: '#252540',

  // Brand
  primary: '#6C63FF',
  primaryLight: '#8B80FF',
  secondary: '#FF6584',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0C0',
  textMuted: '#5A5A7A',

  // Status
  success: '#00D4A0',
  warning: '#FFB800',
  error: '#FF4757',
  info: '#4ECDC4',

  // Misc
  border: '#2A2A45',
  overlay: 'rgba(13, 13, 26, 0.85)',
} as const;

// Spacing (4pt grid)
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

// Typography sizes
export const FONT_SIZE = {
  h1: 28,
  h2: 22,
  h3: 18,
  bodyLg: 16,
  body: 14,
  caption: 12,
  badge: 11,
} as const;
