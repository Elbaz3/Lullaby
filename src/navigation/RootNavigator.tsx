// ─────────────────────────────────────────────
//  ROOT NAVIGATOR
//
//  Decision tree:
//  isInitializing        → spinner
//  !isAuthenticated      → Auth stack (login/register)
//  isAuthenticated
//    + !hasOnboarding    → Onboarding stack
//    + hasOnboarding     → App (home)
// ─────────────────────────────────────────────

import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

import { AuthNavigator }        from './AuthNavigator';
import { AppNavigator }         from './AppNavigator';
import { OnboardingWelcomeScreen }       from '../screens/onboarding/OnboardingWelcomeScreen';
import { OnboardingAddBabyScreen }       from '../screens/onboarding/OnboardingAddBabyScreen';
import { OnboardingConnectDeviceScreen } from '../screens/onboarding/OnboardingConnectDeviceScreen';
import { useAuthStore }         from '../store/authStore';
import { Colors }               from '../constants/theme';

const Root = createNativeStackNavigator();

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, hasCompletedOnboarding, isInitializing, initialize } = useAuthStore();

  useEffect(() => { initialize(); }, []);

  if (isInitializing) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Root.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>

        {!isAuthenticated ? (
          // Not logged in → Auth screens
          <Root.Screen name="Auth" component={AuthNavigator} />
        ) : !hasCompletedOnboarding ? (
          // Logged in but never added a baby → Onboarding
          <>
            <Root.Screen name="OnboardingWelcome"       component={OnboardingWelcomeScreen} />
            <Root.Screen name="OnboardingAddBaby"       component={OnboardingAddBabyScreen} />
            <Root.Screen name="OnboardingConnectDevice" component={OnboardingConnectDeviceScreen} />
          </>
        ) : (
          // Fully onboarded → App
          <Root.Screen name="App" component={AppNavigator} />
        )}

      </Root.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: Colors.bgMain, alignItems: 'center', justifyContent: 'center' },
});