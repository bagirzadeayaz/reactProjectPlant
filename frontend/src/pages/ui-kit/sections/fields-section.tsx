import { Input, Section, Select, Textarea } from '../../../shared/ui';

const COPY = {
  title: 'Form fields',
  email: 'Email',
  emailHint: 'We never share it.',
  invalid: 'Invalid field',
  invalidError: 'This value is required',
  notes: 'Notes',
  category: 'Category',
  categoryPlaceholder: 'Choose a category',
} as const;

const OPTIONS = [
  { value: 'trendy', label: 'Trendy' },
  { value: 'top', label: 'Top selling' },
  { value: 'rare', label: 'Rare', disabled: true },
] as const;

/** Dev-only showcase. Strings stay in COPY so the i18n pass in prompt 6 is mechanical. */
export const FieldsSection = () => (
  <Section title={COPY.title} titleId="ui-kit-fields">
    <div className="grid gap-6 sm:grid-cols-2">
      <Input label={COPY.email} type="email" description={COPY.emailHint} />
      <Input label={COPY.invalid} error={COPY.invalidError} required />
      <Select
        label={COPY.category}
        options={OPTIONS}
        placeholder={COPY.categoryPlaceholder}
        defaultValue=""
      />
      <Textarea label={COPY.notes} />
    </div>
  </Section>
);
