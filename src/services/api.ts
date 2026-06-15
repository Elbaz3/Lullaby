// ─────────────────────────────────────────────
//  LULLABY — API Client
//  Base URL: 63.179.148.169
//  Auth: Single JWT token via Bearer header
// ─────────────────────────────────────────────

import * as SecureStore from 'expo-secure-store';
import { getLocale } from '../store/localeStore';

export const BASE_URL = 'http://63.179.148.169/api';

// ── Endpoints ─────────────────────────────────
export const ENDPOINTS = {
  // Auth
  AUTH_SIGNUP:      '/auth/signup',
  AUTH_SIGNIN:      '/auth/signin',
  AUTH_VERIFY_OTP:  '/auth/verify-otp',
  AUTH_REQUEST_OTP: '/auth/request-otp',
  AUTH_ME:          '/auth/me',

  // Babies
  // Auth
  FORGOT_PASSWORD:        '/auth/forgot-password',
  VERIFY_FORGOT_PASSWORD: '/auth/verify-forgot-password',
  CHANGE_PASSWORD:      '/users/change-password',
  BABIES:                 '/children',
  BABY_BY_ID:       (id: string) => `/children/${id}`,
  BABY_SENSORS:     (id: string) => `/babies/${id}/sensors`,

  // Cry
  CRY_EVENTS:  (babyId: string) => `/babies/${babyId}/cry-events`,
  CRY_LATEST:  (babyId: string) => `/babies/${babyId}/cry-events/latest`,

  // Sensors
  SENSOR_LATEST:  (babyId: string) => `/babies/${babyId}/sensors/latest`,
  SENSOR_HISTORY: (babyId: string) => `/babies/${babyId}/sensors/history`,

  // Device
  DEVICES:      '/devices',
  DEVICE_PAIR:  '/devices/pair',
  DEVICE_BY_ID: (id: string) => `/devices/${id}`,

  // Reports
  REPORTS_DAILY:  (babyId: string) => `/babies/${babyId}/reports/daily`,
  REPORTS_WEEKLY: (babyId: string) => `/babies/${babyId}/reports/weekly`,

  // Vaccinations
  VACCINATIONS: (babyId: string) => `/babies/${babyId}/vaccinations`,

  // Assistant
  ASSISTANT_CHAT: '/assistant/chat',

  // Baby routine — growth & development (month = band lower bound, e.g. 19 for 19–24)
  BABY_ROUTINE_PHYSICAL_GROWTH:   (month: number) => `/baby-routine/physical-growth/${month}`,
  BABY_ROUTINE_MOTOR_DEVELOPMENT: (month: number) => `/baby-routine/motor-development/${month}`,
  BABY_ROUTINE_FEEDING:           (month: number) => `/baby-routine/feeding/${month}`,
} as const;

// ── Storage Keys ──────────────────────────────
export const STORAGE_KEYS = {
  TOKEN: 'lullaby_token',         // single JWT
  USER:  'lullaby_user',          // serialized user object
} as const;

// ── Device Type Enum ──────────────────────────
// Must match your backend DeviceType enum
export enum DeviceType {
  IOS     = 'ios',
  ANDROID = 'android',
  WEB     = 'web',
}

// ── Request Options ───────────────────────────
interface RequestOptions {
  method?:    'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?:      object;
  params?:    Record<string, string | number>;
  skipAuth?:  boolean; // true for login/register
}

// ── Server Response Shape ─────────────────────
// Every response from your NestJS backend follows this shape:
// { success, statusCode, message, data }
export interface ServerResponse<T> {
  success:    boolean;
  statusCode: number;
  message:    string;
  data:       T;
}

// ── Core Request Function ─────────────────────
export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ServerResponse<T>> {
  const { method = 'GET', body, params, skipAuth = false } = options;

  // Build URL
  let url = `${BASE_URL}${endpoint}`;
  if (params) {
    const query = Object.entries(params)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');
    url = `${url}?${query}`;
  }

  // Build headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept':       'application/json',
    lang:           getLocale(),
  };

  // Attach token if not a public endpoint
  if (!skipAuth) {
    const token = await SecureStore.getItemAsync(STORAGE_KEYS.TOKEN);
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  // Make request
  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (networkError) {
    // No internet or server unreachable
    throw new ApiError('No internet connection. Please check your network.', 0);
  }

  // Parse body — NestJS always returns JSON
  let json: any;
  try {
    json = await response.json();
  } catch {
    throw new ApiError('Server returned an unexpected response.', response.status);
  }

  // Handle HTTP errors
  if (!response.ok) {
    // NestJS error shape: { message: string | string[], statusCode }
    const raw = Array.isArray(json?.message)
      ? json.message[0]
      : json?.message ?? `Request failed (${response.status})`;
    throw new ApiError(mapError(raw), response.status);
  }

  return json as ServerResponse<T>;
}

// ── Token Helpers ─────────────────────────────
export const tokenStorage = {
  save:   (token: string) => SecureStore.setItemAsync(STORAGE_KEYS.TOKEN, token),
  get:    ()              => SecureStore.getItemAsync(STORAGE_KEYS.TOKEN),
  delete: ()              => SecureStore.deleteItemAsync(STORAGE_KEYS.TOKEN),
};


// ── Global backend error mapper ───────────────
// Backend may return Arabic validation messages.
// This maps known patterns to clean English.
export const mapError = (raw: string): string => {
  if (!raw) return 'Something went wrong. Please try again.';
  const msg = raw.toLowerCase();
  // Arabic 404 from nginx — "هذا الرابط غير موجود"
  if (raw.includes('\u0647\u0630\u0627') || raw.includes('\u063a\u064a\u0631 \u0645\u0648\u062c\u0648\u062f'))
    return 'Endpoint not found. Please check your server configuration.';
  // Arabic "تم" success messages that leak as errors
  if (raw.includes('\u062a\u0645'))
    return 'Operation completed';
  // Auth
  if (msg.includes('invalid credentials') || msg.includes('password') || msg.includes('identifier'))
    return 'Invalid email or password';
  if (msg.includes('already') && msg.includes('email'))  return 'Email already in use';
  if (msg.includes('already') && msg.includes('phone'))  return 'Phone number already in use';
  if (msg.includes('otp') || msg.includes('code'))       return 'Invalid or expired verification code';
  if (msg.includes('unauthorized') || msg.includes('401')) return 'Session expired. Please log in again.';
  if (msg.includes('not found') || msg.includes('404'))  return 'Endpoint not found. Please contact support.';
  if (msg.includes('server') || msg.includes('500'))     return 'Server error. Please try again later.';
  // Baby
  if (msg.includes('name'))    return 'Name must be between 3 and 20 characters';
  if (msg.includes('birth') || msg.includes('date')) return 'Please enter a valid date of birth';
  if (msg.includes('gender'))  return 'Please select a valid gender';
  if (msg.includes('height'))  return 'Please enter a valid height';
  if (msg.includes('weight') || msg.includes('wight')) return 'Please enter a valid weight';
  if (msg.includes('blood'))   return 'Please enter a valid blood type';
  // Fallback — don't show raw Arabic to user
  if (/[\u0600-\u06FF]/.test(raw)) return 'An error occurred. Please try again.';
  return raw;
};

// ── Custom Error Class ────────────────────────
export class ApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }

  // Helpers for common checks
  get isNetworkError()       { return this.statusCode === 0; }
  get isUnauthorized()       { return this.statusCode === 401; }
  get isValidationError()    { return this.statusCode === 400; }
  get isNotFound()           { return this.statusCode === 404; }
  get isServerError()        { return this.statusCode >= 500; }
}