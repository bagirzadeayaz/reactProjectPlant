import type { CartState } from '../model/cart-slice';
import { DELIVERY_AREAS } from '../../../shared/commerce';

export const CART_STORAGE_KEY = 'planto:cart';

const isCartState = (value: unknown): value is CartState =>
  typeof value === 'object' &&
  value !== null &&
  Array.isArray((value as { lines?: unknown }).lines) &&
  ((value as CartState).area === undefined ||
    DELIVERY_AREAS.some((area) => area === (value as CartState).area)) &&
  (value as { lines: unknown[] }).lines.every(
    (line) =>
      typeof line === 'object' &&
      line !== null &&
      typeof (line as { productId?: unknown }).productId === 'string' &&
      Number.isInteger((line as { quantity?: unknown }).quantity) &&
      (line as { quantity: number }).quantity > 0 &&
      (line as { quantity: number }).quantity <= 99 &&
      ((line as { variantId?: unknown }).variantId === undefined ||
        typeof (line as { variantId?: unknown }).variantId === 'string'),
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
