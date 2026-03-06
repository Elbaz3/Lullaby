// ─────────────────────────────────────────────
//  LULLABY — Vaccination Service
// ─────────────────────────────────────────────

import { apiRequest, ENDPOINTS } from './api';
import {
  MOCK_VACCINATION_RECORDS,
  VACCINATION_SCHEDULE,
  VaccinationRecord,
  Vaccine,
} from '../constants/mockData';

const USE_MOCK = true;

export const vaccinationService = {
  getRecords: async (babyId: string): Promise<VaccinationRecord[]> => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 400));
      return MOCK_VACCINATION_RECORDS.filter(r => r.babyId === babyId);
    }
    const res = await apiRequest<{ data: VaccinationRecord[] }>(
      `/babies/${babyId}/vaccinations`
    );
    return res.data;
  },

  getSchedule: (): Vaccine[] => VACCINATION_SCHEDULE,

  markCompleted: async (
    recordId: string,
    data: { administeredDate: string; location?: string; notes?: string }
  ): Promise<VaccinationRecord> => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 500));
      const record = MOCK_VACCINATION_RECORDS.find(r => r.id === recordId);
      if (!record) throw new Error('Record not found');
      Object.assign(record, { ...data, status: 'completed' });
      return record;
    }
    const res = await apiRequest<{ data: VaccinationRecord }>(
      `/vaccinations/${recordId}/complete`,
      { method: 'POST', body: data }
    );
    return res.data;
  },

  getStats: (records: VaccinationRecord[]) => {
    const completed = records.filter(r => r.status === 'completed').length;
    const overdue = records.filter(r => r.status === 'overdue').length;
    const upcoming = records.filter(r => r.status === 'upcoming').length;
    const total = records.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, overdue, upcoming, total, percentage };
  },
};
