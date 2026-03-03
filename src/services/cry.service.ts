// ─────────────────────────────────────────────
//  LULLABY — Cry Detection Service
// ─────────────────────────────────────────────

import { apiRequest, ENDPOINTS } from './api';
import { MOCK_CRY_EVENTS, CRY_REASON_META, mockDelay } from '../constants/mockData';
import { CryEvent, CryReasonMeta, ApiResponse, PaginatedResponse } from '../types';

const USE_MOCK = true;

export const cryService = {
  getCryEvents: async (babyId: string, page = 1, pageSize = 20): Promise<PaginatedResponse<CryEvent>> => {
    if (USE_MOCK) {
      await mockDelay(500);
      const filtered = MOCK_CRY_EVENTS.filter((e) => e.babyId === babyId);
      const start = (page - 1) * pageSize;
      const items = filtered.slice(start, start + pageSize);
      return { items, total: filtered.length, page, pageSize, hasMore: start + pageSize < filtered.length };
    }
    const res = await apiRequest<ApiResponse<PaginatedResponse<CryEvent>>>(
      ENDPOINTS.CRY_EVENTS(babyId), { params: { page, pageSize } }
    );
    return res.data;
  },

  getLatestCryEvent: async (babyId: string): Promise<CryEvent | null> => {
    if (USE_MOCK) {
      await mockDelay(300);
      const events = MOCK_CRY_EVENTS.filter((e) => e.babyId === babyId);
      return events.length > 0 ? events[0] : null;
    }
    const res = await apiRequest<ApiResponse<CryEvent | null>>(ENDPOINTS.CRY_LATEST(babyId));
    return res.data;
  },

  getCryReasonMeta: (reason: string): CryReasonMeta => {
    return CRY_REASON_META[reason] ?? CRY_REASON_META.unknown;
  },

  getAllCryReasonsMeta: (): CryReasonMeta[] => {
    return Object.values(CRY_REASON_META);
  },
};