// ─────────────────────────────────────────────
//  LULLABY — TypeScript Types
//  User shape matches real backend response
// ─────────────────────────────────────────────

// ── User ──────────────────────────────────────
// Matches what your backend returns inside data.user
export interface User {
  id:      string;
  name:    string;        // backend uses "name" not "fullName"
  email:   string;
  phone:   string;
  avatar:  string | null;
  country: string | null;
}

// ── Auth ──────────────────────────────────────
export interface AuthData {
  token: string;
  user:  User;
}

// Login — backend uses "identifier" (email or phone)
export interface LoginPayload {
  identifier:  string;
  password:    string;
  fcmToken?:   string;
  deviceType?: string;
}

// Register
export interface RegisterPayload {
  name:            string;
  email:           string;
  phone:           string;
  password:        string;
  passwordConfirm: string;
  country?:        string;   // null for now — not in DB yet
  fcmToken?:       string;
  deviceType?:     string;
}

// OTP
export interface OTPPayload {
  reason:     'verify' | 'reset';
  otp:        string;
  identifier: string; // email or phone
}

export interface RequestOTPPayload {
  reason:     'verify' | 'reset';
  identifier: string;
}

export interface ResetPasswordPayload {
  newPassword:     string;
  confirmPassword: string;
}

// ── Baby ──────────────────────────────────────
export type Gender    = 'boy' | 'girl';
export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export interface Baby {
  id:          string;
  parentId:    string;
  name:        string;
  gender:      Gender;
  dateOfBirth: string;      // ISO date string
  weight?:     number;      // kg
  height?:     number;      // cm
  bloodType?:  BloodType;
  deviceId?:   string;
  photoUrl?:   string;
  createdAt:   string;
}

export interface AddBabyPayload {
  name:        string;
  gender:      Gender;
  dateOfBirth: string;
  weight?:     number;
  height?:     number;
  bloodType?:  BloodType;
}

// ── Sensors ───────────────────────────────────
export interface AirQuality {
  aqi:         number;
  humidity:    number;
  temperature: number;
  co2:         number;
}

export interface SensorReading {
  id:            string;
  babyId:        string;
  temperature:   number;
  heartRate:     number;
  breathingRate: number;
  oxygenLevel:   number;
  airQuality:    AirQuality;
  timestamp:     string;
}

// ── Cry Detection ─────────────────────────────
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
  id:         string;
  babyId:     string;
  reason:     CryReason;
  confidence: number;     // 0-1
  duration:   number;     // seconds
  timestamp:  string;
  audioUrl?:  string;
}

// ── Device ────────────────────────────────────
export interface DeviceSensor {
  type:      string;
  status:    'active' | 'inactive' | 'error';
  lastReading?: string;
}

export interface Device {
  id:           string;
  name:         string;
  model:        string;
  batteryLevel: number;
  isConnected:  boolean;
  lastSeen:     string;
  sensors:      DeviceSensor[];
}

// ── Reports ───────────────────────────────────
export interface DailyReport {
  babyId:         string;
  date:           string;
  totalCryEvents: number;
  avgTemperature: number;
  avgHeartRate:   number;
  avgBreathing:   number;
  avgOxygen:      number;
  totalSleepHours: number;
  airQualityAvg:  number;
  overallScore:   number;
  hourlyData:     { hour: number; cryCount: number; avgTemp: number }[];
}

// ── API Helpers ───────────────────────────────
export interface ApiResponse<T> {
  success:    boolean;
  statusCode: number;
  message:    string;
  data:       T;
}

export interface PaginatedResponse<T> {
  items:    T[];
  total:    number;
  page:     number;
  pageSize: number;
  hasMore:  boolean;
}