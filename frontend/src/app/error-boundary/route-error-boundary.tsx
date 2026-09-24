import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { Button, StatusPage } from '../../shared/ui';
import { ErrorBoundary } from './error-boundary';

export interface RouteErrorBoundaryProps {
  children: ReactNode;
}

/**
 * Wraps one route's content.
 *
 * Keyed on the pathname, so navigating away clears a caught error instead of
 * leaving the user stuck on a dead screen. The header, footer and nav live
 * outside this boundary and keep working while it is showing.
 */
export const RouteErrorBoundary = ({ children }: RouteErrorBoundaryProps) => {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  return (
    <ErrorBoundary
      resetKey={pathname}
      fallback={({ reset }) => (
        <StatusPage
          role="alert"
          title={t('state.error')}
          description={t('state.errorDetail')}
          action={<Button onClick={reset}>{t('actions.retry')}</Button>}
        />
      )}
    >
      {children}
    </ErrorBoundary>
  );
};
