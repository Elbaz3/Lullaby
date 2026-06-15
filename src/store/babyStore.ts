// ─────────────────────────────────────────────
//  LULLABY — Baby Store
// ─────────────────────────────────────────────

import { create } from 'zustand';
import { babyService } from '../services/baby.service';
import { Baby, AddBabyPayload } from '../types';
import { MOCK_SENSOR_READING, MOCK_CRY_EVENTS } from '../constants/mockData';

interface BabyState {
  babies:        Baby[];
  activeBabyId:  string | null;
  activeBaby:    Baby | null;
  isLoading:     boolean;
  error:         string | null;

  // Live sensor data (still mock for now)
  latestReading:  any | null;
  latestCryEvent: any | null;
  isFetchingLive: boolean;

  fetchBabies:    ()                                                    => Promise<void>;
  setActiveBaby:  (id: string)                                          => void;
  addBaby:        (payload: Omit<AddBabyPayload, 'avatar'>, avatarUri?: string | null) => Promise<Baby>;
  updateBaby:     (id: string, payload: Partial<Omit<AddBabyPayload, 'avatar'>>, avatarUri?: string | null) => Promise<Baby>;
  deleteBaby:     (id: string)                                          => Promise<void>;
  fetchLiveData:  (babyId: string)                                      => Promise<void>;
  clearError:     ()                                                    => void;
}

export const useBabyStore = create<BabyState>((set, get) => ({
  babies:        [],
  activeBabyId:  null,
  activeBaby:    null,
  isLoading:     false,
  error:         null,
  latestReading:  null,
  latestCryEvent: null,
  isFetchingLive: false,

  // ── FETCH ALL ─────────────────────────────
  fetchBabies: async () => {
    set({ isLoading: true, error: null });
    try {
      const babies = await babyService.getBabies();
      const activeBabyId = babies.length > 0 ? babies[0].id : null;
      const activeBaby   = babies.length > 0 ? babies[0] : null;
      set({ babies, activeBabyId, activeBaby, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  // ── SET ACTIVE ────────────────────────────
  setActiveBaby: (id) => {
    const baby = get().babies.find(b => b.id === id) ?? null;
    set({ activeBabyId: id, activeBaby: baby });
  },

  // ── ADD BABY ──────────────────────────────
  addBaby: async (payload, avatarUri) => {
    set({ isLoading: true, error: null });
    try {
      const baby = await babyService.addBaby(payload, avatarUri);
      const babies = [...get().babies, baby];
      set({ babies, activeBabyId: baby.id, activeBaby: baby, isLoading: false });
      return baby;
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  // ── UPDATE BABY ───────────────────────────
  updateBaby: async (id, payload, avatarUri) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await babyService.updateBaby(id, payload, avatarUri);
      const babies  = get().babies.map(b => b.id === id ? updated : b);
      set({
        babies,
        activeBaby: get().activeBabyId === id ? updated : get().activeBaby,
        isLoading: false,
      });
      return updated;
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  // ── DELETE BABY ───────────────────────────
  deleteBaby: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await babyService.deleteBaby(id);
      const babies = get().babies.filter(b => b.id !== id);
      const newActive = babies.length > 0 ? babies[0] : null;
      set({ babies, activeBabyId: newActive?.id ?? null, activeBaby: newActive, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  // ── LIVE DATA (still mock) ─────────────────
  fetchLiveData: async (babyId) => {
    set({ isFetchingLive: true });
    try {
      // TODO: wire to real sensor endpoint when ready
      await new Promise(r => setTimeout(r, 500));
      set({ latestReading: MOCK_SENSOR_READING, latestCryEvent: MOCK_CRY_EVENTS[0], isFetchingLive: false });
    } catch {
      set({ isFetchingLive: false });
    }
  },

  clearError: () => set({ error: null }),
}));