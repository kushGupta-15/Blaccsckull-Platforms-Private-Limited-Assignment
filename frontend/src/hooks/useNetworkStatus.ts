import { useState, useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Tracks network connectivity using fetch-based polling.
 * On reconnect, invalidates all React Query cache so stale data refetches.
 */
export const useNetworkStatus = (): { isOnline: boolean } => {
  const [isOnline, setIsOnline] = useState(true);
  const qc = useQueryClient();
  const wasOffline = useRef(false);

  const checkConnectivity = async (): Promise<void> => {
    try {
      // Lightweight HEAD request to a reliable endpoint
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      await fetch('https://www.google.com', {
        method: 'HEAD',
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
      setIsOnline(false);
      wasOffline.current = true;
    }
  };

  useEffect(() => {
    // Check on mount
    void checkConnectivity();

    // Poll every 10 seconds
    const interval = setInterval(() => void checkConnectivity(), 10000);

    // Re-check when app comes to foreground
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
