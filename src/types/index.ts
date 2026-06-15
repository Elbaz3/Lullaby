// ─────────────────────────────────────────────
//  LULLABY — TypeScript Types
//  User shape matches real backend response
// ─────────────────────────────────────────────

// ── User ──────────────────────────────────────
// Matches what your backend returns inside data.user
export interface User {
  id:           string;
  name:         string;
  email:        string;
  phone:        string;
  avatar:       string | null;
  country:      string | null;
  dateOfBirth?: string | null;   // ISO date string
  fullName?:    string;          // alias — some places use this
  createdAt?:   string;
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
export type Gender    = 'male' | 'female';    // backend uses male/female
export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export interface Baby {
  // Backend fields — exact names from API response
  _id?:        string;       // MongoDB _id
  id:          string;       // same as _id (backend sends both)
  identity?:   string;       // parentId in backend
  name:        string;
  gender:      Gender;
  dateBirth:   string;       // ISO date string  e.g. "2025-02-10T00:00:00.000Z"
  height?:     number;
  weight?:     number;       // GET returns 'weight' (fixed in backend)
  wight?:      number;       // POST/PATCH sends 'wight' (backend typo — keep for writes)
  bloodType?:  BloodType;
  avatar?:     string | null; // full URL e.g. "http://63.179.148.169/uploads/..."
  deviceId?:   string;
  predictions?: any[];
  createdAt?:  string;
  updatedAt?:  string;
  __v?:        number;
}

// What we send TO the backend
export interface AddBabyPayload {
  name:       string;
  gender:     Gender;       // 'male' | 'female'
  dateBirth:  string;       // format: YYYY-MM-DD
  height?:    number;
  wight?:     number;       // ⚠️ backend typo — must match exactly
  bloodType?: string;
  avatar?:    string;       // handled separately as multipart
}

// ── Sensors ───────────────────────────────────
export interface AirQuality {
  aqi:         number;
  humidity:    number;
  temperature: number;
  co2:         number;
  pm25?:       number;
  status?:     string;
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

export interface CryReasonMeta {
  reason:      string;
  label:       string;
  emoji:       string;
  color:       string;
  description: string;
  suggestion:  string;
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
  avgBreathingRate: number;
  avgOxygenLevel: number;
  sleepDuration:  number; // minutes
  airQualityAvg:  number;
  overallScore:   number;
  hourlyData:     { hour: number; cryCount: number; heartRate: number; temperature: number }[];
  /** Optional breakdown for reports / PDF mock */
  cryReasonBreakdown?: { reason: string; count: number }[];
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


// ── Vaccination (real backend shape) ─────────
export interface VaccineInfo {
  _id:         string;
  id:          string;
  name:        string;
  ageRequired: number;   // months
  dose:        number;
  vaccineType: string;   // 'live' | 'inactivated' | etc.
  description: string;
  isBooster:   boolean;
  repeat:      boolean;
}

export interface VaccinationRecord {
  _id:           string;
  id:            string;
  isTaken:       boolean;
  scheduledDate: string;   // ISO
  vaccine:       VaccineInfo;
  createdAt:     string;
  updatedAt:     string;
  // derived on client — not from backend
  status?: 'upcoming' | 'done' | 'overdue';   // matches backend filter strings exactly
}

// ── Navigation Param Lists ────────────────────
export type AuthStackParamList = {
  Splash:              undefined;
  Welcome:             undefined;
  Login:               undefined;
  Register:            undefined;
  OTPVerification:     { identifier: string; reason: 'verify' | 'reset'; mode: 'register' | 'forgot' };
  ForgotPassword:      undefined;
  NewPassword:         { identifier: string; otp: string };
  VerificationSuccess: undefined;
};

export type AppStackParamList = {
  Home:        undefined;
  Babies:      undefined;
  BabyDetail:  { babyId: string };
  AddBaby:     { babyId?: string } | undefined;
  Vaccination: { babyId: string };
  Reports:     undefined;
  Settings:    undefined;
  Profile:     undefined;
  ChangePassword: undefined;
  Notifications:  undefined;
  Assistant:   undefined;
  CryDetection: undefined;
};