import { z } from 'zod';
import type { LocalizedString } from './localized';

/**
 * The zod side of `LocalizedString`, kept in its own module so that the
 * modules the storefront imports (`localized.ts`) never pull zod into the
 * entry bundle. Only entity schemas import this. The `satisfies` keeps the
 * two definitions from drifting apart.
 */
export const localizedString = z.object({
  en: z.string().min(1),
  ru: z.string().min(1),
});

// Compile-time proof that the schema and the type agree in both directions.
export const _localizedShape = (value: z.infer<typeof localizedString>): LocalizedString => value;
export const _localizedType = (value: LocalizedString): z.infer<typeof localizedString> => value;
