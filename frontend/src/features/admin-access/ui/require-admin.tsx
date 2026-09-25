import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';
import { DocumentMeta } from '../../../shared/lib/document-meta';
import { Button, Container } from '../../../shared/ui';
import {
  currentAdminUser,
  observeAdminSession,
  signInAdmin,
  signOutAdmin,
} from '../lib/admin-session';

type Status = 'checking' | 'signedOut' | 'authorized' | 'forbidden' | 'error';

const checkAccess = async (user: User): Promise<Status> => {
  try {
    if (import.meta.env.MODE !== 'test') {
      const { ensureAdminSession } = await import('../../../shared/firestore/store');
      await ensureAdminSession(user.email, user.emailVerified);
      return 'authorized';
    }
    const token = await user.getIdToken();
    const response = await fetch('/api/admin/session', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.ok ? 'authorized' : response.status === 403 ? 'forbidden' : 'error';
  } catch {
    return 'error';
  }
};

export const RequireAdmin = () => {
  const { t } = useTranslation(['admin', 'common']);
  const [status, setStatus] = useState<Status>('checking');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    const unsubscribe = observeAdminSession((user) => {
      if (!user) {
        setStatus('signedOut');
        return;
      }
      setStatus('checking');
      void checkAccess(user).then((next) => {
        if (active && currentAdminUser() === user) setStatus(next);
      });
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const signIn = async (): Promise<void> => {
    setBusy(true);
    try {
      await signInAdmin();
    } catch {
      setStatus('error');
    } finally {
      setBusy(false);
    }
  };

  if (status === 'authorized') return <Outlet />;

  return (
    <Container as="section" className="max-w-4xl py-12 sm:py-16 lg:py-20">
      <DocumentMeta
        title={`${t('admin:gate.title')} · ${t('common:meta.siteName')}`}
        robots="noindex"
      />
      <h1 className="text-h1 font-(--font-weight-heading) text-ink">{t('admin:gate.title')}</h1>
      <p className="mt-4 max-w-prose text-lg text-ink-muted">
        {t(
          `admin:gate.${status === 'checking' ? 'checking' : status === 'forbidden' ? 'forbidden' : status === 'error' ? 'error' : 'description'}`,
        )}
      </p>
      {status !== 'checking' && (
        <div className="mt-8 flex gap-4">
          <Button
            onClick={() => {
              void signIn();
            }}
            isLoading={busy}
            loadingLabel={t('common:a11y.loading')}
          >
            {t('admin:gate.enter')}
          </Button>
          {currentAdminUser() && (
            <Button
              variant="ghost"
              onClick={() => {
                void signOutAdmin();
              }}
            >
              {t('admin:gate.signOut')}
            </Button>
          )}
        </div>
      )}
    </Container>
  );
};
