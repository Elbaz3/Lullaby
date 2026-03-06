// ─────────────────────────────────────────────
//  LULLABY — API Client
//  Base URL: 63.179.148.169
//  Auth: Single JWT token via Bearer header
// ─────────────────────────────────────────────

import * as SecureStore from 'expo-secure-store';

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
  BABIES:           '/babies',
  BABY_BY_ID:       (id: string) => `/babies/${id}`,
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
    const msg = Array.isArray(json?.message)
      ? json.message[0]           // validation errors come as array
      : json?.message ?? `Request failed (${response.status})`;
    throw new ApiError(msg, response.status);
  }

  return json as ServerResponse<T>;
}

// ── Token Helpers ─────────────────────────────
export const tokenStorage = {
  save:   (token: string) => SecureStore.setItemAsync(STORAGE_KEYS.TOKEN, token),
  get:    ()              => SecureStore.getItemAsync(STORAGE_KEYS.TOKEN),
  delete: ()              => SecureStore.deleteItemAsync(STORAGE_KEYS.TOKEN),
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