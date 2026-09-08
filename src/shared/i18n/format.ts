import { useMemo } from 'react';
import type { Locale } from '../api';

/**
 * Formatting goes through `Intl`, never through string concatenation.
 *
 * Russian writes `1 299 ₹`, English writes `₹1,299` — separators, symbol
 * position and spacing all differ, and hand-rolling that is how a price ends up
 * looking foreign in one of the two languages.
 */
export const formatCurrency = (value: number, currency: string, locale: Locale): string =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);

export const formatNumber = (value: number, locale: Locale): string =>
  new Intl.NumberFormat(locale).format(value);

export const formatDate = (value: string | Date, locale: Locale): string =>
  new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(value));

export interface Formatters {
  currency: (value: number, currency: string) => string;
  number: (value: number) => string;
  date: (value: string | Date) => string;
}

/** The three formatters bound to a locale, memoized so components can pass them down. */
export const useFormatters = (locale: Locale): Formatters =>
  useMemo(
    () => ({
      currency: (value, currency) => formatCurrency(value, currency, locale),
      number: (value) => formatNumber(value, locale),
      date: (value) => formatDate(value, locale),
    }),
    [locale],
  );
