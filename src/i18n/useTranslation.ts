import { useCallback, useMemo } from 'react';
import { useLocaleStore } from '../store/localeStore';
import { translate } from './translations';

export function useTranslation() {
  const locale = useLocaleStore((s) => s.locale);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => translate(locale, key, vars),
    [locale]
  );

  const isRTL = useMemo(() => locale === 'ar', [locale]);

  return { t, locale, isRTL };
}
