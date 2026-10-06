import { create } from 'zustand';
import { appStorage } from '../utils/storage';
import { IUser } from '../types';
import { SECURE_STORE_KEYS } from '../utils/constants';

interface AuthState {
  token: string | null;
  user: IUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  setAuth: (token: string, user: IUser) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isLoading: true,
  isAuthenticated: false,

  setAuth: async (token, user) => {
    await appStorage.setItem(SECURE_STORE_KEYS.AUTH_TOKEN, token);
    await appStorage.setItem(
      SECURE_STORE_KEYS.USER_DATA,
      JSON.stringify(user)
    );
    set({ token, user, isAuthenticated: true });
  },

  logout: async () => {
    await appStorage.deleteItem(SECURE_STORE_KEYS.AUTH_TOKEN);
    await appStorage.deleteItem(SECURE_STORE_KEYS.USER_DATA);
    set({ token: null, user: null, isAuthenticated: false });
  },

  restoreSession: async () => {
    try {
      const token = await appStorage.getItem(
        SECURE_STORE_KEYS.AUTH_TOKEN
      );
      const userJson = await appStorage.getItem(
        SECURE_STORE_KEYS.USER_DATA
      );

      if (token && userJson) {
        const user = JSON.parse(userJson) as IUser;
        set({ token, user, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));
