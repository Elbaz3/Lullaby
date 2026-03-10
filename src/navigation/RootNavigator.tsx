// ─────────────────────────────────────────────
//  ROOT NAVIGATOR
//
//  Decision tree:
//  isInitializing        → spinner (checking token + fetching baby)
//  !isAuthenticated      → Auth stack
//  isAuthenticated
//    + !hasBaby          → Onboarding stack (protected — must add baby to exit)
//    + hasBaby           → App (home tabs)
//
//  hasBaby is derived from the backend — not SecureStore.
//  If /api/children returns {} or [] → onboarding.
//  If /api/children returns a baby   → skip onboarding.
// ─────────────────────────────────────────────

import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

import { AuthNavigator }                    from './AuthNavigator';
import { AppNavigator }                     from './AppNavigator';
import { OnboardingWelcomeScreen }          from '../screens/onboarding/OnboardingWelcomeScreen';
import { OnboardingAddBabyScreen }          from '../screens/onboarding/OnboardingAddBabyScreen';
import { OnboardingConnectDeviceScreen }    from '../screens/onboarding/OnboardingConnectDeviceScreen';
import { useAuthStore }                     from '../store/authStore';
import { Colors }                           from '../constants/theme';

const Root = createNativeStackNavigator();

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, hasBaby, isInitializing, initialize } = useAuthStore();

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
          // ── Not logged in ──────────────────
          <Root.Screen name="Auth" component={AuthNavigator} />

        ) : !hasBaby ? (
          // ── Logged in but no baby yet ──────
          // Protected: user cannot navigate away from
          // these screens until a baby is added.
          // completeOnboarding() sets hasBaby=true after
          // babyService.addBaby() succeeds.
          <>
            <Root.Screen name="OnboardingWelcome"       component={OnboardingWelcomeScreen} />
            <Root.Screen name="OnboardingAddBaby"       component={OnboardingAddBabyScreen} />
            <Root.Screen name="OnboardingConnectDevice" component={OnboardingConnectDeviceScreen} />
          </>

        ) : (
          // ── Has baby → go to app ───────────
          <Root.Screen name="App" component={AppNavigator} />
        )}

      </Root.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: Colors.bgMain,
    alignItems: 'center',
    justifyContent: 'center',
  },
});