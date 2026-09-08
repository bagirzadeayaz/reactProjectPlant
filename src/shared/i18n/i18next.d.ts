import type { resources } from './resources';

/**
 * Makes `t()` typed against the English resources: a key that does not exist
 * is a compile error, not a string that silently renders as itself.
 *
 * English is the source of truth for the key set. The `check:i18n` script is
 * what keeps Russian in step with it — types alone cannot, because a missing
 * Russian key is a runtime fallback, not a type error.
 */
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: (typeof resources)['en'];
    returnNull: false;
  }
}
