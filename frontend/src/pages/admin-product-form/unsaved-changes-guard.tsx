import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useBlocker } from 'react-router-dom';
import { Button, Modal } from '../../shared/ui';

export interface UnsavedChangesGuardProps {
  /** True while the form differs from what was loaded and is not being saved. */
  when: boolean;
}

/**
 * Stops in-app navigation while a form is dirty and asks first. Closing the
 * tab gets the browser's own prompt through `beforeunload`, which is the
 * only thing a page is allowed to do there.
 *
 * Needs a data router — `useBlocker` has nothing to hold on a plain
 * `<BrowserRouter>`. That is why `app/router` builds one.
 */
export const UnsavedChangesGuard = ({ when }: UnsavedChangesGuardProps) => {
  const { t } = useTranslation('admin');
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      when && currentLocation.pathname !== nextLocation.pathname,
  );

  useEffect(() => {
    if (!when) return;
    const warn = (event: BeforeUnloadEvent): void => {
      event.preventDefault();
    };
    window.addEventListener('beforeunload', warn);
    return () => {
      window.removeEventListener('beforeunload', warn);
    };
  }, [when]);

  const isBlocked = blocker.state === 'blocked';
  const stay = (): void => {
    if (blocker.state === 'blocked') blocker.reset();
  };
  const leave = (): void => {
    if (blocker.state === 'blocked') blocker.proceed();
  };

  return (
    <Modal
      isOpen={isBlocked}
      onClose={stay}
      title={t('unsaved.title')}
      closeLabel={t('dialog.close')}
      footer={
        <div className="flex flex-wrap justify-end gap-4">
          <Button type="button" variant="ghost" size="sm" onClick={stay}>
            {t('unsaved.stay')}
          </Button>
          <Button type="button" size="sm" onClick={leave}>
            {t('unsaved.leave')}
          </Button>
        </div>
      }
    >
      <p className="text-md text-ink-muted">{t('unsaved.body')}</p>
    </Modal>
  );
};
