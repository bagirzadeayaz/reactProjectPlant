import { useState } from 'react';
import { DocumentMeta } from '../../../shared/lib/document-meta';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';
import { Button, Container } from '../../../shared/ui';
import { isAdminEnabled, setAdminEnabled } from '../lib/admin-flag';

/**
 * Route guard for everything under `/admin`.
 *
 * Not enabled: a page that says plainly this is a demo and offers one button to
 * enter. Enabled: the child route. The state is read once per mount; enabling
 * flips it in place so the user lands on what they asked for.
 */
export const RequireAdmin = () => {
  const { t } = useTranslation(['admin', 'common']);
  const [enabled, setEnabled] = useState(isAdminEnabled);

  if (enabled) return <Outlet />;

  return (
    <Container as="section" className="py-16">
      <DocumentMeta title={`${t('admin:gate.title')} · ${t('common:meta.siteName')}`} />
      <h1 className="text-h1 font-(--font-weight-heading) text-ink">{t('admin:gate.title')}</h1>
      <p className="mt-4 max-w-prose text-lg text-ink-muted">{t('admin:gate.description')}</p>
      <Button
        className="mt-8"
        onClick={() => {
          setAdminEnabled(true);
          setEnabled(true);
        }}
      >
        {t('admin:gate.enter')}
      </Button>
    </Container>
  );
};
