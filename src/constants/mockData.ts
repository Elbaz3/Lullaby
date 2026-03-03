// ─────────────────────────────────────────────
//  LULLABY — Mock Data
//  Replace service calls with real API when backend is ready.
//  Each mock function mirrors the real service signature.
// ─────────────────────────────────────────────

import {
  User,
  Baby,
  CryEvent,
  SensorReading,
  Device,
  DailyReport,
  CryReasonMeta,
  AuthTokens,
} from '../types';

// ── Delay helper (simulates network latency) ──
export const mockDelay = (ms = 600) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// ── Auth ─────────────────────────────────────

export const MOCK_USER: User = {
  id: 'user_001',
  fullName: 'Emma Johnson',
  email: 'emma@example.com',
  avatar: undefined,
  createdAt: '2024-01-15T10:00:00Z',
};

export const MOCK_TOKENS: AuthTokens = {
  accessToken: 'mock_access_token_abc123',
  refreshToken: 'mock_refresh_token_xyz789',
};

// ── Babies ───────────────────────────────────

export const MOCK_BABIES: Baby[] = [
  {
    id: 'baby_001',
    name: 'Ahmed',
    gender: 'boy',
    dateOfBirth: '2024-06-10T00:00:00Z',
    weight: 4.2,
    height: 56,
    bloodType: 'A+',
    parentId: 'user_001',
    deviceId: 'device_001',
    createdAt: '2024-06-10T08:00:00Z',
  },
  {
    id: 'baby_002',
    name: 'mariam',
    gender: 'girl',
    dateOfBirth: '2024-09-22T00:00:00Z',
    weight: 3.8,
    height: 52,
    bloodType: 'O+',
    parentId: 'user_001',
    deviceId: undefined,
    createdAt: '2024-09-22T08:00:00Z',
  },
  
];

// ── Sensors & Device ─────────────────────────

export const MOCK_DEVICE: Device = {
  id: 'device_001',
  name: 'Lullaby Bassinet Sensor',
  macAddress: 'AA:BB:CC:DD:EE:FF',
  firmwareVersion: '1.2.4',
  batteryLevel: 82,
  isConnected: true,
  babyId: 'baby_001',
  sensors: [
    {
      id: 'sensor_temp',
      type: 'temperature',
      label: 'Temperature Sensor',
      status: 'connected',
      lastReading: new Date().toISOString(),
      batteryLevel: 90,
    },
    {
      id: 'sensor_heart',
      type: 'heart_rate',
      label: 'Heart Beat Sensor',
      status: 'connected',
      lastReading: new Date().toISOString(),
      batteryLevel: 85,
    },
    {
      id: 'sensor_breath',
      type: 'breathing',
      label: 'Breathing Sensor',
      status: 'connected',
      lastReading: new Date().toISOString(),
      batteryLevel: 88,
    },
    {
      id: 'sensor_mic',
      type: 'microphone',
      label: 'Microphone Sensor',
      status: 'disconnected',
      lastReading: undefined,
      batteryLevel: undefined,
    },
    {
      id: 'sensor_air',
      type: 'air_quality',
      label: 'Air Quality Sensor',
      status: 'connected',
      lastReading: new Date().toISOString(),
      batteryLevel: 76,
    },
  ],
};

// ── Live Sensor Reading ───────────────────────

export const MOCK_SENSOR_READING: SensorReading = {
  id: 'reading_001',
  babyId: 'baby_001',
  timestamp: new Date().toISOString(),
  temperature: 36.8,
  heartRate: 128,
  breathingRate: 42,
  oxygenLevel: 98,
  airQuality: {
    co2: 412,
    humidity: 55,
    temperature: 22.4,
    pm25: 8,
    aqi: 42,
    status: 'good',
  },
};

// ── Cry Events ───────────────────────────────

export const MOCK_CRY_EVENTS: CryEvent[] = [
  {
    id: 'cry_001',
    babyId: 'baby_001',
    reason: 'hungry',
    confidence: 92,
    duration: 145,
    timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    notes: 'Pattern matched hunger cry signature',
  },
  {
    id: 'cry_002',
    babyId: 'baby_001',
    reason: 'discomfort',
    confidence: 78,
    duration: 68,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 'cry_003',
    babyId: 'baby_001',
    reason: 'tired',
    confidence: 85,
    duration: 200,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: 'cry_004',
    babyId: 'baby_001',
    reason: 'pain',
    confidence: 65,
    duration: 320,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
  },
  {
    id: 'cry_005',
    babyId: 'baby_001',
    reason: 'needs_attention',
    confidence: 80,
    duration: 55,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
  },
];

// ── Cry Reason Metadata ───────────────────────

export const CRY_REASON_META: Record<string, CryReasonMeta> = {
  hungry: {
    reason: 'hungry',
    label: 'Hungry',
    emoji: '🍼',
    color: '#FF9800',
    description: 'Baby shows signs of hunger — rhythmic, low-pitched cry.',
    suggestion: 'Try feeding your baby now. Last feed was ~3 hours ago.',
  },
  pain: {
    reason: 'pain',
    label: 'Pain',
    emoji: '💢',
    color: '#F44336',
    description: 'High-pitched, sudden onset cry — may indicate discomfort or pain.',
    suggestion: 'Check for gas, fever, or physical discomfort. Consult a doctor if persistent.',
  },
  tired: {
    reason: 'tired',
    label: 'Tired',
    emoji: '😴',
    color: '#7E57C2',
    description: 'Whiny, building cry — baby is overtired and needs sleep.',
    suggestion: 'Create a calm environment. Dim lights, reduce noise, and soothe to sleep.',
  },
  discomfort: {
    reason: 'discomfort',
    label: 'Discomfort',
    emoji: '😣',
    color: '#FF7043',
    description: 'Fussy cry — could be a wet diaper, tight clothing, or temperature.',
    suggestion: 'Check diaper, clothing, and room temperature. Adjust as needed.',
  },
  needs_attention: {
    reason: 'needs_attention',
    label: 'Needs Attention',
    emoji: '🤗',
    color: '#26A69A',
    description: 'Social cry — baby wants comfort, holding, or interaction.',
    suggestion: 'Pick up and hold your baby. A little comfort goes a long way.',
  },
  cold: {
    reason: 'cold',
    label: 'Too Cold',
    emoji: '🥶',
    color: '#42A5F5',
    description: 'Baby may be feeling cold — check temperature readings.',
    suggestion: 'Add an extra layer or adjust room temperature above 20°C.',
  },
  hot: {
    reason: 'hot',
    label: 'Too Hot',
    emoji: '🥵',
    color: '#EF5350',
    description: 'Baby may be overheating — check temperature readings.',
    suggestion: 'Remove a layer and ensure adequate ventilation.',
  },
  unknown: {
    reason: 'unknown',
    label: 'Unknown',
    emoji: '❓',
    color: '#8FA3B8',
    description: 'Unable to determine reason with high confidence.',
    suggestion: 'Monitor your baby closely and try common comfort techniques.',
  },
};

// ── Daily Report ─────────────────────────────

export const MOCK_DAILY_REPORT: DailyReport = {
  id: 'report_001',
  babyId: 'baby_001',
  date: new Date().toISOString().split('T')[0],
  totalCryEvents: 5,
  avgHeartRate: 128,
  avgTemperature: 36.7,
  avgOxygenLevel: 98,
  avgBreathingRate: 41,
  sleepDuration: 780, // 13 hours
  avgAirQuality: 42,
  cryReasonBreakdown: [
    { reason: 'hungry', count: 2 },
    { reason: 'tired', count: 1 },
    { reason: 'discomfort', count: 1 },
    { reason: 'pain', count: 1 },
  ],
  hourlyData: Array.from({ length: 24 }, (_, hour) => ({
    hour,
    heartRate: 120 + Math.floor(Math.random() * 20),
    temperature: 36.4 + Math.random() * 0.8,
    cryCount: Math.random() > 0.75 ? 1 : 0,
  })),
};

// ── Notifications ─────────────────────────────

export const MOCK_NOTIFICATIONS = [
  {
    id: 'notif_001',
    type: 'cry' as const,
    title: 'Baby is crying',
    body: 'Muhammad might be hungry — 92% confidence',
    timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    read: false,
  },
  {
    id: 'notif_002',
    type: 'sensor' as const,
    title: 'Heart rate spike',
    body: 'Heart rate briefly elevated to 158 bpm',
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    read: true,
  },
  {
    id: 'notif_003',
    type: 'report' as const,
    title: "Today's report is ready",
    body: 'Muhammad had a good day — 5 cry events detected',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    read: true,
  },
];
