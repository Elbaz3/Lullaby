// ─────────────────────────────────────────────
//  LULLABY — Auth Store (Zustand)
// ─────────────────────────────────────────────

import { create } from 'zustand';
import { authService } from '../services/auth.service';
import { User, LoginPayload, RegisterPayload, ResetPasswordPayload } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<string>; // returns email for OTP
  verifyOTP: (email: string, otp: string) => Promise<void>;
  resendOTP: (email: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (payload: ResetPasswordPayload) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,

  /**
   * Called on app startup — checks for existing session.
   */
  initialize: async () => {
    try {
      const isAuth = await authService.isAuthenticated();
      if (isAuth) {
        const user = await authService.getMe();
        set({ user, isAuthenticated: true });
      }
    } catch {
      // Token invalid or expired — start fresh
      await authService.logout();
    } finally {
      set({ isInitialized: true });
    }
  },

  login: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const { user } = await authService.login(payload);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (err: any) {
      set({ error: err.message ?? 'Login failed', isLoading: false });
      throw err;
    }
  },

  register: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const { email } = await authService.register(payload);
      set({ isLoading: false });
      return email;
    } catch (err: any) {
      set({ error: err.message ?? 'Registration failed', isLoading: false });
      throw err;
    }
  },

  verifyOTP: async (email, otp) => {
    set({ isLoading: true, error: null });
    try {
      await authService.verifyOTP({ email, otp });
      // After OTP verified on registration, fetch user
      const user = await authService.getMe();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (err: any) {
      set({ error: err.message ?? 'OTP verification failed', isLoading: false });
      throw err;
    }
  },

  resendOTP: async (email) => {
    set({ isLoading: true, error: null });
    try {
      await authService.resendOTP(email);
      set({ isLoading: false });
    } catch (err: any) {
      set({ error: err.message ?? 'Failed to resend OTP', isLoading: false });
      throw err;
    }
  },

  forgotPassword: async (email) => {
    set({ isLoading: true, error: null });
    try {
      await authService.forgotPassword(email);
      set({ isLoading: false });
    } catch (err: any) {
      set({ error: err.message ?? 'Failed to send reset email', isLoading: false });
      throw err;
    }
  },

  resetPassword: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      await authService.resetPassword(payload);
      set({ isLoading: false });
    } catch (err: any) {
      set({ error: err.message ?? 'Password reset failed', isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.logout();
    } finally {
      set({ user: null, isAuthenticated: false, isLoading: false, error: null });
    }
  },

  clearError: () => set({ error: null }),
}));
