import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { cartSlice, loadCart, saveCart } from '../../entities/cart';
import { baseApi } from '../../shared/api';

/**
 * Builds a store. Tests call this per test so no state leaks between them; the
 * app calls it once in `main.tsx`.
 *
 * The split is deliberate: `api` holds every byte that came from the server;
 * `cart` holds only what the user has done in this browser. Catalog filters
 * live in the URL (see `features/product-filters`), not in the store.
 */
export const makeStore = () => {
  const persistedCart = loadCart();
  const store = configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
      [cartSlice.reducerPath]: cartSlice.reducer,
    },
    ...(persistedCart === undefined ? {} : { preloadedState: { cart: persistedCart } }),
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
  });

  // The cart is the one slice that must outlive the tab. Persist on change,
  // and only when it actually changed, so unrelated dispatches cost nothing.
  let lastCart = store.getState().cart;
  store.subscribe(() => {
    const { cart } = store.getState();
    if (cart !== lastCart) {
      lastCart = cart;
      saveCart(cart);
    }
  });

  // Refetch on reconnect / refocus.
  setupListeners(store.dispatch);
  return store;
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
