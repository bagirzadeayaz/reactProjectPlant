const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

/**
 * Elements inside `root` that can take focus, in tab order.
 *
 * `offsetParent` is null for anything `display: none`, which keeps hidden
 * controls out of the trap. jsdom reports 0 for every layout box, so the
 * check is deliberately loose — it filters what it can and lets the rest
 * through rather than emptying the list under test.
 */
export const getFocusable = (root: HTMLElement): HTMLElement[] =>
  Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) => !element.hasAttribute('inert') && element.getAttribute('aria-hidden') !== 'true',
  );
