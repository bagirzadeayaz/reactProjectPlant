import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { Leaf } from '../leaf';

export interface StatusPageProps {
  code?: string;
  title: ReactNode;
  description?: ReactNode;
  role?: 'alert' | 'status';
  className?: string;
}

/** Standalone error content: no storefront navigation or promotional content. */
export const StatusPage = ({
  code,
  title,
  description,
  role = 'status',
  className,
}: StatusPageProps) => {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
  }, []);
  return (
    <section className={cn('status-page', className)} role={role}>
      <div className="status-page__botanical" aria-hidden="true">
        <Leaf className="status-page__leaf status-page__leaf--left" />
        <Leaf direction="right" className="status-page__leaf status-page__leaf--right" />
      </div>
      <div className="status-page__content">
        {code && (
          <p className="status-page__code" aria-hidden="true">
            {code}
          </p>
        )}
        <span className="status-page__divider" aria-hidden="true" />
        <h1 ref={heading} tabIndex={-1}>
          {title}
        </h1>
        {description && <p className="status-page__description">{description}</p>}
      </div>
    </section>
  );
};
