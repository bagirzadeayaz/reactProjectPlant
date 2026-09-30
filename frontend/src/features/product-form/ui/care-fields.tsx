import type { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Select } from '../../../shared/ui';
import type { ProductFormValues } from '../lib/form-values';

const CARE_FIELDS = [
  'light',
  'watering',
  'size',
  'effort',
  'humidity',
  'pets',
] as const;

export const CareFields = ({ form }: { form: UseFormReturn<ProductFormValues> }) => {
  const { t } = useTranslation(['admin', 'product']);
  const values = form.watch('care');
  const options = {
    light: [
      { value: 'low', label: t('product:care.light.low') },
      { value: 'bright', label: t('product:care.light.bright') },
      { value: 'direct', label: t('product:care.light.direct') },
    ],
    watering: [
      { value: 'dry', label: t('product:care.watering.dry') },
      { value: 'top-dry', label: t('product:care.watering.top-dry') },
      { value: 'moist', label: t('product:care.watering.moist') },
    ],
    size: [
      { value: 'compact', label: t('product:care.size.compact') },
      { value: 'medium', label: t('product:care.size.medium') },
      { value: 'large', label: t('product:care.size.large') },
    ],
    effort: [
      { value: 'easy', label: t('product:care.effort.easy') },
      { value: 'regular', label: t('product:care.effort.regular') },
    ],
    humidity: [
      { value: 'average', label: t('product:care.humidity.average') },
      { value: 'high', label: t('product:care.humidity.high') },
    ],
    pets: [
      { value: 'safe', label: t('product:care.pets.safe') },
      { value: 'toxic', label: t('product:care.pets.toxic') },
      { value: 'unknown', label: t('product:care.pets.unknown') },
    ],
  };
  const labels = {
    light: t('product:care.light.label'),
    watering: t('product:care.watering.label'),
    size: t('product:care.size.label'),
    effort: t('product:care.effort.label'),
    humidity: t('product:care.humidity.label'),
    pets: t('product:care.pets.label'),
  };
  return (
    <fieldset className="product-editor-care">
      <legend>{t('admin:care.title')}</legend>
      <p>{t('admin:care.hint')}</p>
      <div className="product-editor-care__grid">
        {CARE_FIELDS.map((key) => (
          <Select
            key={key}
            label={labels[key]}
            options={options[key]}
            value={values[key]}
            {...registerCare(form, key)}
          />
        ))}
      </div>
    </fieldset>
  );
};

const registerCare = (
  form: UseFormReturn<ProductFormValues>,
  key: (typeof CARE_FIELDS)[number],
) => form.register(`care.${key}`);
