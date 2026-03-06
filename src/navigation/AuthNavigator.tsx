// ─────────────────────────────────────────────
//  AUTH NAVIGATOR
//  After OTP verify → OnboardingWelcome
//  Onboarding screens live here so the stack
//  is cleanly replaced when user reaches Home
// ─────────────────────────────────────────────

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { SplashScreen }                    from '../screens/auth/SplashScreen';
import { WelcomeScreen }                   from '../screens/auth/WelcomeScreen';
import { LoginScreen }                     from '../screens/auth/LoginScreen';
import { RegisterScreen }                  from '../screens/auth/RegisterScreen';
import { OTPVerificationScreen }           from '../screens/auth/OTPVerificationScreen';
import { NewPasswordScreen }               from '../screens/auth/NewPasswordScreen';
import { VerificationSuccessScreen }       from '../screens/auth/NewPasswordScreen';
import { ForgotPasswordScreen }            from '../screens/auth/ForgotPasswordScreen';
import { OnboardingWelcomeScreen }         from '../screens/onboarding/OnboardingWelcomeScreen';
import { OnboardingAddBabyScreen }         from '../screens/onboarding/OnboardingAddBabyScreen';
import { OnboardingConnectDeviceScreen }   from '../screens/onboarding/OnboardingConnectDeviceScreen';

const Stack = createNativeStackNavigator();

export const AuthNavigator: React.FC = () => (
  <Stack.Navigator
    initialRouteName="Splash"
    screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
  >
    {/* Auth flow */}
    <Stack.Screen name="Splash"              component={SplashScreen} />
    <Stack.Screen name="Welcome"             component={WelcomeScreen} />
    <Stack.Screen name="Login"               component={LoginScreen} />
    <Stack.Screen name="Register"            component={RegisterScreen} />
    <Stack.Screen name="ForgotPassword"      component={ForgotPasswordScreen} />
    <Stack.Screen name="OTPVerification"     component={OTPVerificationScreen} />
    <Stack.Screen name="NewPassword"         component={NewPasswordScreen} />
    <Stack.Screen name="VerificationSuccess" component={VerificationSuccessScreen} />

    {/* Onboarding flow (after register + OTP) */}
    <Stack.Screen name="OnboardingWelcome"       component={OnboardingWelcomeScreen} />
    <Stack.Screen name="OnboardingAddBaby"       component={OnboardingAddBabyScreen} />
    <Stack.Screen name="OnboardingConnectDevice" component={OnboardingConnectDeviceScreen} options={{ animation: 'slide_from_right' }} />
  </Stack.Navigator>
);