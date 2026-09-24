import { type ComponentPropsWithRef } from 'react';
import { cn } from '../../lib/cn';
import { ICONS, type IconName } from './registry';

export type IconSize = 'md' | 'lg';

export interface IconProps extends Omit<ComponentPropsWithRef<'svg'>, 'children'> {
  name: IconName;
  size?: IconSize;
  /**
   * Accessible name. Omit it for an icon that only decorates text, and the
   * icon is hidden from assistive tech instead of read out twice.
   */
  label?: string;
}

/** Node 22:13 renders nav icons at 24px; node 22:101 uses 30px inside cards. */
const SIZES: Record<IconSize, string> = {
  md: 'size-(--size-icon)',
  lg: 'size-(--size-icon-lg)',
};

/**
 * The single way to render an icon.
 *
 * Decorative by default: without a `label` it is `aria-hidden`, so a button
 * that already has a text label is not announced twice.
 */
export const Icon = ({ name, size = 'md', label, className, ...props }: IconProps) => {
  const Glyph = ICONS[name];
  return (
    <Glyph
      className={cn('shrink-0', SIZES[size], className)}
      {...(label === undefined
        ? { 'aria-hidden': true, focusable: false }
        : { role: 'img', 'aria-label': label })}
      {...props}
    />
  );
};
