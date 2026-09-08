import { useTranslation } from 'react-i18next';
import { cn } from '../../shared/lib/cn';

export interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}

const stepClass = cn(
  'flex size-(--size-icon-button) items-center justify-center rounded-icon',
  'border-(length:--border-width-control) border-border-control text-ink-muted',
  'transition-colors hover:border-ink hover:text-ink',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink',
  'disabled:cursor-not-allowed disabled:opacity-40',
);

/** A labelled −/value/+ control that keeps its value inside [min, max]. */
export const QuantityStepper = ({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled = false,
}: QuantityStepperProps) => {
  const { t } = useTranslation('product');
  const clamp = (next: number): number => Math.min(max, Math.max(min, next));

  return (
    <div role="group" aria-label={t('quantity')} className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => {
          onChange(clamp(value - 1));
        }}
        disabled={disabled || value <= min}
        aria-label={t('decrease')}
        className={stepClass}
      >
        −
      </button>
      <input
        type="number"
        inputMode="numeric"
        aria-label={t('quantity')}
        min={min}
        max={max}
        value={value}
        disabled={disabled}
        onChange={(event) => {
          onChange(clamp(Number(event.target.value) || min));
        }}
        className="h-(--size-icon-button) w-16 rounded-icon border-(length:--border-width-control) border-border-control bg-transparent text-center text-lg text-ink [appearance:textfield] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button
        type="button"
        onClick={() => {
          onChange(clamp(value + 1));
        }}
        disabled={disabled || value >= max}
        aria-label={t('increase')}
        className={stepClass}
      >
        +
      </button>
    </div>
  );
};
