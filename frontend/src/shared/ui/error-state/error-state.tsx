import { type ReactNode } from 'react';
import { cn } from '../../lib/cn';

export interface ErrorStateProps {
  /** What went wrong, in the user's terms. Caller-supplied so it can be translated. */
  title: ReactNode;
  /** Optional detail or next step. Never a raw stack trace. */
  description?: ReactNode;
  /** Usually a "try again" Button. */
  action?: ReactNode;
  className?: string;
}

/**
 * Shown when something failed and the user may be able to recover.
 *
 * Uses `role="alert"`, so it interrupts and is announced as soon as it
 * appears — reserve it for real failures; an empty result is an EmptyState.
 */
export const ErrorState = ({ title, description, action, className }: ErrorStateProps) => (
  <div
    role="alert"
    className={cn('flex flex-col items-center gap-4 px-gutter py-16 text-center', className)}
  >
    <p className="text-h2 font-(--font-weight-heading) text-ink">{title}</p>
    {description !== undefined && (
      <p className="max-w-prose text-md text-ink-muted">{description}</p>
    )}
    {action !== undefined && <div className="mt-2">{action}</div>}
  </div>
);
