import { useState, useEffect, useRef } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '../utils/constants';

/**
 * Tracks network connectivity using browser events on web and API health checks.
 * On reconnect, invalidates all React Query cache so stale data refetches.
 */
export const useNetworkStatus = (): { isOnline: boolean } => {
  const [isOnline, setIsOnline] = useState(
    Platform.OS === 'web' && typeof navigator !== 'undefined'
      ? navigator.onLine
      : true
  );
  const qc = useQueryClient();
  const wasOffline = useRef(false);

  const checkConnectivity = async (): Promise<void> => {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined') {
      if (!navigator.onLine) {
        setIsOnline(false);
        wasOffline.current = true;
        return;
      }
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      // Ping our own backend health endpoint which allows CORS
      await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        signal: controller.signal,
        cache: 'no-cache',
      });
      clearTimeout(timeout);

      setIsOnline(true);

      // If we just came back online, invalidate all queries to refetch fresh data
      if (wasOffline.current) {
        wasOffline.current = false;
        await qc.invalidateQueries();
      }
    } catch {
      // If browser reports online, don't mark as offline just because of a failed ping
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.onLine) {
        setIsOnline(true);
      } else {
        setIsOnline(false);
        wasOffline.current = true;
      }
    }
  };

  useEffect(() => {
    // Check on mount
    void checkConnectivity();

    // Web-specific online/offline event listeners
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const handleOnline = () => {
        setIsOnline(true);
        if (wasOffline.current) {
          wasOffline.current = false;
          void qc.invalidateQueries();
        }
      };
      const handleOffline = () => {
        setIsOnline(false);
        wasOffline.current = true;
      };

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      const interval = setInterval(() => void checkConnectivity(), 30000);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        clearInterval(interval);
      };
    }

    // Native polling & AppState handling
    const interval = setInterval(() => void checkConnectivity(), 15000);
    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') void checkConnectivity();
    });

    return () => {
      clearInterval(interval);
      sub.remove();
    };
  }, []);

  return { isOnline };
};
