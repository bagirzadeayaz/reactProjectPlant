import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { pickLocalized, type Locale, type LocalizedString } from '../api';
import { normalizeLocale } from './config';

export interface UseLocaleResult {
  locale: Locale;
  setLocale: (next: Locale) => void;
  /** Reads a localized entity field, falling back to English. */
  localized: (field: LocalizedString) => string;
}

/**
 * The active language, a way to change it, and the reader for the localized
 * fields the API returns.
 *
 * Entity fields carry every translation (see `shared/api/localized.ts`), so
 * switching language re-renders from data already in the cache — no refetch,
 * no loading state.
 */
export const useLocale = (): UseLocaleResult => {
  const { i18n } = useTranslation();
  const locale = normalizeLocale(i18n.language);

  const setLocale = useCallback(
    (next: Locale) => {
      void i18n.changeLanguage(next);
    },
    [i18n],
  );

  const localized = useCallback((field: LocalizedString) => pickLocalized(field, locale), [locale]);

  return useMemo(() => ({ locale, setLocale, localized }), [locale, setLocale, localized]);
};
