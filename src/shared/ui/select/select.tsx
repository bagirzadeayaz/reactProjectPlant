import { type ComponentPropsWithRef, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { CONTROL_BASE, CONTROL_HEIGHT, FieldShell, useFieldIds } from '../field';
import { Icon } from '../icon';

export interface SelectOption {
  value: string;
  /** Visible text. Caller-supplied so it can be translated. */
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<ComponentPropsWithRef<'select'>, 'children'> {
  label: ReactNode;
  options: readonly SelectOption[];
  /** Shown as a non-selectable first row when the value is empty. */
  placeholder?: string;
  description?: ReactNode;
  error?: string;
  containerClassName?: string;
}

/**
 * A labelled single-choice control.
 *
 * Wraps the native `<select>` rather than rebuilding it: the platform already
 * gives keyboard support, type-ahead and the mobile picker for free.
 */
export const Select = ({
  label,
  options,
  placeholder,
  description,
  error,
  id,
  required = false,
  className,
  containerClassName,
  ...props
}: SelectProps) => {
  const ids = useFieldIds(description !== undefined, error, id);

  return (
    <FieldShell
      ids={ids}
      label={label}
      required={required}
      {...(description === undefined ? {} : { description })}
      {...(error === undefined ? {} : { error })}
      {...(containerClassName === undefined ? {} : { className: containerClassName })}
    >
      <div className="relative">
        <select
          id={ids.inputId}
          required={required}
          aria-invalid={ids.hasError || undefined}
          {...(ids.describedBy === undefined ? {} : { 'aria-describedby': ids.describedBy })}
          className={cn(CONTROL_BASE, CONTROL_HEIGHT, 'appearance-none pr-12', className)}
          {...props}
        >
          {placeholder !== undefined && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled ?? false}>
              {option.label}
            </option>
          ))}
        </select>
        <Icon
          name="chevron"
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink-muted"
        />
      </div>
    </FieldShell>
  );
};
