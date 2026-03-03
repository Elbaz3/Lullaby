// ─────────────────────────────────────────────
//  LULLABY — TypeScript Types
// ─────────────────────────────────────────────

// ── Auth ────────────────────────────────────

export interface User {
  id: string;
  fullName: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface OTPPayload {
  email: string;
  otp: string;
}

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

// ── Baby ────────────────────────────────────

export type BabyGender = 'boy' | 'girl';

export interface Baby {
  id: string;
  name: string;
  gender: BabyGender;
  dateOfBirth: string; // ISO string
  weight?: number; // kg
  height?: number; // cm
  bloodType?: string;
  parentId: string;
  deviceId?: string;
  avatar?: string;
  createdAt: string;
}

export interface AddBabyPayload {
  name: string;
  gender: BabyGender;
  dateOfBirth: string;
  weight?: number;
  height?: number;
  bloodType?: string;
}

// ── Cry Detection ────────────────────────────

export type CryReason =
  | 'hungry'
  | 'pain'
  | 'tired'
  | 'discomfort'
  | 'needs_attention'
  | 'cold'
  | 'hot'
  | 'unknown';

export interface CryEvent {
  id: string;
  babyId: string;
  reason: CryReason;
  confidence: number; // 0-100
  duration: number; // seconds
  timestamp: string; // ISO string
  audioClipUrl?: string;
  notes?: string;
}

export interface CryReasonMeta {
  reason: CryReason;
  label: string;
  emoji: string;
  color: string;
  description: string;
  suggestion: string;
}

// ── Sensors ─────────────────────────────────

export type SensorStatus = 'connected' | 'disconnected' | 'warning' | 'error';

export interface SensorReading {
  id: string;
  babyId: string;
  timestamp: string;
  temperature: number; // °C
  heartRate: number; // bpm
  breathingRate: number; // breaths/min
  oxygenLevel: number; // SpO2 %
  airQuality: AirQualityReading;
}

export interface AirQualityReading {
  co2: number; // ppm
  humidity: number; // %
  temperature: number; // °C
  pm25: number; // μg/m³
  aqi: number; // Air Quality Index 0-500
  status: 'good' | 'moderate' | 'poor' | 'hazardous';
}

export interface Sensor {
  id: string;
  type: 'temperature' | 'heart_rate' | 'breathing' | 'microphone' | 'air_quality';
  label: string;
  status: SensorStatus;
  lastReading?: string;
  batteryLevel?: number;
}

export interface Device {
  id: string;
  name: string;
  macAddress: string;
  firmwareVersion: string;
  batteryLevel: number;
  isConnected: boolean;
  babyId?: string;
  sensors: Sensor[];
}

// ── Reports ─────────────────────────────────

export interface DailyReport {
  id: string;
  babyId: string;
  date: string; // YYYY-MM-DD
  totalCryEvents: number;
  avgHeartRate: number;
  avgTemperature: number;
  avgOxygenLevel: number;
  avgBreathingRate: number;
  sleepDuration: number; // minutes
  avgAirQuality: number; // AQI
  cryReasonBreakdown: { reason: CryReason; count: number }[];
  hourlyData: HourlyDataPoint[];
}

export interface HourlyDataPoint {
  hour: number; // 0-23
  heartRate: number;
  temperature: number;
  cryCount: number;
}

// ── API ─────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
}

// ── Navigation ──────────────────────────────

export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
  Onboarding: undefined;
};

export type AuthStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  OTPVerification: { email: string; mode: 'register' | 'forgot' };
  NewPassword: { email: string; otp: string };
  VerificationSuccess: undefined;
};

export type AppTabParamList = {
  Home: undefined;
  Babies: undefined;
  CryDetection: undefined;
  Reports: undefined;
  Settings: undefined;
};

export type BabiesStackParamList = {
  BabyList: undefined;
  AddBaby: undefined;
  BabyDetail: { babyId: string };
};

export type HomeStackParamList = {
  HomeMain: undefined;
  SensorDetail: { sensorType: string };
};
