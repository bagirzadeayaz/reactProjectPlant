import { type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import type { FieldIds } from './use-field-ids';

export interface FieldShellProps {
  ids: FieldIds;
  /** Visible label text. Caller-supplied so it can be translated. */
  label: ReactNode;
  description?: ReactNode;
  error?: string;
  /** Appends a visual required marker. The control still carries `required`. */
  required?: boolean;
  className?: string;
  children: ReactNode;
}

/**
 * Label, control, hint and error in the order a form field needs them.
 *
 * The error is a live region so a message that appears after submit is
 * announced without moving focus away from the control.
 */
export const FieldShell = ({
  ids,
  label,
  description,
  error,
  required = false,
  className,
  children,
}: FieldShellProps) => (
  <div className={cn('flex flex-col gap-2', className)}>
    <label htmlFor={ids.inputId} className="text-md text-ink">
      {label}
      {required && (
        <span aria-hidden="true" className="ml-1 text-ink-muted">
          *
        </span>
      )}
    </label>

    {children}

    {description !== undefined && ids.descriptionId !== undefined && (
      <p id={ids.descriptionId} className="text-sm text-ink-muted">
        {description}
      </p>
    )}

    {ids.errorId !== undefined && (
      <p id={ids.errorId} role="alert" className="text-sm text-ink">
        {error}
      </p>
    )}
  </div>
);
