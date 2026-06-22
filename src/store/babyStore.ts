import { create } from 'zustand'
import { babyService } from '../services/baby.service'
import { sensorService } from '../services/sensor.service'
import { Baby, AddBabyPayload } from '../types'

interface BabyState {
  babies: Baby[]
  activeBabyId: string | null
  activeBaby: Baby | null
  isLoading: boolean
  error: string | null
  latestReading: any | null
  latestCryEvent: any | null
  isFetchingLive: boolean
  sensorUnsubscribe: (() => void) | null
  fetchBabies: () => Promise<void>
  setActiveBaby: (id: string) => void
  addBaby: (
    payload: Omit<AddBabyPayload, 'avatar'>,
    avatarUri?: string | null
  ) => Promise<Baby>
  updateBaby: (
    id: string,
    payload: Partial<Omit<AddBabyPayload, 'avatar'>>,
    avatarUri?: string | null
  ) => Promise<Baby>
  deleteBaby: (id: string) => Promise<void>
  fetchLiveData: (babyId: string) => Promise<void>
  clearError: () => void
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
  sensorUnsubscribe: null,

  fetchBabies: async () => {
    set({ isLoading: true, error: null })
    try {
      const babies = await babyService.getBabies()
      const activeBabyId = babies.length > 0 ? babies[0].id : null
      const activeBaby = babies.length > 0 ? babies[0] : null
      set({ babies, activeBabyId, activeBaby, isLoading: false })
    } catch (err: any) {
      set({ error: err.message, isLoading: false })
    }
  },

  setActiveBaby: (id) => {
    const baby = get().babies.find((b) => b.id === id) ?? null
    set({ activeBabyId: id, activeBaby: baby })
  },

  addBaby: async (payload, avatarUri) => {
    set({ isLoading: true, error: null })
    try {
      const baby = await babyService.addBaby(payload, avatarUri)
      set({
        babies: [...get().babies, baby],
        activeBabyId: baby.id,
        activeBaby: baby,
        isLoading: false
      })
      return baby
    } catch (err: any) {
      set({ error: err.message, isLoading: false })
      throw err
    }
  },

  updateBaby: async (id, payload, avatarUri) => {
    set({ isLoading: true, error: null })
    try {
      const updated = await babyService.updateBaby(id, payload, avatarUri)
      set({
        babies: get().babies.map((b) => (b.id === id ? updated : b)),
        activeBaby: get().activeBabyId === id ? updated : get().activeBaby,
        isLoading: false
      })
      return updated
    } catch (err: any) {
      set({ error: err.message, isLoading: false })
      throw err
    }
  },

  deleteBaby: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await babyService.deleteBaby(id)
      const babies = get().babies.filter((b) => b.id !== id)
      set({
        babies,
        activeBabyId: babies[0]?.id ?? null,
        activeBaby: babies[0] ?? null,
        isLoading: false
      })
    } catch (err: any) {
      set({ error: err.message, isLoading: false })
    }
  },

  fetchLiveData: async (babyId) => {
    set({ isFetchingLive: true })
    try {
      // 1. Unsubscribe previous
      if (get().sensorUnsubscribe) get().sensorUnsubscribe?.()

      // 2. Start Subscription
      const unsubscribe = sensorService.subscribeSensorData(
        (data) => {
          // Logic: Only update if the data is a real sensor object, not an error message
          if (data && !data.message) {
            set({ latestReading: data, isFetchingLive: false })
          }
        },
        (err) => set({ isFetchingLive: false })
      )

      set({ sensorUnsubscribe: unsubscribe })
    } catch (error) {
      console.error('fetchLiveData error:', error)
      set({ isFetchingLive: false })
    }
  },

  clearError: () => set({ error: null })
}))
