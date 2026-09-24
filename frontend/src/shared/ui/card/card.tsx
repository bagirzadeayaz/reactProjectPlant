import { type ComponentPropsWithRef, type ElementType } from 'react';
import { cn } from '../../lib/cn';

export type CardTone = 'glass' | 'plain';

export interface CardProps extends ComponentPropsWithRef<'div'> {
  as?: ElementType;
  /**
   * `glass` is the comp's frosted panel (node 22:65): a 5%-white fill behind a
   * 3px 45%-white border with an 11px backdrop blur. `plain` drops the
   * treatment for cards that sit on an already-busy surface.
   */
  tone?: CardTone;
}

const TONES: Record<CardTone, string> = {
  glass:
    'bg-surface-glass border-(length:--border-width-panel) border-border-glass backdrop-blur-panel',
  plain: 'bg-transparent',
};

/** A surface that groups related content. Layout only — it owns no spacing rhythm. */
export const Card = ({ as: Component = 'div', tone = 'glass', className, ...props }: CardProps) => (
  <Component className={cn('overflow-hidden rounded-panel', TONES[tone], className)} {...props} />
);
