/**
 * Shared chrome for text-entry controls. Matches the comp's outlined control
 * (node 22:29): a 2px 75%-white border on a transparent fill, 13px radius.
 */
export const CONTROL_BASE =
  'w-full rounded-control border-(length:--border-width-control) border-border-control ' +
  'bg-transparent px-4 text-md text-ink placeholder:text-ink-muted ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink ' +
  'focus-visible:ring-offset-2 focus-visible:ring-offset-surface-footer ' +
  'disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-ink';

export const CONTROL_HEIGHT = 'h-(--size-control-h)';
