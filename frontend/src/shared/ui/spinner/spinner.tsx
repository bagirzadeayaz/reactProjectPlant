import { type ComponentPropsWithRef } from 'react';
import { cn } from '../../lib/cn';

export interface SpinnerProps extends Omit<ComponentPropsWithRef<'span'>, 'children'> {
  /**
   * Accessible description of what is loading. Rendered visually hidden.
   * Callers supply this text so it can go through i18n at the call site.
   */
  label?: string;
}

/**
 * An indeterminate progress indicator.
 *
 * Renders `role="status"`, so a screen reader announces it when it appears.
 * When used inside a control that already announces its own busy state, pass
 * `aria-hidden` and omit the label.
 */
export const Spinner = ({ className, label, ...props }: SpinnerProps) => (
  <span role="status" className={cn('inline-flex items-center', className)} {...props}>
    <span
      aria-hidden="true"
      className="size-[1em] animate-spin rounded-full border-2 border-current border-t-transparent"
    />
    {label !== undefined && <span className="sr-only">{label}</span>}
  </span>
);
