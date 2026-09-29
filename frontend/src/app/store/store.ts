import { gardenSlice, loadGarden } from '../../entities/garden';
import { configureStore, createListenerMiddleware } from '@reduxjs/toolkit';
import { cartActions, cartSlice, loadCart } from '../../entities/cart';
import { companionActions, companionSlice, loadCompanion } from '../../entities/companion';
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
  const reactions = createListenerMiddleware();
  reactions.startListening({
    actionCreator: cartActions.added,
    effect: (_action, api) => {
      api.dispatch(companionActions.reacted('cart'));
    },
  });
  const store = configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
      [cartSlice.reducerPath]: cartSlice.reducer,
      garden: gardenSlice.reducer,
      companion: companionSlice.reducer,
    },
    preloadedState: {
      garden: loadGarden(),
      companion: loadCompanion(),
      cart: persistedCart ?? { lines: [] },
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().prepend(reactions.middleware).concat(baseApi.middleware),
  });

  return store;
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
