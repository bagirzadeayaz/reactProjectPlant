import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface CartLine {
  productId: string;
  quantity: number;
}

export interface CartState {
  lines: CartLine[];
}

const initialState: CartState = { lines: [] };

/**
 * The cart holds product ids and quantities — never copies of products.
 *
 * A product's name and price live in the RTK Query cache; duplicating them here
 * is how a cart ends up showing yesterday's price (see ARCHITECTURE.md).
 */
export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    added: (state, action: PayloadAction<{ productId: string; quantity?: number }>) => {
      const quantity = action.payload.quantity ?? 1;
      const line = state.lines.find((item) => item.productId === action.payload.productId);
      if (line) {
        line.quantity += quantity;
      } else {
        state.lines.push({ productId: action.payload.productId, quantity });
      }
    },

    quantitySet: (state, action: PayloadAction<{ productId: string; quantity: number }>) => {
      const line = state.lines.find((item) => item.productId === action.payload.productId);
      if (!line) return;
      if (action.payload.quantity <= 0) {
        state.lines = state.lines.filter((item) => item.productId !== action.payload.productId);
        return;
      }
      line.quantity = action.payload.quantity;
    },

    removed: (state, action: PayloadAction<string>) => {
      state.lines = state.lines.filter((item) => item.productId !== action.payload);
    },

    cleared: (state) => {
      state.lines = [];
    },
  },
  selectors: {
    selectLines: (state) => state.lines,
    selectCount: (state) => state.lines.reduce((total, line) => total + line.quantity, 0),
    selectQuantity: (state, productId: string) =>
      state.lines.find((line) => line.productId === productId)?.quantity ?? 0,
  },
});

export const cartActions = cartSlice.actions;
export const cartSelectors = cartSlice.selectors;
