import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AppNavigator from './src/navigation';
import { useAuthStore } from './src/store/authStore';
import OfflineBanner from './src/components/OfflineBanner';
import { useNetworkStatus } from './src/hooks/useNetworkStatus';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 2,      // 2 minutes
      gcTime: 1000 * 60 * 10,         // 10 minutes
      refetchOnWindowFocus: true,
    },
    mutations: {
      retry: 0,
    },
  },
});

// ── Inner component — needs QueryClient context for useNetworkStatus ──────────
const AppContent: React.FC = () => {
  const restoreSession = useAuthStore((s) => s.restoreSession);
  const { isOnline } = useNetworkStatus();

  useEffect(() => {
    void restoreSession();
  }, [restoreSession]);

  return (
    <View style={styles.flex}>
      <StatusBar style="light" />
      <OfflineBanner isOnline={isOnline} />
      <AppNavigator />
    </View>
  );
};

export default function App(): React.JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
