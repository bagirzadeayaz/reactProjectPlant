import { useTranslation } from 'react-i18next';
import { Button, Modal } from '../../shared/ui';

export interface DeleteDialogProps {
  /** `null` keeps the dialog closed. */
  target: { kind: 'one'; name: string } | { kind: 'many'; count: number } | null;
  isDeleting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

/** "Are you sure?" for one product or a selection. Nothing is deleted without it. */
export const DeleteDialog = ({ target, isDeleting, onConfirm, onClose }: DeleteDialogProps) => {
  const { t } = useTranslation('admin');
  const title =
    target === null
      ? ''
      : target.kind === 'one'
        ? t('deleteConfirm', { name: target.name })
        : t('bulk.confirm', { count: target.count });

  return (
    <Modal
      isOpen={target !== null}
      onClose={onClose}
      title={title}
      closeLabel={t('dialog.close')}
      footer={
        <div className="flex flex-wrap justify-end gap-4">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isDeleting}>
            {t('dialog.cancel')}
          </Button>
          <Button
            type="button"
            size="sm"
            isLoading={isDeleting}
            loadingLabel={t('dialog.deleting')}
            onClick={onConfirm}
          >
            {t('dialog.confirmDelete')}
          </Button>
        </div>
      }
    >
      <p className="text-md text-ink-muted">{t('deleteWarning')}</p>
    </Modal>
  );
};
