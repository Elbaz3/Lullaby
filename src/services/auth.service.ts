// ─────────────────────────────────────────────
//  LULLABY — Auth Service
//  Set USE_MOCK = false when backend is ready.
// ─────────────────────────────────────────────

import * as SecureStore from 'expo-secure-store';
import { apiRequest, ENDPOINTS, STORAGE_KEYS } from './api';
import { MOCK_USER, MOCK_TOKENS, mockDelay } from '../constants/mockData';
import {
  User, AuthTokens, LoginPayload, RegisterPayload,
  OTPPayload, ResetPasswordPayload, ApiResponse,
} from '../types';

const USE_MOCK = true;

export const authService = {
  login: async (payload: LoginPayload): Promise<{ user: User; tokens: AuthTokens }> => {
    if (USE_MOCK) {
      await mockDelay(800);
      if (payload.password === 'wrong') throw new Error('Invalid credentials');
      await persistTokens(MOCK_TOKENS);
      return { user: MOCK_USER, tokens: MOCK_TOKENS };
    }
    const res = await apiRequest<ApiResponse<{ user: User; tokens: AuthTokens }>>(
      ENDPOINTS.AUTH_LOGIN, { method: 'POST', body: payload }
    );
    await persistTokens(res.data.tokens);
    return res.data;
  },

  register: async (payload: RegisterPayload): Promise<{ email: string }> => {
    if (USE_MOCK) {
      await mockDelay(1000);
      if (payload.email === 'taken@example.com') throw new Error('Email already in use');
      return { email: payload.email };
    }
    const res = await apiRequest<ApiResponse<{ email: string }>>(
      ENDPOINTS.AUTH_REGISTER, { method: 'POST', body: payload }
    );
    return res.data;
  },

  verifyOTP: async (payload: OTPPayload): Promise<boolean> => {
    if (USE_MOCK) {
      await mockDelay(700);
      if (payload.otp !== '123456') throw new Error('Invalid or expired OTP');
      return true;
    }
    const res = await apiRequest<ApiResponse<boolean>>(
      ENDPOINTS.AUTH_VERIFY_OTP, { method: 'POST', body: payload }
    );
    return res.data;
  },

  resendOTP: async (email: string): Promise<void> => {
    if (USE_MOCK) { await mockDelay(600); return; }
    await apiRequest(ENDPOINTS.AUTH_RESEND_OTP, { method: 'POST', body: { email } });
  },

  forgotPassword: async (email: string): Promise<void> => {
    if (USE_MOCK) { await mockDelay(800); return; }
    await apiRequest(ENDPOINTS.AUTH_FORGOT_PASSWORD, { method: 'POST', body: { email } });
  },

  resetPassword: async (payload: ResetPasswordPayload): Promise<void> => {
    if (USE_MOCK) {
      await mockDelay(800);
      if (payload.newPassword !== payload.confirmPassword) throw new Error('Passwords do not match');
      return;
    }
    await apiRequest(ENDPOINTS.AUTH_RESET_PASSWORD, { method: 'POST', body: payload });
  },

  getMe: async (): Promise<User> => {
    if (USE_MOCK) { await mockDelay(400); return MOCK_USER; }
    const res = await apiRequest<ApiResponse<User>>(ENDPOINTS.AUTH_ME);
    return res.data;
  },

  logout: async (): Promise<void> => {
    if (!USE_MOCK) {
      try { await apiRequest(ENDPOINTS.AUTH_LOGOUT, { method: 'POST' }); } catch {}
    }
    await clearTokens();
  },

  isAuthenticated: async (): Promise<boolean> => {
    const token = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
    return !!token;
  },
};

const persistTokens = async (tokens: AuthTokens) => {
  await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
  await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
};

const clearTokens = async () => {
  await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
  await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
};