import { type ReactNode } from 'react';
import { cn } from '../../lib/cn';

export interface EmptyStateProps {
  /** Short statement of what is not here. Caller-supplied so it can be translated. */
  title: ReactNode;
  /** Optional sentence on what to do about it. */
  description?: ReactNode;
  /** Decorative illustration or icon. */
  media?: ReactNode;
  /** A single next step, usually a Button. */
  action?: ReactNode;
  className?: string;
}

/**
 * Shown where content would be if there were any — an empty cart, a search
 * with no matches.
 *
 * Not an error: nothing has gone wrong, so this is a plain `status` region and
 * never an `alert`.
 */
export const EmptyState = ({ title, description, media, action, className }: EmptyStateProps) => (
  <div
    role="status"
    className={cn('flex flex-col items-center gap-4 px-gutter py-16 text-center', className)}
  >
    {media !== undefined && <div aria-hidden="true">{media}</div>}
    <p className="text-h2 font-(--font-weight-heading) text-ink">{title}</p>
    {description !== undefined && (
      <p className="max-w-prose text-md text-ink-muted">{description}</p>
    )}
    {action !== undefined && <div className="mt-2">{action}</div>}
  </div>
);
