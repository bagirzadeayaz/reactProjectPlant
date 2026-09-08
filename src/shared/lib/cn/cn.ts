import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * The project's own scale names, taken from the `@theme` block in
 * src/index.css. tailwind-merge only knows Tailwind's stock scales, so
 * without this a caller's `rounded-icon` would sit next to the component's
 * `rounded-control` and both would apply — last-in-the-stylesheet wins rather
 * than last-in-the-call, which is not what a caller expects.
 *
 * Keep in sync with src/index.css. A token added there that a component
 * overrides belongs here too.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      radius: ['control', 'icon', 'avatar', 'panel', 'card'],
      text: ['display', 'h1', 'h2', 'logo', 'lg', 'md', 'base', 'sm'],
      color: [
        'ink',
        'ink-muted',
        'surface-footer',
        'surface-glass',
        'border-glass',
        'border-control',
      ],
      shadow: ['media', 'float', 'heading'],
      blur: ['panel'],
      spacing: ['page-margin', 'gutter'],
    },
  },
});

/**
 * Merge class names, letting later Tailwind utilities win over earlier ones.
 *
 * `clsx` flattens conditionals; the extended `twMerge` resolves conflicts so a
 * caller's `className` can override a component's defaults without
 * `!important`.
 */
export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs));
