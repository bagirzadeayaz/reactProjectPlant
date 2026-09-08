/**
 * Button styling, kept beside the component so the component file stays about
 * behavior. Every value resolves to a token from the `@theme` block in
 * src/index.css — see the node ids cited there.
 */
export const BUTTON_VARIANTS = {
  /** Node 22:29 — 2px outlined control, transparent fill, muted label. */
  primary:
    'border-(length:--border-width-control) border-border-control text-ink-muted hover:text-ink hover:border-ink',
  /** Node 22:70 — the same control paired with a square icon affordance. */
  'primary-with-icon':
    'border-(length:--border-width-control) border-border-control text-ink-muted hover:text-ink hover:border-ink gap-gutter',
  /** Node 22:44 — label only, no chrome. */
  ghost: 'border-0 text-ink-muted hover:text-ink underline-offset-4 hover:underline',
} as const;

export const BUTTON_SIZES = {
  /** Node 22:29 — 180 × 58 at 24px. The 180 minimum is a desktop value; at
   *  320px it would force a card wider than the screen, so it applies from sm. */
  md: 'h-(--size-control-h) px-6 text-lg sm:min-w-(--size-control-w)',
  /** Three-quarter scale for dense rows. */
  sm: 'h-11 px-4 text-sm',
} as const;

export const BUTTON_BASE =
  'inline-flex items-center justify-center rounded-control font-sans transition-colors ' +
  'active:translate-y-px motion-safe:transition-transform ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink ' +
  'focus-visible:ring-offset-2 focus-visible:ring-offset-surface-footer ' +
  'disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50';

export type ButtonVariant = keyof typeof BUTTON_VARIANTS;
export type ButtonSize = keyof typeof BUTTON_SIZES;
