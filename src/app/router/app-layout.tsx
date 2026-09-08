import { Suspense, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation } from 'react-router-dom';
import { Footer } from '../../widgets/footer';
import { Header } from '../../widgets/header';
import { Spinner, ToastProvider } from '../../shared/ui';
import { RouteErrorBoundary } from '../error-boundary';
import { RouteAnnouncer } from './route-announcer';

const MAIN_ID = 'main-content';

/**
 * The frame every route renders inside: skip link, header, main, footer.
 *
 * The error boundary and the Suspense fallback sit *inside* `main`, so a page
 * that throws or is still loading leaves the header and footer intact and the
 * user can navigate away.
 */
export const AppLayout = () => {
  const { t } = useTranslation();
  const mainRef = useRef<HTMLElement>(null);
  const { pathname } = useLocation();
  // The entry fade is for in-app navigation only: animating the first paint
  // from opacity 0 would only delay the LCP.
  const [initialPathname] = useState(pathname);

  return (
    <ToastProvider
      regionLabel={t('a11y.notifications')}
      dismissLabel={t('a11y.dismissNotification')}
    >
      <div className="flex min-h-screen flex-col bg-surface-footer">
        {/* Visually hidden until focused — the first stop for a keyboard user. */}
        <a
          href={`#${MAIN_ID}`}
          className="sr-only rounded-control bg-ink px-4 py-2 text-surface-footer focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50"
        >
          {t('a11y.skipToContent')}
        </a>

        <Header />

        <main id={MAIN_ID} ref={mainRef} className="min-h-dvh flex-1">
          <RouteErrorBoundary>
            <Suspense
              fallback={
                <div className="flex justify-center py-24">
                  <Spinner label={t('a11y.loading')} className="text-h2 text-ink" />
                </div>
              }
            >
              {/* Keyed on the path so each page enters with the short fade
                  (motion-safe, see index.css). Query changes keep the page. */}
              <div
                key={pathname}
                className={pathname === initialPathname ? undefined : 'page-enter'}
              >
                <Outlet />
              </div>
            </Suspense>
          </RouteErrorBoundary>
        </main>

        <Footer />
        <RouteAnnouncer contentRef={mainRef} />
      </div>
    </ToastProvider>
  );
};
