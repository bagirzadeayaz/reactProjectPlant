/** The languages the app ships. `en` is the fallback for every localized field. */
export const LOCALES = ['en', 'ru'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

/**
 * A field that carries every translation at once.
 *
 * The app must switch EN/RU without refetching, so a product's name is not a
 * string chosen by the server — it is both strings, and the UI picks one.
 * The zod schema for it lives in `localized-schema.ts` (see there for why).
 */
export type LocalizedString = Record<Locale, string>;

/** Reads a localized field, falling back to `en` when a translation is missing. */
export const pickLocalized = (field: LocalizedString, locale: Locale): string =>
  field[locale] || field[DEFAULT_LOCALE];
