import { type ReactNode } from 'react';
import { cn } from '../../lib/cn';

export interface SectionHeadingProps {
  /** Rendered as the <h2>. Caller-supplied so it can be translated. */
  children: ReactNode;
  id?: string;
  className?: string;
}

/**
 * A section heading with the comp's leaf motif either side (nodes 22:64,
 * 22:91, 22:147, 22:190): 55px semibold, white, centred, with a deep text
 * shadow that lifts it off the photograph.
 */
export const SectionHeading = ({ children, id, className }: SectionHeadingProps) => (
  <div className={cn('section-heading text-ink', className)}>
    <h2
      {...(id === undefined ? {} : { id })}
      className="min-w-0 text-balance text-center text-h2 font-(--font-weight-heading) [text-shadow:var(--shadow-heading)] sm:text-h1"
    >
      {children}
    </h2>
  </div>
);
