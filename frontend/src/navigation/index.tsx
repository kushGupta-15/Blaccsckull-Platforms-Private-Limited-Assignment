import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';

import { RootStackParamList } from '../types';
import { COLORS } from '../utils/constants';
import { useAuthStore } from '../store/authStore';

// Placeholder screens — to be replaced in later phases
import LoginScreen from '../screens/LoginScreen';
import CompetitionsListScreen from '../screens/CompetitionsListScreen';
import CompetitionDetailsScreen from '../screens/CompetitionDetails/CompetitionDetailsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuthStore();

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
          <>
            <Stack.Screen
              name="CompetitionsList"
              component={CompetitionsListScreen}
            />
            <Stack.Screen
              name="CompetitionDetails"
              component={CompetitionDetailsScreen}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
