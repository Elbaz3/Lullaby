// ─────────────────────────────────────────────
//  LULLABY — API Client (fetch-based, no axios)
//  Compatible with React Native New Architecture
// ─────────────────────────────────────────────

import * as SecureStore from 'expo-secure-store';

// TODO: Replace with your actual backend URL
export const BASE_URL = 'https://your-backend-api.com/api/v1';

export const ENDPOINTS = {
  AUTH_LOGIN: '/auth/login',
  AUTH_REGISTER: '/auth/register',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_REFRESH: '/auth/refresh',
  AUTH_VERIFY_OTP: '/auth/verify-otp',
  AUTH_RESEND_OTP: '/auth/resend-otp',
  AUTH_FORGOT_PASSWORD: '/auth/forgot-password',
  AUTH_RESET_PASSWORD: '/auth/reset-password',
  AUTH_ME: '/auth/me',
  BABIES: '/babies',
  BABY_BY_ID: (id: string) => `/babies/${id}`,
  BABY_SENSORS: (id: string) => `/babies/${id}/sensors`,
  CRY_EVENTS: (babyId: string) => `/babies/${babyId}/cry-events`,
  CRY_LATEST: (babyId: string) => `/babies/${babyId}/cry-events/latest`,
  SENSOR_LATEST: (babyId: string) => `/babies/${babyId}/sensors/latest`,
  SENSOR_HISTORY: (babyId: string) => `/babies/${babyId}/sensors/history`,
  DEVICES: '/devices',
  DEVICE_PAIR: '/devices/pair',
  DEVICE_BY_ID: (id: string) => `/devices/${id}`,
  REPORTS_DAILY: (babyId: string) => `/babies/${babyId}/reports/daily`,
  REPORTS_WEEKLY: (babyId: string) => `/babies/${babyId}/reports/weekly`,
  NOTIFICATIONS: '/notifications',
  NOTIFICATION_READ: (id: string) => `/notifications/${id}/read`,
} as const;

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'lullaby_access_token',
  REFRESH_TOKEN: 'lullaby_refresh_token',
  USER: 'lullaby_user',
} as const;

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: object;
  params?: Record<string, string | number>;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, params } = options;

  let url = `${BASE_URL}${endpoint}`;
  if (params) {
    const query = Object.entries(params)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');
    url = `${url}?${query}`;
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  const token = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      const newToken = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
      headers['Authorization'] = `Bearer ${newToken}`;
      const retry = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!retry.ok) throw new ApiError('Session expired', 401);
      return retry.json();
    }
    throw new ApiError('Session expired', 401);
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new ApiError(err.message ?? `Error ${response.status}`, response.status);
  }

  if (response.status === 204) return undefined as T;
  return response.json();
}

async function tryRefreshToken(): Promise<boolean> {
  try {
    const refreshToken = await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
    if (!refreshToken) return false;
    const response = await fetch(`${BASE_URL}${ENDPOINTS.AUTH_REFRESH}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!response.ok) return false;
    const data = await response.json();
    await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, data.data.accessToken);
    await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, data.data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

export class ApiError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}