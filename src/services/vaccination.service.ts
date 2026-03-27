// ─────────────────────────────────────────────
//  LULLABY — Vaccination Service
//
//  Endpoint: GET /api/children/vaccines/all?type=all|upcoming|overdue|done
//  Auth:     Bearer token
//  Response: { data: { vaccines: VaccinationRecord[] } }
//
//  Strategy:
//   - On mount: fetch ?type=all once → used for stats card
//   - On tab change: fetch ?type=<tab> → used for list
//   - Status derived client-side from isTaken + scheduledDate
//     (backend filters but doesn't send a status field)
// ─────────────────────────────────────────────

import { apiRequest } from './api';
import { VaccinationRecord } from '../types';

export type VaccineFilterType = 'all' | 'upcoming' | 'overdue' | 'done';

// ── Derive display status from backend fields ─
const deriveStatus = (raw: any): 'upcoming' | 'done' | 'overdue' => {
  if (raw.isTaken) return 'done';
  const scheduled = new Date(raw.scheduledDate);
  const today     = new Date();
  today.setHours(0, 0, 0, 0);
  return scheduled < today ? 'overdue' : 'upcoming';
};

const normalize = (raw: any): VaccinationRecord => ({
  ...raw,
  id:     raw.id  ?? raw._id,
  _id:    raw._id ?? raw.id,
  status: deriveStatus(raw),
});

export const vaccinationService = {
  // ── FETCH WITH BACKEND FILTER ─────────────
  // GET /api/children/vaccines/all?type=<filterType>
  getByType: async (type: VaccineFilterType): Promise<VaccinationRecord[]> => {
    const res = await apiRequest<{ vaccines: VaccinationRecord[] }>(
      '/children/vaccines/all',
      { params: { type } }
    );
    const vaccines = (res.data as any)?.vaccines ?? [];
    return vaccines.map(normalize);
  },

  // ── BACKWARD COMPAT ALIAS ─────────────────
  // Old screens may still call getRecords(babyId) — redirect to getByType
  getRecords: async (_babyId?: string): Promise<VaccinationRecord[]> => {
    return vaccinationService.getByType('all');
  },


  // ── MARK TAKEN / UNTAKEN ──────────────────
  // PATCH /api/children/vaccines/mark-taken
  // Body: { vaccineId: string, isTaken: boolean }
  markTaken: async (vaccineId: string, isTaken: boolean): Promise<void> => {
    await apiRequest('/children/vaccines/mark-taken', {
      method: 'PATCH',
      body:   { vaccineId, isTaken },
    });
  },

  // ── STATS (derived from full list) ────────
  getStats: (records: VaccinationRecord[]) => {
    const total     = records.length;
    const done      = records.filter(r => r.status === 'done').length;
    const overdue   = records.filter(r => r.status === 'overdue').length;
    const upcoming  = records.filter(r => r.status === 'upcoming').length;
    const percentage = total > 0 ? Math.round((done / total) * 100) : 0;
    return { total, done, overdue, upcoming, percentage };
  },
};