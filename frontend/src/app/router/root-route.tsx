import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Spinner } from '../../shared/ui';
import { RouteErrorBoundary } from '../error-boundary';
import { LanguageQuerySync } from './language-query-sync';

export const RootRoute = () => {
  const { t } = useTranslation();
  return (
    <RouteErrorBoundary>
      <LanguageQuerySync />
      <Suspense
        fallback={
          <div className="flex min-h-dvh items-center justify-center">
            <Spinner label={t('a11y.loading')} />
          </div>
        }
      >
        <Outlet />
      </Suspense>
    </RouteErrorBoundary>
  );
};
