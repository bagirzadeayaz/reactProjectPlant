export {
  i18n,
  initI18n,
  LANGUAGE_QUERY_PARAM,
  LANGUAGE_STORAGE_KEY,
  normalizeLocale,
  syncDocumentLanguage,
} from './config';
export { formatCurrency, formatDate, formatNumber, useFormatters, type Formatters } from './format';
export { DEFAULT_NAMESPACE, NAMESPACES, resources, type Namespace } from './resources';
export { useLocale, type UseLocaleResult } from './use-locale';
