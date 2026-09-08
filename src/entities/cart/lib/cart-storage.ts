import type { CartState } from '../model/cart-slice';

export const CART_STORAGE_KEY = 'planto:cart';

const isCartState = (value: unknown): value is CartState =>
  typeof value === 'object' &&
  value !== null &&
  Array.isArray((value as { lines?: unknown }).lines) &&
  (value as { lines: unknown[] }).lines.every(
    (line) =>
      typeof line === 'object' &&
      line !== null &&
      typeof (line as { productId?: unknown }).productId === 'string' &&
      typeof (line as { quantity?: unknown }).quantity === 'number',
  );

/** The persisted cart, or undefined when there is none or it is unreadable. */
export const loadCart = (): CartState | undefined => {
  try {
    const raw = globalThis.localStorage.getItem(CART_STORAGE_KEY);
    if (raw === null) return undefined;
    const parsed: unknown = JSON.parse(raw);
    return isCartState(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
};

export const saveCart = (state: CartState): void => {
  try {
    globalThis.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or blocked: the in-memory cart still works for this session.
  }
};
