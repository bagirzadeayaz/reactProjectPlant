import type { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useGetCategoriesQuery } from '../../../entities/category';
import { useLocale } from '../../../shared/i18n';
import { Button, Input, Select } from '../../../shared/ui';
import type { ProductFormValues } from '../lib/form-values';
import { ImageField } from './image-field';
import { LocalizedFields } from './localized-fields';

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
      className="flex flex-col gap-8"
    >
      <LocalizedFields form={form} field="name" />
      <LocalizedFields form={form} field="description" multiline />

      <div className="grid gap-4 sm:grid-cols-3">
        <Input
          label={t('fields.price')}
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
        />
        <Input
          label={t('fields.slug')}
          description={t('fields.slugHint')}
          {...errorOf('slug')}
          {...register('slug')}
        />
      </div>

      <ImageField form={form} />

      <label className="flex items-center gap-3 text-md text-ink">
        <input type="checkbox" className="size-5 accent-ink" {...register('inStock')} />
        {t('fields.inStock')}
      </label>

      <div className="flex flex-wrap gap-4">
        <Button type="submit" isLoading={formState.isSubmitting} loadingLabel={t('form.saving')}>
          {isEdit ? t('form.save') : t('form.create')}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          {t('form.cancel')}
        </Button>
      </div>
    </form>
  );
};
