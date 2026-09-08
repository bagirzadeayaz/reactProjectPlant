import { useTranslation } from 'react-i18next';
import type { UseFormReturn } from 'react-hook-form';
import { LOCALES, type Locale } from '../../../shared/api';
import { Input, Textarea } from '../../../shared/ui';
import type { ProductFormValues } from '../lib/form-values';

export interface LocalizedFieldsProps {
  form: UseFormReturn<ProductFormValues>;
  field: 'name' | 'description';
  multiline?: boolean;
}

/**
 * One localized field as two side-by-side controls, one per language.
 *
 * Both languages are required by the schema, so leaving one empty is a
 * validation error on submit. Before that, while the user is still typing, a
 * warning says what a shopper in the other language would actually see —
 * that is the difference between a rule and a reason.
 */
export const LocalizedFields = ({ form, field, multiline = false }: LocalizedFieldsProps) => {
  const { t } = useTranslation('admin');
  const { register, watch, formState } = form;
  const values = watch(field);
  const filled = LOCALES.filter((locale) => values[locale].trim() !== '');
  const missing = filled.length === 1 ? LOCALES.filter((l) => !filled.includes(l)) : [];
  const Control = multiline ? Textarea : Input;

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="text-lg text-ink">{t(`fields.${field}`)}</legend>
      <div className="grid gap-4 sm:grid-cols-2">
        {LOCALES.map((locale: Locale) => {
          const error = formState.errors[field]?.[locale]?.message;
          return (
            <Control
              key={locale}
              label={t(`languages.${locale}`)}
              lang={locale}
              {...(error === undefined ? {} : { error })}
              {...register(`${field}.${locale}`)}
            />
          );
        })}
      </div>
      {missing.map((locale) => (
        <p key={locale} role="status" className="text-sm text-ink-muted">
          {t(`languages.missing_${locale}`)}
        </p>
      ))}
    </fieldset>
  );
};
