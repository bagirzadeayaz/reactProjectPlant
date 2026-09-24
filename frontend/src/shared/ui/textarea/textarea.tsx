import { type ComponentPropsWithRef, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { CONTROL_BASE, FieldShell, useFieldIds } from '../field';

export interface TextareaProps extends Omit<ComponentPropsWithRef<'textarea'>, 'children'> {
  label: ReactNode;
  description?: ReactNode;
  error?: string;
  containerClassName?: string;
}

/** A labelled multi-line text control. Same wiring as Input, taller box. */
export const Textarea = ({
  label,
  description,
  error,
  id,
  required = false,
  rows = 4,
  className,
  containerClassName,
  ...props
}: TextareaProps) => {
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
      <textarea
        id={ids.inputId}
        rows={rows}
        required={required}
        aria-invalid={ids.hasError || undefined}
        {...(ids.describedBy === undefined ? {} : { 'aria-describedby': ids.describedBy })}
        className={cn(CONTROL_BASE, 'resize-y py-3', className)}
        {...props}
      />
    </FieldShell>
  );
};
