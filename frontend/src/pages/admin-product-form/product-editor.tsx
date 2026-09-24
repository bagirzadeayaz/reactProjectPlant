import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ProductForm, useProductForm, type ProductFormValues } from '../../features/product-form';
import { useToast } from '../../shared/ui';
import { UnsavedChangesGuard } from './unsaved-changes-guard';

export interface ProductEditorProps {
  mode: 'create' | 'edit';
  initialValues?: ProductFormValues;
  onSave: (values: ProductFormValues) => Promise<void>;
  /** Called after a successful save, and on cancel. */
  onDone: () => void;
}

/**
 * The form plus its outcomes: a toast either way, the list on success, and
 * the navigation guard while there are unsaved edits.
 *
 * Leaving after a save happens in an effect, not in the submit handler: the
 * guard re-registers its blocker in *its* effect, which runs first (child
 * before parent), so by the time `onDone` navigates the guard already knows
 * the form is clean. Navigating from the handler would hit the stale blocker.
 */
export const ProductEditor = ({ mode, initialValues, onSave, onDone }: ProductEditorProps) => {
  const { t } = useTranslation('admin');
  const toast = useToast();
  const form = useProductForm(initialValues);
  const [saved, setSaved] = useState(false);

  const submit = async (values: ProductFormValues): Promise<void> => {
    try {
      await onSave(values);
      toast.show({ message: mode === 'edit' ? t('updated') : t('created'), tone: 'success' });
      setSaved(true);
    } catch {
      toast.show({ message: t('saveFailed'), tone: 'error' });
    }
  };

  useEffect(() => {
    if (saved) onDone();
  }, [saved, onDone]);

  return (
    <>
      <UnsavedChangesGuard when={form.formState.isDirty && !saved} />
      <ProductForm form={form} mode={mode} onSubmit={submit} onCancel={onDone} />
    </>
  );
};
