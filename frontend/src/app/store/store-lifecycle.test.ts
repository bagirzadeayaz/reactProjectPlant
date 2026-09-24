import { afterEach, expect, it } from 'vitest';
import { cartActions, CART_STORAGE_KEY, loadCart } from '../../entities/cart';
import { makeStore } from './store';
import { connectStore } from './store-lifecycle';

afterEach(() => {
  globalThis.localStorage.removeItem(CART_STORAGE_KEY);
});

it('persists cart changes only while the store is connected', () => {
  const store = makeStore();
  store.dispatch(cartActions.added({ productId: 'p-1' }));
  expect(loadCart()).toBeUndefined();
  const disconnect = connectStore(store);
  try {
    store.dispatch(cartActions.added({ productId: 'p-1' }));
    expect(loadCart()?.lines).toEqual([{ productId: 'p-1', quantity: 2 }]);
  } finally {
    disconnect();
  }
  store.dispatch(cartActions.added({ productId: 'p-1' }));
  expect(loadCart()?.lines).toEqual([{ productId: 'p-1', quantity: 2 }]);
});
