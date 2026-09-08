import { createRoutesFromElements, Route, type RouteObject } from 'react-router-dom';
import { RequireAdmin } from '../../features/admin-access';
// The landing page is *not* split: it is where most visits start, and a lazy
// chunk there costs a second network hop before first paint on a slow
// connection. Every other route loads on demand (see ./routes).
import { HomePage } from '../../pages/home';
import { AppLayout } from './app-layout';
import { RootRoute } from './root-route';
import {
  AdminProductFormPage,
  AdminProductsPage,
  CatalogPage,
  NotFoundPage,
  ProductPage,
  UiKitPage,
} from './routes';

/**
 * The route table.
 *
 * Language is a query parameter (`?lang=ru`), not a path prefix: the app is a
 * static deploy with no server able to rewrite `/ru/...`, and a prefix would
 * double every path in this table for content that is identical apart from its
 * strings. It also keeps one canonical URL per page, so a shared link and a
 * bookmark point at the same route whatever language the reader prefers.
 *
 * This is a plain route array rather than a `<Routes>` tree because the admin
 * form blocks navigation while it holds unsaved changes, and `useBlocker` only
 * exists on a data router. `createBrowserRouter(appRoutes)` in the app,
 * `createMemoryRouter(appRoutes, …)` in tests.
 */
export const appRoutes: RouteObject[] = createRoutesFromElements(
  <Route element={<RootRoute />}>
    <Route element={<AppLayout />}>
      <Route index element={<HomePage />} />
      <Route path="catalog" element={<CatalogPage />} />
      <Route path="catalog/:slug" element={<ProductPage />} />
      <Route path="admin" element={<RequireAdmin />}>
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="products/new" element={<AdminProductFormPage />} />
        <Route path="products/:id" element={<AdminProductFormPage />} />
      </Route>
      {/* Dev-only gallery of the shared UI kit. Stripped from production builds. */}
      {import.meta.env.DEV && <Route path="ui-kit" element={<UiKitPage />} />}
      <Route path="*" element={<NotFoundPage />} />
    </Route>
  </Route>,
);
