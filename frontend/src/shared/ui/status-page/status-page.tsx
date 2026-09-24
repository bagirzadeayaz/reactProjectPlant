import { type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { Card } from '../card';
import { Container } from '../container';
import { Leaf } from '../leaf';

export interface StatusPageProps {
  /** Large decorative figure — "404". Hidden from assistive tech. */
  code?: string;
  /** The page's `<h1>`. Caller-supplied so it can be translated. */
  title: ReactNode;
  description?: ReactNode;
  /** Usually one Button — the way out. */
  action?: ReactNode;
  /** `alert` for something that went wrong, `status` for a dead end. */
  role?: 'alert' | 'status';
  className?: string;
}

/**
 * A whole-page state — not found, crashed — in the comp's own voice: the
 * section-heading leaves, the display size, the frosted panel. The title is
 * the `<h1>` so the router still has a heading to announce and focus.
 */
export const StatusPage = ({
  code,
  title,
  description,
  action,
  role = 'status',
  className,
}: StatusPageProps) => (
  <Container as="section" className={cn('py-12 sm:py-16 lg:py-20', className)}>
    <Card
      role={role}
      className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-12 text-center sm:px-12 sm:py-16"
    >
      <div aria-hidden="true" className="flex items-end gap-4">
        <Leaf direction="left" className="size-8 sm:size-(--size-leaf)" />
        {code !== undefined && (
          <span className="font-(--font-weight-heading) text-h1 leading-none text-ink [text-shadow:var(--shadow-heading)] sm:text-display">
            {code}
          </span>
        )}
        <Leaf direction="right" className="size-8 sm:size-(--size-leaf)" />
      </div>
      <h1 className="text-h2 font-(--font-weight-heading) text-ink lg:text-h1">{title}</h1>
      {description !== undefined && (
        <p className="max-w-prose text-lg text-ink-muted">{description}</p>
      )}
      {action !== undefined && <div className="mt-2">{action}</div>}
    </Card>
  </Container>
);
