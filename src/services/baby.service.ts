// ─────────────────────────────────────────────
//  LULLABY — Baby Service
// ─────────────────────────────────────────────

import { apiRequest, ENDPOINTS } from './api';
import { MOCK_BABIES, mockDelay } from '../constants/mockData';
import { Baby, AddBabyPayload, ApiResponse } from '../types';

const USE_MOCK = true;

export const babyService = {
  getBabies: async (): Promise<Baby[]> => {
    if (USE_MOCK) { await mockDelay(500); return MOCK_BABIES; }
    const res = await apiRequest<ApiResponse<Baby[]>>(ENDPOINTS.BABIES);
    return res.data;
  },

  getBabyById: async (id: string): Promise<Baby> => {
    if (USE_MOCK) {
      await mockDelay(400);
      const baby = MOCK_BABIES.find((b) => b.id === id);
      if (!baby) throw new Error('Baby not found');
      return baby;
    }
    const res = await apiRequest<ApiResponse<Baby>>(ENDPOINTS.BABY_BY_ID(id));
    return res.data;
  },

  addBaby: async (payload: AddBabyPayload): Promise<Baby> => {
    if (USE_MOCK) {
      await mockDelay(700);
      const newBaby: Baby = {
        id: `baby_${Date.now()}`,
        ...payload,
        parentId: 'user_001',
        createdAt: new Date().toISOString(),
      };
      MOCK_BABIES.push(newBaby);
      return newBaby;
    }
    const res = await apiRequest<ApiResponse<Baby>>(
      ENDPOINTS.BABIES, { method: 'POST', body: payload }
    );
    return res.data;
  },

  updateBaby: async (id: string, payload: Partial<AddBabyPayload>): Promise<Baby> => {
    if (USE_MOCK) {
      await mockDelay(600);
      const index = MOCK_BABIES.findIndex((b) => b.id === id);
      if (index === -1) throw new Error('Baby not found');
      MOCK_BABIES[index] = { ...MOCK_BABIES[index], ...payload };
      return MOCK_BABIES[index];
    }
    const res = await apiRequest<ApiResponse<Baby>>(
      ENDPOINTS.BABY_BY_ID(id), { method: 'PUT', body: payload }
    );
    return res.data;
  },

  deleteBaby: async (id: string): Promise<void> => {
    if (USE_MOCK) {
      await mockDelay(500);
      const index = MOCK_BABIES.findIndex((b) => b.id === id);
      if (index !== -1) MOCK_BABIES.splice(index, 1);
      return;
    }
    await apiRequest(ENDPOINTS.BABY_BY_ID(id), { method: 'DELETE' });
  },
};