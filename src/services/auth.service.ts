// ─────────────────────────────────────────────
//  LULLABY — Auth Service
//
//  USE_MOCK = true  → fake responses (offline dev)
//  USE_MOCK = false → real backend at 63.179.148.169
//
//  How to switch: change the line below to false
//  when your backend is ready, one line change.
// ─────────────────────────────────────────────

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import {
  apiRequest,
  tokenStorage,
  ENDPOINTS,
  STORAGE_KEYS,
  DeviceType,
  ApiError,
} from './api';
import { MOCK_USER, mockDelay } from '../constants/mockData';
import {
  User,
  AuthData,
  LoginPayload,
  RegisterPayload,
  OTPPayload,
  RequestOTPPayload,
} from '../types';

const USE_MOCK = false; // ← flip to true for offline development

// ── Device Info ───────────────────────────────
// Sent with every auth request so backend can track sessions
const getDeviceType = (): DeviceType =>
  Platform.OS === 'ios' ? DeviceType.IOS : DeviceType.ANDROID;

// fcmToken would come from expo-notifications in production
// For now we send undefined and the backend marks it optional
const getFcmToken = (): string | undefined => undefined;

// ── Mock Token ────────────────────────────────
const MOCK_TOKEN = 'mock_jwt_token_for_development';

// ─────────────────────────────────────────────
//  AUTH SERVICE
// ─────────────────────────────────────────────
export const authService = {

  // ── LOGIN ─────────────────────────────────
  // Endpoint: POST /api/auth/signin
  // Body:     { identifier, password, fcmToken?, deviceType? }
  // Response: { data: { token, user } }
  login: async (identifier: string, password: string): Promise<AuthData> => {
    if (USE_MOCK) {
      await mockDelay(800);
      if (password === 'wrong') throw new ApiError('Invalid credentials', 401);
      await tokenStorage.save(MOCK_TOKEN);
      return { token: MOCK_TOKEN, user: MOCK_USER };
    }

    const payload: LoginPayload = {
      identifier,
      password,
      deviceType: getDeviceType(),
      fcmToken:   getFcmToken(),
    };

    const res = await apiRequest<AuthData>(ENDPOINTS.AUTH_SIGNIN, {
      method:   'POST',
      body:     payload,
      skipAuth: true, // no token needed for login
    });

    // Save token to secure storage immediately
    await tokenStorage.save(res.data.token);
    return res.data;
  },

  // ── REGISTER ──────────────────────────────
  // Endpoint: POST /api/auth/signup
  // Body:     { name, email, phone, password, passwordConfirm, deviceType?, fcmToken? }
  // Response: { data: { token, user } }
  // After success → backend sends OTP to email → navigate to OTP screen
  register: async (payload: Omit<RegisterPayload, 'country' | 'fcmToken' | 'deviceType'>): Promise<AuthData> => {
    if (USE_MOCK) {
      await mockDelay(1000);
      if (payload.email === 'taken@example.com') throw new ApiError('Email already in use', 400);
      return { token: MOCK_TOKEN, user: { ...MOCK_USER, name: payload.name, email: payload.email, phone: payload.phone } };
    }

    const body: RegisterPayload = {
      ...payload,
      country:    undefined,        // not in DB yet — keep null
      deviceType: getDeviceType(),
      fcmToken:   getFcmToken(),
    };

    const res = await apiRequest<AuthData>(ENDPOINTS.AUTH_SIGNUP, {
      method:   'POST',
      body,
      skipAuth: true,
    });

    // Save token right after signup too
    await tokenStorage.save(res.data.token);
    return res.data;
  },

  // ── VERIFY OTP ────────────────────────────
  // Endpoint: POST /api/auth/verify-otp
  // Body:     { reason: "verify", otp, identifier }
  // Used after: register (reason = "verify")
  // Used after: forgot password (reason = "reset")
  verifyOTP: async (otp: string, identifier: string, reason: 'verify' | 'reset'): Promise<void> => {
    if (USE_MOCK) {
      await mockDelay(700);
      if (otp !== '123456') throw new ApiError('Invalid or expired OTP', 400);
      return;
    }

    const payload: OTPPayload = { reason, otp, identifier };

    await apiRequest(ENDPOINTS.AUTH_VERIFY_OTP, {
      method:   'POST',
      body:     payload,
      skipAuth: true,
    });
  },

  // ── REQUEST OTP ───────────────────────────
  // Endpoint: POST /api/auth/request-otp
  // Body:     { reason: "verify" | "reset", identifier }
  // Used for: resend OTP, forgot password
  requestOTP: async (identifier: string, reason: 'verify' | 'reset'): Promise<void> => {
    if (USE_MOCK) {
      await mockDelay(600);
      return;
    }

    const payload: RequestOTPPayload = { reason, identifier };

    await apiRequest(ENDPOINTS.AUTH_REQUEST_OTP, {
      method:   'POST',
      body:     payload,
      skipAuth: true,
    });
  },

  // ── LOGOUT ────────────────────────────────
  // Just clears local token — no backend call needed
  // (backend uses stateless JWT, no session to invalidate)
  logout: async (): Promise<void> => {
    await tokenStorage.delete();
    await SecureStore.deleteItemAsync(STORAGE_KEYS.USER);
  },

  // ── IS AUTHENTICATED ──────────────────────
  // Checks if a token exists in secure storage
  // Called on app start to decide which screen to show

  // ── FORGOT PASSWORD ────────────────────────
  // Step 1: POST /auth/forgot-password
  // Sends OTP to identifier (email or phone)
  forgotPassword: async (identifier: string): Promise<void> => {
    await apiRequest(ENDPOINTS.FORGOT_PASSWORD, {
      method: 'POST',
      body:   { identifier },
    });
  },

  // ── VERIFY FORGOT PASSWORD ─────────────────
  // Step 2: POST /auth/verify-forgot-password
  // Verifies OTP and sets new password in one call
  verifyForgotPassword: async (payload: {
    identifier:      string;
    otp:             string;
    password:        string;
    passwordConfirm: string;
  }): Promise<void> => {
    await apiRequest(ENDPOINTS.VERIFY_FORGOT_PASSWORD, {
      method: 'POST',
      body:   payload,
    });
  },

  // ── CHANGE PASSWORD ───────────────────────
  // For logged in users who want to change password
  // Endpoint: POST /auth/change-password
  // Body:     { currentPassword, newPassword, newPasswordConfirm }
  changePassword: async (payload: {
    currentPassword:    string;
    newPassword:        string;
    newPasswordConfirm: string;
  }): Promise<void> => {
    await apiRequest(ENDPOINTS.CHANGE_PASSWORD, {
      method: 'POST',
      body:   payload,
    });
  },

  isAuthenticated: async (): Promise<boolean> => {
    const token = await tokenStorage.get();
    return !!token;
  },

  // ── GET CURRENT USER ──────────────────────
  // Reads cached user from storage (no network call)
  // Full profile fetch would be GET /api/auth/me with Bearer token
  getCachedUser: async (): Promise<User | null> => {
    const raw = await SecureStore.getItemAsync(STORAGE_KEYS.USER);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  },

  // Save user to storage after login/register
  cacheUser: async (user: User): Promise<void> => {
    await SecureStore.setItemAsync(STORAGE_KEYS.USER, JSON.stringify(user));
  },
};