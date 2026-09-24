import { type ComponentPropsWithRef } from 'react';
import { cn } from '../../lib/cn';

export type LeafDirection = 'left' | 'right';

export interface LeafProps extends Omit<ComponentPropsWithRef<'svg'>, 'children'> {
  direction?: LeafDirection;
}

/**
 * The decorative leaf that flanks every section heading in the comp
 * (nodes 22:62/63, 22:93/94, 22:149/150, 22:192/193 — ~68 × 69 each).
 *
 * The comp's vectors were not exportable at build time, so this is a redrawn
 * leaf on the same box. Purely decorative: hidden from assistive tech.
 */
export const Leaf = ({ direction = 'left', className, ...props }: LeafProps) => (
  <svg
    viewBox="0 0 68 69"
    aria-hidden="true"
    focusable="false"
    className={cn(
      'size-(--size-leaf) fill-current',
      direction === 'right' && '-scale-x-100',
      className,
    )}
    {...props}
  >
    <path d="M62 6C38 6 18 20 10 44c-2 6-3 12-3 19 7 0 13-1 19-3C50 52 62 30 62 6Zm-8 9c-2 16-11 30-25 37 8-11 15-24 25-37Z" />
  </svg>
);
