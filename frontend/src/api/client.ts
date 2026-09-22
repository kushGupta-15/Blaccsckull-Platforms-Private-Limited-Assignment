import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL, SECURE_STORE_KEYS } from '../utils/constants';
import { useAuthStore } from '../store/authStore';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request interceptor — attach JWT if present ───────────────────────────────
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await SecureStore.getItemAsync(
      SECURE_STORE_KEYS.AUTH_TOKEN
    );
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// ── Response interceptor — auto-logout on 401 (expired/invalid token) ────────
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear stored credentials so the navigator re-renders to the auth stack
      await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.AUTH_TOKEN);
      await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.USER_DATA);
      useAuthStore.getState().logout().catch(() => undefined);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
