import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { DeliveryArea } from '../../../shared/commerce';

export interface CartLine {
  productId: string;
  quantity: number;
  variantId?: string;
}

export interface CartState {
  lines: CartLine[];
  area?: DeliveryArea;
}

const initialState: CartState = { lines: [], area: 'baku' };
interface LineIdentity {
  productId: string;
  variantId?: string;
}
export const cartLineKey = (line: LineIdentity): string =>
  `${line.productId}:${line.variantId ?? ''}`;
const sameLine = (left: LineIdentity, right: LineIdentity) =>
  cartLineKey(left) === cartLineKey(right);

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
    added: (state, action: PayloadAction<LineIdentity & { quantity?: number; max?: number }>) => {
      const quantity = Math.max(1, Math.floor(action.payload.quantity ?? 1));
      const max = Math.min(99, action.payload.max ?? 99);
      if (max < 1) return;
      const line = state.lines.find((item) => sameLine(item, action.payload));
      if (line) {
        line.quantity = Math.min(max, line.quantity + quantity);
      } else {
        state.lines.push({
          productId: action.payload.productId,
          ...(action.payload.variantId ? { variantId: action.payload.variantId } : {}),
          quantity: Math.min(max, quantity),
        });
      }
    },

    quantitySet: (
      state,
      action: PayloadAction<LineIdentity & { quantity: number; max?: number }>,
    ) => {
      const line = state.lines.find((item) => sameLine(item, action.payload));
      if (!line) return;
      if (action.payload.quantity <= 0) {
        state.lines = state.lines.filter((item) => !sameLine(item, action.payload));
        return;
      }
      line.quantity = Math.min(99, action.payload.max ?? 99, Math.floor(action.payload.quantity));
    },

    removed: (state, action: PayloadAction<LineIdentity>) => {
      state.lines = state.lines.filter((item) => !sameLine(item, action.payload));
    },

    cleared: (state) => {
      state.lines = [];
    },
    areaSet: (state, action: PayloadAction<DeliveryArea>) => {
      state.area = action.payload;
    },
    legacyMapped: (state, action: PayloadAction<{ productId: string; variantId: string }>) => {
      const legacy = state.lines.find(
        (line) => line.productId === action.payload.productId && !line.variantId,
      );
      if (!legacy) return;
      const selected = state.lines.find((line) => sameLine(line, action.payload));
      if (selected) {
        selected.quantity += legacy.quantity;
        state.lines = state.lines.filter(
          (line) => line.productId !== action.payload.productId || line.variantId !== undefined,
        );
      } else legacy.variantId = action.payload.variantId;
    },
  },
  selectors: {
    selectLines: (state) => state.lines,
    selectCount: (state) => state.lines.reduce((total, line) => total + line.quantity, 0),
    selectQuantity: (state, productId: string) =>
      state.lines
        .filter((line) => line.productId === productId)
        .reduce((sum, line) => sum + line.quantity, 0),
  },
});

export const cartActions = cartSlice.actions;
export const cartSelectors = cartSlice.selectors;
