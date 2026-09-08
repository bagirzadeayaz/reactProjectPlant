export { backendReady, signalBackendReady } from './backend-ready';
export { baseApi } from './base-api';
// `localizedString` (the zod schema) is deliberately not re-exported here:
// entity schemas import it from './localized' directly, so the storefront
// bundle carries no zod. See ARCHITECTURE.md decision 56.
export {
  DEFAULT_LOCALE,
  LOCALES,
  pickLocalized,
  type Locale,
  type LocalizedString,
} from './localized';
