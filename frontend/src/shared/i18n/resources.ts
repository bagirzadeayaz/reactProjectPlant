import enAdmin from './locales/en/admin.json';
import enCatalog from './locales/en/catalog.json';
import enCommon from './locales/en/common.json';
import enHome from './locales/en/home.json';
import enProduct from './locales/en/product.json';
import enValidation from './locales/en/validation.json';
import ruAdmin from './locales/ru/admin.json';
import ruCatalog from './locales/ru/catalog.json';
import ruCommon from './locales/ru/common.json';
import ruHome from './locales/ru/home.json';
import ruProduct from './locales/ru/product.json';
import ruValidation from './locales/ru/validation.json';

/**
 * Every namespace, bundled at build time.
 *
 * The app has two languages and a few kilobytes of copy, so lazy-loading them
 * would buy a round trip's worth of flicker for nothing.
 */
export const resources = {
  en: {
    common: enCommon,
    home: enHome,
    catalog: enCatalog,
    product: enProduct,
    admin: enAdmin,
    validation: enValidation,
  },
  ru: {
    common: ruCommon,
    home: ruHome,
    catalog: ruCatalog,
    product: ruProduct,
    admin: ruAdmin,
    validation: ruValidation,
  },
} as const;

export const NAMESPACES = ['common', 'home', 'catalog', 'product', 'admin', 'validation'] as const;

export type Namespace = (typeof NAMESPACES)[number];
export const DEFAULT_NAMESPACE = 'common' satisfies Namespace;
