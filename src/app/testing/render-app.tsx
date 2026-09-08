import { render } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { AppProviders, type AppProvidersProps } from '../providers';
import { appRoutes } from '../router';

/**
 * Mounts the real app at a path, on a memory router. For tests only — it is
 * exported from `app/router` so test files in `src/app` share one recipe.
 *
 * Returns the router too, so a test can navigate the way a link would
 * (`router.navigate('/catalog')`) and assert what the user then sees.
 */
export const renderApp = (path: string, options: Pick<AppProvidersProps, 'store'> = {}) => {
  const router = createMemoryRouter(appRoutes, { initialEntries: [path] });
  const view = render(
    <AppProviders {...(options.store === undefined ? {} : { store: options.store })}>
      <RouterProvider router={router} />
    </AppProviders>,
  );
  return { ...view, router };
};
