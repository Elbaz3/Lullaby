// ─────────────────────────────────────────────
//  LULLABY — Auth Store
//
//  hasCompletedOnboarding flag controls flow:
//  false → show onboarding after login/register
//  true  → go straight to Home
// ─────────────────────────────────────────────

import { create } from 'zustand';
import { authService } from '../services/auth.service';
import * as SecureStore from 'expo-secure-store';
import { User } from '../types';

const ONBOARDING_KEY = 'lullaby_onboarding_done';

interface AuthState {
  user:                     User | null;
  isAuthenticated:          boolean;
  hasCompletedOnboarding:   boolean; // ← new flag
  isInitializing:           boolean;
  isLoading:                boolean;
  error:                    string | null;

  initialize:   ()                                                           => Promise<void>;
  login:        (identifier: string, password: string)                       => Promise<void>;
  register:     (payload: { name: string; email: string; phone: string; password: string; passwordConfirm: string }) => Promise<{ email: string }>;
  verifyOTP:    (otp: string, identifier: string, reason: 'verify' | 'reset') => Promise<void>;
  requestOTP:   (identifier: string, reason: 'verify' | 'reset')            => Promise<void>;
  completeOnboarding: ()                                                     => Promise<void>;
  logout:       ()                                                           => Promise<void>;
  clearError:   ()                                                           => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user:                   null,
  isAuthenticated:        false,
  hasCompletedOnboarding: false,
  isInitializing:         true,
  isLoading:              false,
  error:                  null,

  // ── INITIALIZE ─────────────────────────────
  // On app start: check token + onboarding flag
  initialize: async () => {
    try {
      const authenticated = await authService.isAuthenticated();
      if (authenticated) {
        const user          = await authService.getCachedUser();
        const onboardingRaw = await SecureStore.getItemAsync(ONBOARDING_KEY);
        const hasOnboarded  = onboardingRaw === 'true';
        set({ isAuthenticated: true, user, hasCompletedOnboarding: hasOnboarded });
      } else {
        set({ isAuthenticated: false, user: null, hasCompletedOnboarding: false });
      }
    } catch {
      set({ isAuthenticated: false, user: null, hasCompletedOnboarding: false });
    } finally {
      set({ isInitializing: false });
    }
  },

  // ── LOGIN ──────────────────────────────────
  // Sets isAuthenticated → RootNavigator switches
  // RootNavigator then checks hasCompletedOnboarding
  // to decide: Home or Onboarding
  login: async (identifier, password) => {
    set({ isLoading: true, error: null });
    try {
      const { user } = await authService.login(identifier, password);
      await authService.cacheUser(user);
      const onboardingRaw = await SecureStore.getItemAsync(ONBOARDING_KEY);
      const hasOnboarded  = onboardingRaw === 'true';
      set({ user, isAuthenticated: true, hasCompletedOnboarding: hasOnboarded, isLoading: false });
    } catch (err: any) {
      set({ error: err.message ?? 'Login failed. Please try again.', isLoading: false });
      throw err;
    }
  },

  // ── REGISTER ───────────────────────────────
  // Does NOT set isAuthenticated yet — OTP first
  register: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const { user } = await authService.register(payload);
      await authService.cacheUser(user);
      set({ user, isLoading: false });
      return { email: payload.email };
    } catch (err: any) {
      set({ error: err.message ?? 'Registration failed. Please try again.', isLoading: false });
      throw err;
    }
  },

  // ── VERIFY OTP ─────────────────────────────
  // reason="verify" → set isAuthenticated (NOT hasCompletedOnboarding yet)
  // reason="reset"  → just resolve
  verifyOTP: async (otp, identifier, reason) => {
    set({ isLoading: true, error: null });
    try {
      await authService.verifyOTP(otp, identifier, reason);
      if (reason === 'verify') {
        // Authenticated but NOT onboarded yet
        // RootNavigator will show onboarding flow
        set({ isAuthenticated: true, hasCompletedOnboarding: false, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (err: any) {
      set({ error: err.message ?? 'Invalid OTP. Please try again.', isLoading: false });
      throw err;
    }
  },

  // ── REQUEST OTP ────────────────────────────
  requestOTP: async (identifier, reason) => {
    set({ isLoading: true, error: null });
    try {
      await authService.requestOTP(identifier, reason);
      set({ isLoading: false });
    } catch (err: any) {
      set({ error: err.message ?? 'Failed to send OTP. Please try again.', isLoading: false });
      throw err;
    }
  },

  // ── COMPLETE ONBOARDING ────────────────────
  // Called when user finishes add baby + device screens
  // Persists flag so next login skips onboarding
  completeOnboarding: async () => {
    await SecureStore.setItemAsync(ONBOARDING_KEY, 'true');
    set({ hasCompletedOnboarding: true });
  },

  // ── LOGOUT ─────────────────────────────────
  logout: async () => {
    set({ isLoading: true });
    await authService.logout();
    // NOTE: we keep ONBOARDING_KEY on logout
    // so returning users don't see onboarding again
    set({
      user:                   null,
      isAuthenticated:        false,
      hasCompletedOnboarding: false,
      isLoading:              false,
      error:                  null,
    });
  },

  clearError: () => set({ error: null }),
}));