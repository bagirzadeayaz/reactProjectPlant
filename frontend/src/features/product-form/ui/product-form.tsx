import type { UseFormReturn } from 'react-hook-form';
import { useState } from 'react';
import { Check, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useGetCategoriesQuery } from '../../../entities/category';
import { useLocale } from '../../../shared/i18n';
import { Button, Input, Modal, Select } from '../../../shared/ui';
import type { ProductFormValues } from '../lib/form-values';
import { ImageField } from './image-field';
import { LocalizedFields } from './localized-fields';
import { CareFields } from './care-fields';
import { ProductPreview } from './product-preview';

export interface ProductFormProps {
  /** From `useProductForm`, owned by the page. */
  form: UseFormReturn<ProductFormValues>;
  mode: 'create' | 'edit';
  onSubmit: (values: ProductFormValues) => Promise<void>;
  onCancel: () => void;
}

/**
 * Create/edit form for a product: two localized fields, the scalar fields in
 * one row, the image, stock, and the actions. Every string is translated
 * here; the validation copy comes through the resolver in `useProductForm`.
 */
export const ProductForm = ({ form, mode, onSubmit, onCancel }: ProductFormProps) => {
  const { t } = useTranslation('admin');
  const { localized } = useLocale();
  const categories = useGetCategoriesQuery(undefined);
  const [preview, setPreview] = useState(false);
  const values = form.watch();

  const { register, handleSubmit, formState } = form;
  const isEdit = mode === 'edit';
  /** Spread-ready error prop: absent when there is no error (exactOptionalPropertyTypes). */
  const errorOf = (name: 'slug' | 'price' | 'category'): { error?: string } => {
    const message = formState.errors[name]?.message;
    return message === undefined ? {} : { error: message };
  };

  return (
    <form
      noValidate
      onSubmit={(event) => {
        void handleSubmit(onSubmit)(event);
      }}
      className="product-editor-form"
    >
      <div className="product-editor-layout">
        <div className="product-editor-details product-editor-panel">
          <h2>{t('form.details')}</h2>
          <Select
            label={t('inventory.publication')}
            description={t('inventory.publicationHint')}
            options={(['draft', 'published', 'archived'] as const).map((value) => ({
              value,
              label: t(`inventory.${value}`),
            }))}
            {...register('status')}
            value={values.status ?? 'published'}
          />
          <LocalizedFields form={form} field="name" />
          <LocalizedFields form={form} field="description" multiline />
          <CareFields form={form} />

          <section className="product-editor-pricing" aria-label={t('form.pricing')}>
            <h2>{t('form.pricing')}</h2>
            <div className="product-editor-pair">
              <Input
                label={`${t('fields.price')} (₼)`}
                description={t('fields.priceHint')}
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                {...errorOf('price')}
                {...register('price', { valueAsNumber: true })}
              />
              <Select
                label={t('fields.category')}
                placeholder={t('fields.categoryPlaceholder')}
                options={(categories.data ?? []).map((category) => ({
                  value: category.slug,
                  label: localized(category.label),
                }))}
                {...errorOf('category')}
                {...register('category')}
                value={form.watch('category')}
              />
            </div>
            <label className="product-editor-stock">
              <input type="checkbox" {...register('inStock')} />
              <span>
                {t('fields.inStock')}
                <small>{t('fields.stockHint')}</small>
              </span>
            </label>
            <Input
              label={t('fields.slug')}
              description={t('fields.slugHint')}
              {...errorOf('slug')}
              {...register('slug')}
            />
          </section>
        </div>

        <ImageField form={form} />
      </div>

      <div className="product-editor-actions">
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setPreview(true);
          }}
        >
          {t('inventory.preview')}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel} disabled={formState.isSubmitting}>
          {t('form.cancel')}
        </Button>
        <Button
          className="product-editor-save"
          type="submit"
          isLoading={formState.isSubmitting}
          loadingLabel={t('form.saving')}
        >
          {isEdit ? <Check size={18} aria-hidden="true" /> : <Plus size={18} aria-hidden="true" />}
          {isEdit ? t('form.save') : t('form.create')}
        </Button>
      </div>
      <Modal
        isOpen={preview}
        onClose={() => {
          setPreview(false);
        }}
        title={t('inventory.preview')}
        closeLabel={t('dialog.close')}
        className="admin-preview-dialog"
        bodyClassName="admin-preview-body"
      >
        <ProductPreview values={values} />
      </Modal>
    </form>
  );
};
