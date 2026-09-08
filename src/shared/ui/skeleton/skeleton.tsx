import { type ComponentPropsWithRef } from 'react';
import { cn } from '../../lib/cn';

export type SkeletonProps = Omit<ComponentPropsWithRef<'div'>, 'children'>;

/**
 * A placeholder for content that has not arrived.
 *
 * Hidden from assistive tech — a screen reader should hear the loading state
 * announced once, from the region's own `aria-busy` or a Spinner, not from
 * every grey box on the page. Size it from the caller.
 */
export const Skeleton = ({ className, ...props }: SkeletonProps) => (
  <div
    aria-hidden="true"
    data-testid="skeleton"
    className={cn('animate-pulse rounded-control bg-surface-glass', className)}
    {...props}
  />
);
