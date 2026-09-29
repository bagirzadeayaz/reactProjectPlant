import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { useTranslation } from 'react-i18next';
import { Link, Outlet } from 'react-router-dom';
import { ArrowRight, Leaf, LockKeyhole } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { baseApi } from '../../../shared/api';
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
    const { ensureAdminSession } = await import('../../../shared/firestore/store');
    await ensureAdminSession(user.email, user.emailVerified);
    return 'authorized';
  } catch {
    return 'error';
  }
};

export const RequireAdmin = () => {
  const { t } = useTranslation(['admin', 'common']);
  const [status, setStatus] = useState<Status>('checking');
  const [busy, setBusy] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    let active = true;
    const unsubscribe = observeAdminSession((user) => {
      dispatch(baseApi.util.resetApiState());
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
  }, [dispatch]);

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
    <Container as="section" className="admin-welcome">
      <DocumentMeta
        title={`${t('admin:gate.title')} · ${t('common:meta.siteName')}`}
        robots="noindex"
      />
      <div className="admin-welcome__art" aria-hidden="true">
        <div className="admin-welcome__orbit">
          <Leaf />
          <Leaf />
        </div>
        <img
          src="/plants/monstera-deliciosa-800.webp"
          width="800"
          height="800"
          alt=""
          fetchPriority="high"
        />
      </div>
      <div className="admin-welcome__content">
        <h1>{t('admin:gate.headline')}</h1>
        <p className="admin-welcome__description" role="status" aria-live="polite">
          {t(
            `admin:gate.${status === 'checking' ? 'checking' : status === 'forbidden' ? 'forbidden' : status === 'error' ? 'error' : 'description'}`,
          )}
        </p>
        {status !== 'checking' && (
          <div className="admin-welcome__actions">
            <Button
              onClick={() => {
                void signIn();
              }}
              isLoading={busy}
              loadingLabel={t('common:a11y.loading')}
              className="admin-welcome__signin"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285f4"
                  d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.9-1.75 2.98-4.33 2.98-7.36Z"
                />
                <path
                  fill="#34a853"
                  d="M12 22c2.7 0 4.96-.9 6.62-2.41l-3.24-2.51c-.9.6-2.05.97-3.38.97-2.61 0-4.83-1.76-5.62-4.12H3.04v2.59A10 10 0 0 0 12 22Z"
                />
                <path
                  fill="#fbbc05"
                  d="M6.38 13.93a6 6 0 0 1 0-3.86V7.48H3.04a10 10 0 0 0 0 9.04l3.34-2.59Z"
                />
                <path
                  fill="#ea4335"
                  d="M12 5.95c1.47 0 2.79.51 3.83 1.51l2.87-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.96 5.48l3.34 2.59C7.17 7.71 9.39 5.95 12 5.95Z"
                />
              </svg>
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
        <p className="admin-welcome__note">
          <LockKeyhole size={17} aria-hidden="true" />
          {t('admin:gate.accessNote')}
        </p>
        <Link className="admin-welcome__back" to="/catalog">
          {t('admin:gate.backToShop')}
          <ArrowRight size={20} aria-hidden="true" />
        </Link>
        <p className="admin-welcome__scope">{t('admin:gate.scope')}</p>
      </div>
    </Container>
  );
};
