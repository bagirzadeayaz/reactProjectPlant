import { type ComponentPropsWithRef, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { Container } from '../container';

export interface SectionProps extends Omit<ComponentPropsWithRef<'section'>, 'title'> {
  /** Rendered as the section's heading. Supplied by the caller so it can be translated. */
  title?: ReactNode;
  /** Ties the heading to the section for assistive tech. Required when `title` is set. */
  titleId?: string;
  children: ReactNode;
}

/**
 * A vertical band of the page, with the comp's rhythm and content column.
 *
 * When given a `title` it renders an `<h2>` and points `aria-labelledby` at
 * it, so the section shows up as a named landmark rather than an anonymous
 * region.
 */
export const Section = ({ title, titleId, className, children, ...props }: SectionProps) => (
  <section
    className={cn('py-16 lg:py-24', className)}
    {...(title !== undefined && titleId !== undefined ? { 'aria-labelledby': titleId } : {})}
    {...props}
  >
    <Container>
      {title !== undefined && (
        <h2
          {...(titleId === undefined ? {} : { id: titleId })}
          className="mb-10 text-center text-h2 font-(--font-weight-heading) text-ink lg:text-h1"
        >
          {title}
        </h2>
      )}
      {children}
    </Container>
  </section>
);
