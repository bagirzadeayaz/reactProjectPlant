import { saveGarden } from '../../entities/garden';
import { setupListeners } from '@reduxjs/toolkit/query';
import { saveCart } from '../../entities/cart';
import type { AppStore } from './store';

/** Attach browser effects after mount; dispose them on unmount or store replacement. */
export const connectStore = (store: AppStore): (() => void) => {
  let lastGarden = store.getState().garden;
  let lastCart = store.getState().cart;
  const unsubscribe = store.subscribe(() => {
    const { cart, garden } = store.getState();
    if (garden !== lastGarden) {
      lastGarden = garden;
      saveGarden(garden);
    }
    if (cart !== lastCart) {
      lastCart = cart;
      saveCart(cart);
    }
  });
  const removeListeners = setupListeners(store.dispatch);
  return () => {
    unsubscribe();
    removeListeners();
  };
};
