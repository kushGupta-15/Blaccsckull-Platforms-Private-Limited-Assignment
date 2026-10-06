import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';

import { RootStackParamList } from '../types';
import { COLORS } from '../utils/constants';
import { useAuthStore } from '../store/authStore';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import CompetitionsListScreen from '../screens/CompetitionsListScreen';
import CompetitionDetailsScreen from '../screens/CompetitionDetails/CompetitionDetailsScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuthStore();

  // Show spinner while restoring session from SecureStore
  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: COLORS.bgDark,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.bgDark },
          animation: 'slide_from_right',
        }}
      >
        {isAuthenticated ? (
          // ── Authenticated stack ─────────────────────────────────────────────
          <>
            <Stack.Screen
              name="CompetitionsList"
              component={CompetitionsListScreen}
            />
            <Stack.Screen
              name="CompetitionDetails"
              component={CompetitionDetailsScreen}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
            />
          </>
        ) : (
          // ── Unauthenticated stack ───────────────────────────────────────────
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
