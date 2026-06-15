import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { applyLayoutDirection } from '../i18n/applyLayoutDirection';
import type { AppLocale } from '../types/locale';

export type { AppLocale };

interface LocaleState {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: 'en',
      setLocale: (locale) => {
        set({ locale });
        applyLayoutDirection(locale, 'interactive');
      },
    }),
    {
      name: 'lullaby_locale',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ locale: s.locale }),
    }
  )
);

useLocaleStore.persist.onFinishHydration((state) => {
  if (state?.locale) applyLayoutDirection(state.locale, 'hydrate');
});

/** Sync read for `apiRequest` (no hook). */
export const getLocale = (): AppLocale => useLocaleStore.getState().locale;
