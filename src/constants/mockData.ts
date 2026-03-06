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
    name: 'Muhammad',
    gender: 'boy',
    dateOfBirth: '2024-06-10T00:00:00Z',
    weight: 4.2,
    height: 56,
    bloodType: 'A+',
    parentId: 'user_001',
    deviceId: 'device_001',
    createdAt: '2024-06-10T08:00:00Z',
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

// ── Vaccinations ─────────────────────────────

export interface Vaccine {
  id: string;
  name: string;
  description: string;
  ageMonths: number; // age in months when due
  doses: number;
  disease: string;
}

export interface VaccinationRecord {
  id: string;
  babyId: string;
  vaccineId: string;
  vaccineName: string;
  doseNumber: number;
  scheduledDate: string;
  administeredDate?: string;
  status: 'upcoming' | 'completed' | 'overdue' | 'skipped';
  notes?: string;
  location?: string;
}

export const VACCINATION_SCHEDULE: Vaccine[] = [
  { id: 'v1', name: 'BCG', description: 'Bacillus Calmette-Guérin', ageMonths: 0, doses: 1, disease: 'Tuberculosis' },
  { id: 'v2', name: 'Hepatitis B', description: 'HBV vaccine', ageMonths: 0, doses: 3, disease: 'Hepatitis B' },
  { id: 'v3', name: 'OPV', description: 'Oral Polio Vaccine', ageMonths: 2, doses: 4, disease: 'Poliomyelitis' },
  { id: 'v4', name: 'DTaP', description: 'Diphtheria, Tetanus & Pertussis', ageMonths: 2, doses: 5, disease: 'Diphtheria / Tetanus / Whooping Cough' },
  { id: 'v5', name: 'Hib', description: 'Haemophilus influenzae type b', ageMonths: 2, doses: 3, disease: 'Meningitis' },
  { id: 'v6', name: 'PCV', description: 'Pneumococcal Conjugate Vaccine', ageMonths: 2, doses: 3, disease: 'Pneumonia' },
  { id: 'v7', name: 'Rotavirus', description: 'Rotavirus vaccine', ageMonths: 2, doses: 2, disease: 'Rotavirus gastroenteritis' },
  { id: 'v8', name: 'MMR', description: 'Measles, Mumps & Rubella', ageMonths: 12, doses: 2, disease: 'Measles / Mumps / Rubella' },
  { id: 'v9', name: 'Varicella', description: 'Chickenpox vaccine', ageMonths: 12, doses: 2, disease: 'Chickenpox' },
  { id: 'v10', name: 'Hepatitis A', description: 'HAV vaccine', ageMonths: 12, doses: 2, disease: 'Hepatitis A' },
  { id: 'v11', name: 'Influenza', description: 'Flu vaccine (annual)', ageMonths: 6, doses: 1, disease: 'Influenza' },
  { id: 'v12', name: 'Meningococcal', description: 'MenACWY vaccine', ageMonths: 11, doses: 2, disease: 'Meningitis' },
];

export const MOCK_VACCINATION_RECORDS: VaccinationRecord[] = [
  { id: 'vr1', babyId: 'baby_001', vaccineId: 'v1', vaccineName: 'BCG', doseNumber: 1, scheduledDate: '2024-06-10', administeredDate: '2024-06-10', status: 'completed', location: 'City Hospital', notes: 'No adverse reactions' },
  { id: 'vr2', babyId: 'baby_001', vaccineId: 'v2', vaccineName: 'Hepatitis B', doseNumber: 1, scheduledDate: '2024-06-10', administeredDate: '2024-06-10', status: 'completed', location: 'City Hospital' },
  { id: 'vr3', babyId: 'baby_001', vaccineId: 'v3', vaccineName: 'OPV', doseNumber: 1, scheduledDate: '2024-08-10', administeredDate: '2024-08-12', status: 'completed', location: 'Pediatric Clinic' },
  { id: 'vr4', babyId: 'baby_001', vaccineId: 'v4', vaccineName: 'DTaP', doseNumber: 1, scheduledDate: '2024-08-10', administeredDate: '2024-08-12', status: 'completed', location: 'Pediatric Clinic' },
  { id: 'vr5', babyId: 'baby_001', vaccineId: 'v5', vaccineName: 'Hib', doseNumber: 1, scheduledDate: '2024-08-10', status: 'overdue' },
  { id: 'vr6', babyId: 'baby_001', vaccineId: 'v6', vaccineName: 'PCV', doseNumber: 1, scheduledDate: '2024-08-10', status: 'overdue' },
  { id: 'vr7', babyId: 'baby_001', vaccineId: 'v7', vaccineName: 'Rotavirus', doseNumber: 1, scheduledDate: '2024-08-10', status: 'overdue' },
  { id: 'vr8', babyId: 'baby_001', vaccineId: 'v2', vaccineName: 'Hepatitis B', doseNumber: 2, scheduledDate: '2024-10-10', status: 'upcoming' },
  { id: 'vr9', babyId: 'baby_001', vaccineId: 'v11', vaccineName: 'Influenza', doseNumber: 1, scheduledDate: '2024-12-10', status: 'upcoming' },
  { id: 'vr10', babyId: 'baby_001', vaccineId: 'v8', vaccineName: 'MMR', doseNumber: 1, scheduledDate: '2025-06-10', status: 'upcoming' },
];

// ── Assistant Messages ────────────────────────

export interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const MOCK_ASSISTANT_RESPONSES: Record<string, string> = {
  default: "I'm your baby care assistant! I can help with feeding schedules, sleep tips, cry interpretation, vaccination info, and general baby health questions. What would you like to know?",
  hungry: "Newborns typically feed every 2-3 hours (8-12 times/day). Watch for hunger cues: rooting, sucking motions, or putting hands to mouth. Crying is actually a late hunger signal — try to feed before they cry.",
  sleep: "Newborns sleep 14-17 hours/day in short stretches. Safe sleep: always place baby on their back on a firm flat surface. No pillows, blankets, or toys in the crib. A consistent bedtime routine helps develop good sleep habits.",
  cry: "Common reasons babies cry: hunger (most common), wet/dirty diaper, too hot/cold, wanting comfort, overtired, gas or colic. Try feeding first, then check diaper, then comfort holding. Our cry detection feature can help identify the cause!",
  vaccination: "Keeping up with vaccinations is crucial. Our vaccination tracker shows your baby's schedule. Common reactions after vaccines include mild fever, fussiness, and soreness at the injection site — these are normal and resolve in 1-2 days.",
  fever: "For babies under 3 months: any fever (38°C/100.4°F or higher) is a medical emergency — call your doctor immediately. For older babies: monitor and consult your pediatrician if fever is above 38.5°C, lasts more than 2 days, or baby seems very unwell.",
  feeding: "Breast milk or formula is the only nutrition needed for the first 6 months. Start solid foods around 6 months with single-ingredient purees. Introduce one new food at a time and wait 3-5 days before introducing another to watch for allergies.",
  growth: "Babies typically double birth weight by 4-6 months and triple it by 12 months. They grow about 2.5cm per month in the first 6 months. Regular pediatric check-ups track your baby's growth on developmental charts.",
  colic: "Colic is defined as crying for more than 3 hours/day, 3+ days/week, in an otherwise healthy baby. It typically peaks at 6 weeks and resolves by 3-4 months. Try: gripe water, gentle tummy massage, white noise, or the 5 S's (swaddle, side/stomach position, shush, swing, suck).",
};

export const SUGGESTED_QUESTIONS = [
  "Why is my baby crying?",
  "How often should I feed?",
  "How much should my baby sleep?",
  "When are the next vaccinations?",
  "Baby has a fever, what do I do?",
  "When to start solid foods?",
  "What is colic?",
  "Is my baby's growth normal?",
];