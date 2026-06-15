// ─────────────────────────────────────────────
//  Baby growth & development — baby-routine API
// ─────────────────────────────────────────────

import { apiRequest, ENDPOINTS } from './api';

export interface PhysicalGrowthData {
  minMonth: number;
  maxMonth: number;
  overview: string;
  weight:   string;
  height:   string;
}

export interface MotorDevelopmentData {
  minMonth: number;
  maxMonth: number;
  overview: string;
  movement: string[];
}

export interface FeedingFoodGroup {
  category: string;
  items:    string[];
}

export interface FeedingData {
  minMonth: number;
  maxMonth: number;
  overview: string;
  foods:    FeedingFoodGroup[];
  notes:    string[];
}

function parseFeedingData(raw: unknown): FeedingData {
  const r = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const foodsRaw = r.foods;
  const foods: FeedingFoodGroup[] = Array.isArray(foodsRaw)
    ? foodsRaw
        .filter((g): g is Record<string, unknown> => g !== null && typeof g === 'object')
        .map((g) => ({
          category: typeof g.category === 'string' ? g.category : '',
          items: Array.isArray(g.items) ? g.items.map((x) => String(x)) : [],
        }))
        .filter((g) => g.category.length > 0 || g.items.length > 0)
    : [];
  const notesRaw = r.notes;
  const notes = Array.isArray(notesRaw) ? notesRaw.map((x) => String(x)) : [];
  return {
    minMonth: Number(r.minMonth ?? 0),
    maxMonth: Number(r.maxMonth ?? 0),
    overview: typeof r.overview === 'string' ? r.overview : '',
    foods,
    notes,
  };
}

export const babyGrowthService = {
  getPhysicalGrowth: async (month: number): Promise<PhysicalGrowthData> => {
    const res = await apiRequest<PhysicalGrowthData>(ENDPOINTS.BABY_ROUTINE_PHYSICAL_GROWTH(month));
    return res.data;
  },

  getMotorDevelopment: async (month: number): Promise<MotorDevelopmentData> => {
    const res = await apiRequest<MotorDevelopmentData>(ENDPOINTS.BABY_ROUTINE_MOTOR_DEVELOPMENT(month));
    return res.data;
  },

  getFeeding: async (month: number): Promise<FeedingData> => {
    const res = await apiRequest<unknown>(ENDPOINTS.BABY_ROUTINE_FEEDING(month));
    return parseFeedingData(res.data);
  },
};
