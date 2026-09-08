import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
  id: number;
  name: string;
  image: string;
  price: number;
  qty: number;
}

interface CartState {
  items: CartItem[];
}

const initialState: CartState = {
  items: [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(state, action: PayloadAction<Omit<CartItem, 'qty'> & { qty?: number }>) {
      const { id, qty = 1, ...rest } = action.payload;
      const existing = state.items.find((item) => item.id === id);
      if (existing) {
        existing.qty += qty;
      } else {
        state.items.push({ id, qty, ...rest });
      }
    },
    removeFromCart(state, action: PayloadAction<number>) {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    updateQty(state, action: PayloadAction<{ id: number; qty: number }>) {
      const item = state.items.find((i) => i.id === action.payload.id);
      if (item) {
        item.qty = Math.max(1, action.payload.qty);
      }
    },
    clearCart(state) {
      state.items = [];
    },
  },
  selectors: {
    selectCartItems: (state) => state.items,
    selectCartCount: (state) => state.items.reduce((sum, i) => sum + i.qty, 0),
    selectCartTotal: (state) => state.items.reduce((sum, i) => sum + i.price * i.qty, 0),
  },
});

export const { addToCart, removeFromCart, updateQty, clearCart } = cartSlice.actions;
export const { selectCartItems, selectCartCount, selectCartTotal } = cartSlice.selectors;

export default cartSlice.reducer;
