import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Button, ErrorState } from '../../shared/ui';
import { ErrorBoundary } from '../error-boundary';
import { appRoutes } from './app-routes';

/**
 * The application shell.
 *
 * The outer boundary is the last line of defence — if the router or a provider
 * throws there is no header left to keep, so its recovery is a full reload
 * rather than a re-render.
 */
export const AppRouter = () => {
  const { t } = useTranslation();
  // One router per mount; the table itself is static.
  const [router] = useState(() => createBrowserRouter(appRoutes));

  return (
    <ErrorBoundary
      fallback={({ error }) => (
        <ErrorState
          title={t('state.error')}
          description={error.message}
          action={
            <Button
              onClick={() => {
                globalThis.location.reload();
              }}
            >
              {t('actions.retry')}
            </Button>
          }
        />
      )}
    >
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
};
