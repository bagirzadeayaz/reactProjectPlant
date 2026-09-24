import { afterEach, describe, expect, it } from 'vitest';
import { CART_STORAGE_KEY, loadCart, saveCart } from './cart-storage';

describe('cart storage', () => {
  afterEach(() => {
    globalThis.localStorage.removeItem(CART_STORAGE_KEY);
  });

  it('round-trips a cart', () => {
    saveCart({ lines: [{ productId: 'p-1', quantity: 2 }] });
    expect(loadCart()).toEqual({ lines: [{ productId: 'p-1', quantity: 2 }] });
  });

  it('is undefined when nothing was saved', () => {
    expect(loadCart()).toBeUndefined();
  });

  it('ignores a value that is not a cart', () => {
    globalThis.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ lines: [{ productId: 3 }] }));
    expect(loadCart()).toBeUndefined();
    globalThis.localStorage.setItem(CART_STORAGE_KEY, 'not json');
    expect(loadCart()).toBeUndefined();
  });
});
