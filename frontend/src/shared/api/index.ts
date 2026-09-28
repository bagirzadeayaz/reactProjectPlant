export { baseApi } from './base-api';
// `localizedString` (the zod schema) is deliberately not re-exported here:
// entity schemas import it from './localized' directly, so the storefront
// bundle avoids loading schemas before they are needed.
export {
  DEFAULT_LOCALE,
  LOCALES,
  pickLocalized,
  type Locale,
  type LocalizedString,
} from './localized';
