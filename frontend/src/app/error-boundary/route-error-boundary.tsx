import { DocumentMeta } from '../../shared/lib/document-meta';
import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { StatusPage } from '../../shared/ui';
import { ErrorBoundary } from './error-boundary';

export interface RouteErrorBoundaryProps {
  children: ReactNode;
}

/**
 * Wraps one route's content.
 *
 * Keyed on the pathname, so navigating away clears a caught error instead of
 * leaving the user stuck on a dead screen. The boundary wraps the complete
 * layout, so a crash replaces the navigation and footer as well.
 */
export const RouteErrorBoundary = ({ children }: RouteErrorBoundaryProps) => {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  return (
    <ErrorBoundary
      resetKey={pathname}
      fallback={() => (
        <>
          <DocumentMeta title={`${t('state.error')} · ${t('meta.siteName')}`} robots="noindex" />
          <StatusPage
            code="500"
            role="alert"
            title={t('state.error')}
            description={t('state.errorDetail')}
          />
        </>
      )}
    >
      {children}
    </ErrorBoundary>
  );
};
