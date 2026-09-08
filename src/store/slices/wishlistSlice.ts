import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface WishlistState {
  ids: number[];
}

const initialState: WishlistState = {
  ids: [],
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    toggleWishlist(state, action: PayloadAction<number>) {
      const id = action.payload;
      if (state.ids.includes(id)) {
        state.ids = state.ids.filter((i) => i !== id);
      } else {
        state.ids.push(id);
      }
    },
  },
  selectors: {
    selectWishlistIds: (state) => state.ids,
    selectIsWishlisted: (state, id: number) => state.ids.includes(id),
  },
});

export const { toggleWishlist } = wishlistSlice.actions;
export const { selectWishlistIds, selectIsWishlisted } = wishlistSlice.selectors;

export default wishlistSlice.reducer;
