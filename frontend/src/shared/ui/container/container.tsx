import { type ComponentPropsWithRef, type ElementType } from 'react';
import { cn } from '../../lib/cn';

export interface ContainerProps extends ComponentPropsWithRef<'div'> {
  /** Element to render. Use `main`, `header` or `footer` where that is the truth. */
  as?: ElementType;
}

/**
 * Holds the page's content column.
 *
 * The comp is 1728 wide with a 77px margin on each side, leaving 1574px of
 * content — three 512px columns and two 19px gutters. Below that width the
 * margin collapses to the gutter so narrow screens do not lose half their
 * space to whitespace.
 */
export const Container = ({ as: Component = 'div', className, ...props }: ContainerProps) => (
  <Component
    className={cn('site-container mx-auto w-full max-w-(--size-frame)', className)}
    {...props}
  />
);
