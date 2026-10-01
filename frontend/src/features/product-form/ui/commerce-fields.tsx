import { useFieldArray, type UseFormReturn } from 'react-hook-form';
import { Plus, Trash2, Package, Truck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DELIVERY_AREAS, PLANT_SIZES, POT_STYLES } from '../../../shared/commerce';
import { Button, Input, Select } from '../../../shared/ui';
import { readImageFile, MAX_IMAGE_KB } from '../lib/read-image-file';
import type { ProductFormValues } from '../lib/form-values';

export const CommerceFields = ({ form }: { form: UseFormReturn<ProductFormValues> }) => {
  const { t } = useTranslation(['admin', 'product']);
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'variants',
    keyName: 'fieldKey',
  });
  const values = form.watch();
  const areas = values.delivery?.areas ?? [];
  return (
    <>
      <section className="product-editor-commerce">
        <div className="product-editor-commerce__heading">
          <Package size={22} aria-hidden="true" />
          <h2>{t('admin:options.title')}</h2>
          <span>{fields.length}/12</span>
        </div>
        <p>{t('admin:options.hint')}</p>
        <div className="product-editor-variants">
        {fields.map((field, index) => {
          const indexPath = String(index) as `${number}`;
            const value = values.variants?.[index];
            const errors = form.formState.errors.variants?.[index];
            const error = (key: 'size' | 'heightCm' | 'price' | 'stock' | 'imageUrl') =>
              errors?.[key]?.message ? { error: errors[key].message } : {};
            return (
              <div className="product-editor-variant" key={field.fieldKey}>
                <div className="product-editor-variant__heading">
                  <strong>{t('admin:options.option', { number: index + 1 })}</strong>
                  <button
                    type="button"
                    aria-label={t('admin:options.remove', { number: index + 1 })}
                    onClick={() => {
                      remove(index);
                    }}
                  >
                    <Trash2 size={18} aria-hidden="true" />
                  </button>
                </div>
                <div className="product-editor-pair">
                  <Select
                    label={t('product:options.size')}
                    options={PLANT_SIZES.map((size) => ({
                      value: size,
                      label: t(`product:options.sizes.${size}`),
                    }))}
                    {...form.register(`variants.${indexPath}.size`)}
                    value={value?.size ?? 'medium'}
                    {...error('size')}
                  />
                  <Select
                    label={t('product:options.pot')}
                    options={POT_STYLES.map((pot) => ({
                      value: pot,
                      label: t(`product:options.pots.${pot}`),
                    }))}
                    {...form.register(`variants.${indexPath}.pot`)}
                    value={value?.pot ?? 'original'}
                  />
                </div>
                <div className="product-editor-variant__numbers">
                  <Input
                    label={t('admin:options.height')}
                    type="number"
                    min={5}
                    max={300}
                    {...form.register(`variants.${indexPath}.heightCm`, {
                      valueAsNumber: true,
                    })}
                    {...error('heightCm')}
                  />
                  <Input
                    label={`${t('admin:fields.price')} (₼)`}
                    type="number"
                    min={0}
                    step={1}
                    {...form.register(`variants.${indexPath}.price`, { valueAsNumber: true })}
                    {...error('price')}
                  />
                  <Input
                    label={t('admin:options.stock')}
                    type="number"
                    min={0}
                    max={999}
                    step={1}
                    {...form.register(`variants.${indexPath}.stock`, { valueAsNumber: true })}
                    {...error('stock')}
                  />
                </div>
                <div className="product-editor-variant__photo">
                  {value?.imageUrl && <img src={value.imageUrl} alt="" />}
                  <Input
                    label={t('admin:options.photo')}
                    description={t('admin:options.photoHint')}
                    {...form.register(`variants.${indexPath}.imageUrl`)}
                    {...error('imageUrl')}
                  />
                  <label className="variant-upload">
                    {t('admin:image.browse')}
                    <input
                      className="sr-only"
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      aria-label={t('admin:options.upload', { number: index + 1 })}
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        void readImageFile(file).then((result) => {
                          if (result.ok) {
                            form.setValue(`variants.${indexPath}.imageUrl`, result.dataUrl, {
                              shouldDirty: true,
                              shouldValidate: true,
                            });
                          } else {
                            form.setError(`variants.${indexPath}.imageUrl`, {
                              message: t(`admin:image.${result.error}`, { max: MAX_IMAGE_KB }),
                            });
                          }
                        });
                        event.target.value = '';
                      }}
                    />
                  </label>
                </div>
              </div>
            );
          })}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={fields.length >= 12}
          onClick={() => {
            append({
              id: crypto.randomUUID(),
              size: 'medium',
              heightCm: 40,
              pot: 'original',
              price: values.price,
              stock: values.inStock ? 10 : 0,
              imageUrl: values.imageUrl,
            });
          }}
        >
          <Plus size={17} aria-hidden="true" />
          {t('admin:options.add')}
        </Button>
      </section>
      <section className="product-editor-commerce">
        <div className="product-editor-commerce__heading">
          <Truck size={22} aria-hidden="true" />
          <h2>{t('admin:delivery.title')}</h2>
        </div>
        <p>{t('admin:delivery.hint')}</p>
        <fieldset className="product-editor-delivery-areas">
          <legend>{t('product:delivery.area')}</legend>
          {DELIVERY_AREAS.map((area) => (
            <label key={area}>
              <input
                type="checkbox"
                checked={areas.includes(area)}
                onChange={(event) => {
                  form.setValue(
                    'delivery.areas',
                    event.target.checked
                      ? [...areas, area]
                      : areas.filter((entry) => entry !== area),
                    { shouldDirty: true, shouldValidate: true },
                  );
                }}
              />
              {t(`product:delivery.areas.${area}`)}
            </label>
          ))}
        </fieldset>
        {form.formState.errors.delivery?.areas?.message && (
          <p role="alert">{form.formState.errors.delivery.areas.message}</p>
        )}
        <Input
          label={t('admin:delivery.dispatch')}
          description={t('admin:delivery.dispatchHint')}
          type="number"
          min={0}
          max={14}
          {...form.register('delivery.dispatchDays', { valueAsNumber: true })}
          {...(form.formState.errors.delivery?.dispatchDays?.message
            ? { error: form.formState.errors.delivery.dispatchDays.message }
            : {})}
        />
      </section>
    </>
  );
};
