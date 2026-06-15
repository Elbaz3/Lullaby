import { DevSettings, I18nManager, Platform } from 'react-native';
import type { AppLocale } from '../types/locale';

function setWebDir(wantRTL: boolean) {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;
  document.documentElement.setAttribute('dir', wantRTL ? 'rtl' : 'ltr');
}

export type LayoutDirectionSource = 'hydrate' | 'interactive';

/**
 * Syncs RTL with locale.
 *
 * - **hydrate** (after AsyncStorage restore): only updates `I18nManager` / web `dir`.
 *   Never calls `reload()` — otherwise reload → rehydrate → mismatch → reload loops forever.
 * - **interactive** (user changed language in Settings): `forceRTL` then a short delayed
 *   `reload()` so persist can flush `locale` before the JS runtime restarts.
 */
export function applyLayoutDirection(
  locale: AppLocale,
  source: LayoutDirectionSource = 'interactive'
): void {
  const wantRTL = locale === 'ar';
  setWebDir(wantRTL);

  if (Platform.OS === 'web') return;

  I18nManager.allowRTL(true);

  if (I18nManager.isRTL === wantRTL) return;

  I18nManager.forceRTL(wantRTL);

  if (source === 'hydrate') return;

  setTimeout(() => {
    try {
      if (typeof DevSettings.reload === 'function') {
        DevSettings.reload();
      }
    } catch {
      /* release builds may omit DevSettings */
    }
  }, 150);
}
