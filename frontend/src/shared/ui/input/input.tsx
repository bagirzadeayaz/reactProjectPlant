import { type ComponentPropsWithRef, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { CONTROL_BASE, CONTROL_HEIGHT, FieldShell, useFieldIds } from '../field';

export interface InputProps extends Omit<ComponentPropsWithRef<'input'>, 'children'> {
  label: ReactNode;
  /** Hint shown under the control and linked via aria-describedby. */
  description?: ReactNode;
  /** Message shown under the control. Its presence sets aria-invalid. */
  error?: string;
  /** Class for the wrapper, not the control. */
  containerClassName?: string;
}

/** A labelled single-line text control. */
export const Input = ({
  label,
  description,
  error,
  id,
  required = false,
  className,
  containerClassName,
  ...props
}: InputProps) => {
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
      <input
        id={ids.inputId}
        required={required}
        aria-invalid={ids.hasError || undefined}
        {...(ids.describedBy === undefined ? {} : { 'aria-describedby': ids.describedBy })}
        className={cn(CONTROL_BASE, CONTROL_HEIGHT, className)}
        {...props}
      />
    </FieldShell>
  );
};
