// ─────────────────────────────────────────────
//  LULLABY — Mock Data
//  Updated to match real backend field names exactly.
//  Used only where real API is not yet wired up.
// ─────────────────────────────────────────────

import {
  User,
  Baby,
  CryEvent,
  SensorReading,
  Device,
  DailyReport,
  CryReasonMeta,
} from '../types';

// ── Delay helper ──────────────────────────────
export const mockDelay = (ms = 600) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// ── Auth ──────────────────────────────────────
// Matches real backend User shape: name (not fullName), no accessToken/refreshToken
export const MOCK_USER: User = {
  id:          'user_001',
  name:        'Ahmed Elbaz',
  email:       'ahmed@example.com',
  phone:       '+201000000000',
  avatar:      null,
  country:     null,
  dateOfBirth: null,
  createdAt:   '2024-01-15T10:00:00Z',
};

// ── Babies ────────────────────────────────────
// Matches real backend Baby shape:
//   gender: 'male'|'female', dateBirth (not dateOfBirth),
//   wight (backend typo), weight (GET response), no parentId/deviceId
export const MOCK_BABIES: Baby[] = [
  {
    id:        'baby_001',
    name:      'Muhammad',
    gender:    'male',
    dateBirth: '2024-06-10T00:00:00.000Z',
    weight:    4.2,
    wight:     4.2,
    height:    56,
    bloodType: 'A+',
    avatar:    null,
    predictions: [],
  },
];

// ── Sensors & Device ──────────────────────────
export const MOCK_DEVICE: Device = {
  id:              'device_001',
  name:            'Lullaby Bassinet Sensor',
  model:           'LB-1',
  batteryLevel:    82,
  isConnected:     true,
  lastSeen:        new Date().toISOString(),
  sensors: [
    { type: 'temperature', status: 'active',   lastReading: new Date().toISOString() },
    { type: 'heart_rate',  status: 'active',   lastReading: new Date().toISOString() },
    { type: 'breathing',   status: 'active',   lastReading: new Date().toISOString() },
    { type: 'microphone',  status: 'inactive', lastReading: undefined },
    { type: 'air_quality', status: 'active',   lastReading: new Date().toISOString() },
  ],
};

// ── Live Sensor Reading ───────────────────────
export const MOCK_SENSOR_READING: SensorReading = {
  id:            'reading_001',
  babyId:        'baby_001',
  timestamp:     new Date().toISOString(),
  temperature:   36.8,
  heartRate:     128,
  breathingRate: 42,
  oxygenLevel:   98,
  airQuality: {
    co2:         412,
    humidity:    55,
    temperature: 22.4,
    pm25:        8,
    aqi:         42,
    status:      'good',
  },
};

// ── Cry Events ────────────────────────────────
export const MOCK_CRY_EVENTS: CryEvent[] = [
  { id: 'cry_001', babyId: 'baby_001', reason: 'hungry',          confidence: 0.92, duration: 145, timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString() },
  { id: 'cry_002', babyId: 'baby_001', reason: 'discomfort',      confidence: 0.78, duration: 68,  timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
  { id: 'cry_003', babyId: 'baby_001', reason: 'tired',           confidence: 0.85, duration: 200, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
  { id: 'cry_004', babyId: 'baby_001', reason: 'pain',            confidence: 0.65, duration: 320, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString() },
  { id: 'cry_005', babyId: 'baby_001', reason: 'needs_attention', confidence: 0.80, duration: 55,  timestamp: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString() },
];

// ── Cry Reason Metadata ───────────────────────
export const CRY_REASON_META: Record<string, CryReasonMeta> = {
  hungry: {
    reason: 'hungry', label: 'Hungry', emoji: '🍼', color: '#FF9800',
    description: 'Baby shows signs of hunger — rhythmic, low-pitched cry.',
    suggestion:  'Try feeding your baby now. Last feed was ~3 hours ago.',
  },
  pain: {
    reason: 'pain', label: 'Pain', emoji: '💢', color: '#F44336',
    description: 'High-pitched, sudden onset cry — may indicate discomfort or pain.',
    suggestion:  'Check for gas, fever, or physical discomfort. Consult a doctor if persistent.',
  },
  tired: {
    reason: 'tired', label: 'Tired', emoji: '😴', color: '#7E57C2',
    description: 'Whiny, building cry — baby is overtired and needs sleep.',
    suggestion:  'Create a calm environment. Dim lights, reduce noise, and soothe to sleep.',
  },
  discomfort: {
    reason: 'discomfort', label: 'Discomfort', emoji: '😣', color: '#FF7043',
    description: 'Fussy cry — could be a wet diaper, tight clothing, or temperature.',
    suggestion:  'Check diaper, clothing, and room temperature. Adjust as needed.',
  },
  needs_attention: {
    reason: 'needs_attention', label: 'Needs Attention', emoji: '🤗', color: '#26A69A',
    description: 'Social cry — baby wants comfort, holding, or interaction.',
    suggestion:  'Pick up and hold your baby. A little comfort goes a long way.',
  },
  belly_pain: {
    reason: 'belly_pain', label: 'Belly Pain', emoji: '🤱', color: '#FF9800',
    description: 'Colic or gas pain — intense, inconsolable crying.',
    suggestion:  'Try gentle tummy massage or bicycle leg movements to relieve gas.',
  },
  cold: {
    reason: 'cold', label: 'Too Cold', emoji: '🥶', color: '#42A5F5',
    description: 'Baby may be feeling cold — check temperature readings.',
    suggestion:  'Add an extra layer or adjust room temperature above 20°C.',
  },
  hot: {
    reason: 'hot', label: 'Too Hot', emoji: '🥵', color: '#EF5350',
    description: 'Baby may be overheating — check temperature readings.',
    suggestion:  'Remove a layer and ensure adequate ventilation.',
  },
  unknown: {
    reason: 'unknown', label: 'Unknown', emoji: '❓', color: '#8FA3B8',
    description: 'Unable to determine reason with high confidence.',
    suggestion:  'Monitor your baby closely and try common comfort techniques.',
  },
};

// ── Daily Report ──────────────────────────────
export const MOCK_DAILY_REPORT: DailyReport = {
  babyId:           'baby_001',
  date:             new Date().toISOString().split('T')[0],
  totalCryEvents:   5,
  avgHeartRate:     128,
  avgTemperature:   36.7,
  avgOxygenLevel:   98,
  avgBreathingRate: 41,
  sleepDuration:    13 * 60,
  airQualityAvg:    42,
  overallScore:     85,
  hourlyData: Array.from({ length: 24 }, (_, hour) => ({
    hour,
    heartRate:   120 + Math.floor(Math.random() * 20),
    temperature: 36.4 + Math.random() * 0.8,
    cryCount:    Math.random() > 0.75 ? 1 : 0,
  })),
  cryReasonBreakdown: [
    { reason: 'hungry', count: 2 },
    { reason: 'tired', count: 2 },
    { reason: 'unknown', count: 1 },
  ],
};

/** Mock rows for Reports screen (shape matches UI expectations) */
export const MOCK_VACCINATION_RECORDS: {
  id: string;
  vaccineName: string;
  doseNumber: number;
  scheduledDate: string;
  administeredDate?: string;
  status: 'completed' | 'overdue' | 'upcoming';
}[] = [
  { id: 'vr1', vaccineName: 'BCG', doseNumber: 1, scheduledDate: '2024-06-15', administeredDate: '2024-06-15', status: 'completed' },
  { id: 'vr2', vaccineName: 'Hep B', doseNumber: 1, scheduledDate: '2024-07-01', status: 'upcoming' },
  { id: 'vr3', vaccineName: 'DTaP', doseNumber: 1, scheduledDate: '2024-05-01', status: 'overdue' },
];

// ── Notifications ─────────────────────────────
export const MOCK_NOTIFICATIONS = [
  { id: 'notif_001', type: 'cry'    as const, title: 'Baby is crying',          body: 'Muhammad might be hungry — 92% confidence',     timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),        read: false },
  { id: 'notif_002', type: 'sensor' as const, title: 'Heart rate spike',         body: 'Heart rate briefly elevated to 158 bpm',         timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),        read: true  },
  { id: 'notif_003', type: 'report' as const, title: "Today's report is ready",  body: 'Muhammad had a good day — 5 cry events detected', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),    read: true  },
];

// ── Vaccination schedule reference (UI only) ──
// These are NOT sent to backend — backend auto-creates
// vaccination records when a baby is added.
export interface Vaccine {
  id:          string;
  name:        string;
  description: string;
  ageMonths:   number;
  doses:       number;
  disease:     string;
}

export const VACCINATION_SCHEDULE: Vaccine[] = [
  { id: 'v1',  name: 'BCG',           description: 'Bacillus Calmette-Guérin',            ageMonths: 0,  doses: 1, disease: 'Tuberculosis' },
  { id: 'v2',  name: 'Hepatitis B',   description: 'HBV vaccine',                         ageMonths: 0,  doses: 3, disease: 'Hepatitis B' },
  { id: 'v3',  name: 'OPV',           description: 'Oral Polio Vaccine',                  ageMonths: 2,  doses: 4, disease: 'Poliomyelitis' },
  { id: 'v4',  name: 'DTaP',          description: 'Diphtheria, Tetanus & Pertussis',     ageMonths: 2,  doses: 5, disease: 'Diphtheria / Tetanus / Whooping Cough' },
  { id: 'v5',  name: 'Hib',           description: 'Haemophilus influenzae type b',       ageMonths: 2,  doses: 3, disease: 'Meningitis' },
  { id: 'v6',  name: 'PCV',           description: 'Pneumococcal Conjugate Vaccine',      ageMonths: 2,  doses: 3, disease: 'Pneumonia' },
  { id: 'v7',  name: 'Rotavirus',     description: 'Rotavirus vaccine',                   ageMonths: 2,  doses: 2, disease: 'Rotavirus gastroenteritis' },
  { id: 'v8',  name: 'MMR',           description: 'Measles, Mumps & Rubella',            ageMonths: 12, doses: 2, disease: 'Measles / Mumps / Rubella' },
  { id: 'v9',  name: 'Varicella',     description: 'Chickenpox vaccine',                  ageMonths: 12, doses: 2, disease: 'Chickenpox' },
  { id: 'v10', name: 'Hepatitis A',   description: 'HAV vaccine',                         ageMonths: 12, doses: 2, disease: 'Hepatitis A' },
  { id: 'v11', name: 'Influenza',     description: 'Flu vaccine (annual)',                ageMonths: 6,  doses: 1, disease: 'Influenza' },
  { id: 'v12', name: 'Meningococcal', description: 'MenACWY vaccine',                     ageMonths: 11, doses: 2, disease: 'Meningitis' },
];

// ── Assistant ─────────────────────────────────
export interface AssistantMessage {
  id:        string;
  role:      'user' | 'assistant';
  content:   string;
  timestamp: string;
}

export const MOCK_ASSISTANT_RESPONSES: Record<string, string> = {
  default:      "I'm your baby care assistant! I can help with feeding schedules, sleep tips, cry interpretation, vaccination info, and general baby health questions. What would you like to know?",
  hungry:       "Newborns typically feed every 2-3 hours (8-12 times/day). Watch for hunger cues: rooting, sucking motions, or putting hands to mouth. Crying is a late hunger signal — try to feed before they cry.",
  sleep:        "Newborns sleep 14-17 hours/day in short stretches. Safe sleep: always place baby on their back on a firm flat surface. No pillows, blankets, or toys in the crib.",
  cry:          "Common reasons babies cry: hunger, wet diaper, too hot/cold, wanting comfort, overtired, gas or colic. Our cry detection feature can help identify the cause!",
  vaccination:  "Keeping up with vaccinations is crucial. Common reactions after vaccines include mild fever and fussiness — these are normal and resolve in 1-2 days.",
  fever:        "For babies under 3 months: any fever (38°C/100.4°F or higher) is a medical emergency — call your doctor immediately.",
  feeding:      "Breast milk or formula is the only nutrition needed for the first 6 months. Start solid foods around 6 months with single-ingredient purees.",
  growth:       "Babies typically double birth weight by 4-6 months and triple it by 12 months. Regular pediatric check-ups track growth on developmental charts.",
  colic:        "Colic is defined as crying for more than 3 hours/day, 3+ days/week, in an otherwise healthy baby. It typically peaks at 6 weeks and resolves by 3-4 months.",
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