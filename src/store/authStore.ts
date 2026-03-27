// ─────────────────────────────────────────────
//  LULLABY — Auth Store
//
//  Onboarding flow is now BACKEND-DRIVEN:
//
//  On login / initialize:
//    1. Authenticate user
//    2. Fetch babies from /api/children
//    3. If data is empty ({} or []) → hasBaby = false → show onboarding
//    4. If data has a baby         → hasBaby = true  → go to Home
//
//  completeOnboarding is called after addBaby succeeds
//  in OnboardingConnectDeviceScreen — it sets hasBaby = true
//  which makes RootNavigator switch to App automatically.
//
//  We no longer use SecureStore for onboarding state —
//  the source of truth is always the backend.
// ─────────────────────────────────────────────

import { create } from 'zustand';
import { authService }  from '../services/auth.service';
import { babyService }  from '../services/baby.service';
import { useBabyStore } from './babyStore';
import { User }         from '../types';

interface AuthState {
  user:            User | null;
  isAuthenticated: boolean;
  hasBaby:         boolean;   // true = has at least one baby → skip onboarding
  isInitializing:  boolean;
  isLoading:       boolean;
  error:           string | null;

  initialize:          ()                                                                     => Promise<void>;
  login:               (identifier: string, password: string)                                => Promise<void>;
  register:            (payload: { name: string; email: string; phone: string; password: string; passwordConfirm: string }) => Promise<{ email: string }>;
  verifyOTP:           (otp: string, identifier: string, reason: 'verify' | 'reset')         => Promise<void>;
  requestOTP:          (identifier: string, reason: 'verify' | 'reset')                     => Promise<void>;
  fetchProfile:        ()                                                                       => Promise<void>;
  updateProfile:       (payload: { name?: string; dateOfBirth?: string }, avatarUri?: string | null) => Promise<void>;
  forgotPassword:      (identifier: string)                                                    => Promise<void>;
  verifyForgotPassword:(payload: { identifier: string; otp: string; password: string; passwordConfirm: string }) => Promise<void>;
  completeOnboarding:  ()                                                                     => Promise<void>;
  logout:              ()                                                                     => Promise<void>;
  clearError:          ()                                                                     => void;
}

// ── Helper: fetch babies and check if user has any ──
// Returns true if backend returned a real baby object
const checkHasBaby = async (): Promise<boolean> => {
  try {
    const babies = await babyService.getBabies();
    // getBabies already normalizes — empty {} becomes []
    // so just check length
    if (babies.length > 0) {
      // Populate babyStore so rest of app has data immediately
      useBabyStore.setState({
        babies,
        activeBabyId: babies[0].id,
        activeBaby:   babies[0],
      });
      return true;
    }
    return false;
  } catch {
    // Network error or 404 → treat as no baby
    // Don't block the user, let them proceed to onboarding
    return false;
  }
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user:            null,
  isAuthenticated: false,
  hasBaby:         false,
  isInitializing:  true,
  isLoading:       false,
  error:           null,

  // ── INITIALIZE ─────────────────────────────
  // On app start: check token → if valid, fetch babies
  initialize: async () => {
    try {
      const authenticated = await authService.isAuthenticated();
      if (authenticated) {
        const user     = await authService.getCachedUser();
        const hasBaby  = await checkHasBaby();
        set({ isAuthenticated: true, user, hasBaby });
      } else {
        set({ isAuthenticated: false, user: null, hasBaby: false });
      }
    } catch {
      set({ isAuthenticated: false, user: null, hasBaby: false });
    } finally {
      set({ isInitializing: false });
    }
  },

  // ── LOGIN ──────────────────────────────────
  // After login → fetch babies to decide onboarding
  login: async (identifier, password) => {
    set({ isLoading: true, error: null });
    try {
      const { user } = await authService.login(identifier, password);
      await authService.cacheUser(user);
      // Check if user already has a baby → skip onboarding
      const hasBaby = await checkHasBaby();
      set({ user, isAuthenticated: true, hasBaby, isLoading: false });
    } catch (err: any) {
      set({ error: err.message ?? 'Login failed. Please try again.', isLoading: false });
      throw err;
    }
  },

  // ── REGISTER ───────────────────────────────
  // Does NOT set isAuthenticated yet — OTP required first
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
  // After OTP → authenticated but new user → no baby yet
  verifyOTP: async (otp, identifier, reason) => {
    set({ isLoading: true, error: null });
    try {
      await authService.verifyOTP(otp, identifier, reason);
      if (reason === 'verify') {
        // New user — definitely no baby yet
        set({ isAuthenticated: true, hasBaby: false, isLoading: false });
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


  // ── FETCH PROFILE ─────────────────────────
  // GET /api/my-profile — refreshes user in store + cache
  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const user = await authService.getProfile();
      await authService.cacheUser(user);
      set({ user, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  // ── UPDATE PROFILE ─────────────────────────
  // PATCH /api/my-profile
  // Supports: name, dateOfBirth, avatar (image file)
  updateProfile: async (payload, avatarUri) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await authService.updateProfile(payload, avatarUri);
      // Merge update — backend may return partial data
      const current = useAuthStore.getState().user;
      const merged  = { ...current, ...updated } as User;
      await authService.cacheUser(merged);
      set({ user: merged, isLoading: false });
    } catch (err: any) {
      set({ error: err.message ?? 'Failed to update profile.', isLoading: false });
      throw err;
    }
  },

  // ── FORGOT PASSWORD ────────────────────────
  // Step 1: send OTP via /auth/forgot-password
  forgotPassword: async (identifier) => {
    set({ isLoading: true, error: null });
    try {
      await authService.forgotPassword(identifier);
      set({ isLoading: false });
    } catch (err: any) {
      set({ error: err.message ?? 'Failed to send reset code.', isLoading: false });
      throw err;
    }
  },

  // ── VERIFY FORGOT PASSWORD ─────────────────
  // Step 2: verify OTP + set new password
  verifyForgotPassword: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      await authService.verifyForgotPassword(payload);
      set({ isLoading: false });
    } catch (err: any) {
      set({ error: err.message ?? 'Failed to reset password.', isLoading: false });
      throw err;
    }
  },

  // ── COMPLETE ONBOARDING ────────────────────
  // Called after baby is successfully added in onboarding.
  // Re-fetches babies from backend to guarantee babyStore
  // is populated before RootNavigator switches to App.
  completeOnboarding: async () => {
    // Re-fetch to populate babyStore with fresh server data
    // (handles avatar URL, _id, etc. returned by backend)
    await checkHasBaby();
    set({ hasBaby: true });
  },

  // ── LOGOUT ─────────────────────────────────
  logout: async () => {
    set({ isLoading: true });
    await authService.logout();
    // Clear baby store too
    useBabyStore.setState({
      babies: [], activeBabyId: null, activeBaby: null,
    });
    set({
      user:            null,
      isAuthenticated: false,
      hasBaby:         false,
      isLoading:       false,
      error:           null,
    });
  },

  clearError: () => set({ error: null }),
}));