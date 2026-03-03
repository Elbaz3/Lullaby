// ─────────────────────────────────────────────
//  LULLABY — Sensor Service
// ─────────────────────────────────────────────

import { apiRequest, ENDPOINTS } from './api';
import { MOCK_SENSOR_READING, MOCK_DEVICE, mockDelay } from '../constants/mockData';
import { SensorReading, Device, ApiResponse } from '../types';

const USE_MOCK = true;

const jitter = (base: number, range: number) =>
  parseFloat((base + (Math.random() - 0.5) * range).toFixed(1));

export const sensorService = {
  getLatestReading: async (babyId: string): Promise<SensorReading> => {
    if (USE_MOCK) {
      await mockDelay(300);
      return {
        ...MOCK_SENSOR_READING,
        babyId,
        timestamp: new Date().toISOString(),
        temperature: jitter(36.8, 0.4),
        heartRate: Math.round(jitter(128, 8)),
        breathingRate: Math.round(jitter(42, 4)),
        oxygenLevel: Math.round(jitter(98, 2)),
        airQuality: {
          ...MOCK_SENSOR_READING.airQuality,
          humidity: Math.round(jitter(55, 5)),
          aqi: Math.round(jitter(42, 10)),
        },
      };
    }
    const res = await apiRequest<ApiResponse<SensorReading>>(ENDPOINTS.SENSOR_LATEST(babyId));
    return res.data;
  },

  getReadingHistory: async (babyId: string, hours = 24): Promise<SensorReading[]> => {
    if (USE_MOCK) {
      await mockDelay(600);
      return Array.from({ length: hours }, (_, i) => ({
        ...MOCK_SENSOR_READING,
        id: `reading_hist_${i}`,
        babyId,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * (hours - i)).toISOString(),
        temperature: jitter(36.8, 0.5),
        heartRate: Math.round(jitter(128, 15)),
        breathingRate: Math.round(jitter(42, 6)),
        oxygenLevel: Math.round(jitter(98, 3)),
        airQuality: { ...MOCK_SENSOR_READING.airQuality, aqi: Math.round(jitter(42, 20)) },
      }));
    }
    const res = await apiRequest<ApiResponse<SensorReading[]>>(
      ENDPOINTS.SENSOR_HISTORY(babyId), { params: { hours } }
    );
    return res.data;
  },

  getDevice: async (babyId: string): Promise<Device | null> => {
    if (USE_MOCK) {
      await mockDelay(400);
      if (babyId === 'baby_001') return MOCK_DEVICE;
      return null;
    }
    const res = await apiRequest<ApiResponse<Device | null>>(ENDPOINTS.BABY_SENSORS(babyId));
    return res.data;
  },
};