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
  forgotPassword:      (identifier: string)                                                    => Promise<void>;
  verifyForgotPassword:(payload: { identifier: string; otp: string; password: string; passwordConfirm: string }) => Promise<void>;
  completeOnboarding:  ()                                                                     => Promise<void>;
  logout:              ()                                                                     => Promise<void>;
  clearError:          ()                                                                     => void;
  changePassword:      (currentPassword: string, newPassword: string, newPasswordConfirm: string) => Promise<void>;
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

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  hasBaby: false,
  isInitializing: true,
  isLoading: false,
  error: null,

  initialize: async () => {
    try {
      const authenticated = await authService.isAuthenticated();
      if (authenticated) {
        const user = await authService.getCachedUser();
        const hasBaby = await checkHasBaby();
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

  login: async (identifier, password) => {
    set({ isLoading: true, error: null });
    try {
      const { user } = await authService.login(identifier, password);
      await authService.cacheUser(user);
      const hasBaby = await checkHasBaby();
      set({ user, isAuthenticated: true, hasBaby, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Login failed', isLoading: false });
      throw err;
    }
  },

  verifyOTP: async (otp, identifier, reason) => {
    set({ isLoading: true, error: null });
    try {
      await authService.verifyOTP(otp, identifier, reason);
      if (reason === 'verify') {
        // Registration success path
        set({ isAuthenticated: true, hasBaby: false, isLoading: false });
      } else {
        // Reset password path (OTP verified, but not logged in yet)
        set({ isLoading: false });
      }
    } catch (err: any) {
      set({ error: err.message || 'Invalid OTP', isLoading: false });
      throw err;
    }
  },

  register: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const { user } = await authService.register(payload);
      await authService.cacheUser(user);
      set({ isLoading: false });
      return { email: payload.email };
    } catch (err: any) {
      set({ error: err.message || 'Registration failed', isLoading: false });
      throw err;
    }
  },

  requestOTP: async (identifier, reason) => {
    set({ isLoading: true, error: null });
    try {
      await authService.requestOTP(identifier, reason);
      set({ isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to send OTP', isLoading: false });
      throw err;
    }
  },

  forgotPassword: async (identifier) => {
    set({ isLoading: true, error: null });
    try {
      await authService.forgotPassword(identifier);
      set({ isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to send reset OTP', isLoading: false });
      throw err;
    }
  },

  verifyForgotPassword: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      await authService.verifyForgotPassword(payload);
      set({ isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to reset password', isLoading: false });
      throw err;
    }
  },

  changePassword: async (currentPassword, newPassword, newPasswordConfirm) => {
    set({ isLoading: true, error: null });
    try {
      await authService.changePassword({ currentPassword, newPassword, newPasswordConfirm });
      set({ isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to change password', isLoading: false });
      throw err;
    }
  },

  completeOnboarding: async () => {
    set({ hasBaby: true });
  },

  logout: async () => {
    await authService.logout();
    useBabyStore.setState({ babies: [], activeBabyId: null, activeBaby: null });
    set({ user: null, isAuthenticated: false, hasBaby: false });
  },

  clearError: () => set({ error: null }),
}));