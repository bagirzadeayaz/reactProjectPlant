import { lazy } from 'react';

/**
 * Every route is code-split.
 *
 * Default exports are banned in this project, so each import maps the named
 * export onto the `default` key `React.lazy` expects.
 */
const lazyNamed = <T extends Record<string, unknown>>(load: () => Promise<T>, name: keyof T) =>
  lazy(async () => {
    const module = await load();
    return { default: module[name] as React.ComponentType };
  });

export const CarePage = lazyNamed(() => import('../../pages/care'), 'CarePage');
export const BasketPage = lazyNamed(() => import('../../pages/checkout'), 'BasketPage');
export const CheckoutPage = lazyNamed(() => import('../../pages/checkout'), 'CheckoutPage');
export const ConfirmationPage = lazyNamed(() => import('../../pages/checkout'), 'ConfirmationPage');
export const ContactPage = lazyNamed(() => import('../../pages/contact'), 'ContactPage');
export const CatalogPage = lazyNamed(() => import('../../pages/catalog'), 'CatalogPage');
export const ProductPage = lazyNamed(() => import('../../pages/product'), 'ProductPage');
export const AdminProductsPage = lazyNamed(
  () => import('../../pages/admin-products'),
  'AdminProductsPage',
);
export const RequireAdmin = lazyNamed(() => import('../../features/admin-access'), 'RequireAdmin');
export const AdminProductFormPage = lazyNamed(
  () => import('../../pages/admin-product-form'),
  'AdminProductFormPage',
);
export const NotFoundPage = lazyNamed(() => import('../../pages/not-found'), 'NotFoundPage');
export const UiKitPage = lazyNamed(() => import('../../pages/ui-kit'), 'UiKitPage');

export const DiscoverPage = lazyNamed(() => import('../../pages/explore'), 'DiscoverPage');
export const FinderPage = lazyNamed(() => import('../../pages/explore'), 'FinderPage');
export const WishlistPage = lazyNamed(() => import('../../pages/explore'), 'WishlistPage');
export const ComparePage = lazyNamed(() => import('../../pages/explore'), 'ComparePage');
export const StudioPage = lazyNamed(() => import('../../pages/explore'), 'StudioPage');
export const TrackingPage = lazyNamed(() => import('../../pages/checkout'), 'TrackingPage');
