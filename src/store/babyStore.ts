// ─────────────────────────────────────────────
//  LULLABY — Baby Store (Zustand)
// ─────────────────────────────────────────────

import { create } from 'zustand';
import { babyService } from '../services/baby.service';
import { sensorService } from '../services/sensor.service';
import { cryService } from '../services/cry.service';
import { Baby, AddBabyPayload, SensorReading, CryEvent } from '../types';

interface BabyState {
  babies: Baby[];
  activeBabyId: string | null;
  activeBaby: Baby | null;
  isLoading: boolean;
  error: string | null;

  // Live data for active baby
  latestReading: SensorReading | null;
  latestCryEvent: CryEvent | null;
  isFetchingLive: boolean;

  // Actions
  fetchBabies: () => Promise<void>;
  setActiveBaby: (id: string) => void;
  addBaby: (payload: AddBabyPayload) => Promise<Baby>;
  updateBaby: (id: string, payload: Partial<AddBabyPayload>) => Promise<void>;
  deleteBaby: (id: string) => Promise<void>;
  fetchLiveData: (babyId: string) => Promise<void>;
  clearError: () => void;
}

export const useBabyStore = create<BabyState>((set, get) => ({
  babies: [],
  activeBabyId: null,
  activeBaby: null,
  isLoading: false,
  error: null,
  latestReading: null,
  latestCryEvent: null,
  isFetchingLive: false,

  fetchBabies: async () => {
    set({ isLoading: true, error: null });
    try {
      const babies = await babyService.getBabies();
      const activeBabyId = babies.length > 0 ? babies[0].id : null;
      const activeBaby = activeBabyId ? babies[0] : null;
      set({ babies, activeBabyId, activeBaby, isLoading: false });
    } catch (err: any) {
      set({ error: err.message ?? 'Failed to load babies', isLoading: false });
    }
  },

  setActiveBaby: (id) => {
    const baby = get().babies.find((b) => b.id === id) ?? null;
    set({ activeBabyId: id, activeBaby: baby });
  },

  addBaby: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const newBaby = await babyService.addBaby(payload);
      const babies = [...get().babies, newBaby];
      set({
        babies,
        isLoading: false,
        // Auto-select the new baby if it's the first one
        activeBabyId: get().activeBabyId ?? newBaby.id,
        activeBaby: get().activeBaby ?? newBaby,
      });
      return newBaby;
    } catch (err: any) {
      set({ error: err.message ?? 'Failed to add baby', isLoading: false });
      throw err;
    }
  },

  updateBaby: async (id, payload) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await babyService.updateBaby(id, payload);
      const babies = get().babies.map((b) => (b.id === id ? updated : b));
      set({
        babies,
        isLoading: false,
        activeBaby: get().activeBabyId === id ? updated : get().activeBaby,
      });
    } catch (err: any) {
      set({ error: err.message ?? 'Failed to update baby', isLoading: false });
      throw err;
    }
  },

  deleteBaby: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await babyService.deleteBaby(id);
      const babies = get().babies.filter((b) => b.id !== id);
      const newActive = babies.length > 0 ? babies[0] : null;
      set({
        babies,
        isLoading: false,
        activeBabyId: get().activeBabyId === id ? (newActive?.id ?? null) : get().activeBabyId,
        activeBaby: get().activeBabyId === id ? newActive : get().activeBaby,
      });
    } catch (err: any) {
      set({ error: err.message ?? 'Failed to delete baby', isLoading: false });
      throw err;
    }
  },

  fetchLiveData: async (babyId) => {
    set({ isFetchingLive: true });
    try {
      const [reading, cryEvent] = await Promise.all([
        sensorService.getLatestReading(babyId),
        cryService.getLatestCryEvent(babyId),
      ]);
      set({ latestReading: reading, latestCryEvent: cryEvent, isFetchingLive: false });
    } catch {
      set({ isFetchingLive: false });
    }
  },

  clearError: () => set({ error: null }),
}));
