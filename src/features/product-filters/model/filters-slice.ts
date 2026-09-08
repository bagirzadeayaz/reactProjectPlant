import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export const PRODUCT_SORTS = ['newest', 'price-asc', 'price-desc', 'name-asc'] as const;
export type ProductSort = (typeof PRODUCT_SORTS)[number];

export interface FiltersState {
  search: string;
  category: string | null;
  sort: ProductSort;
  page: number;
}

const initialState: FiltersState = {
  search: '',
  category: null,
  sort: 'newest',
  page: 1,
};

/**
 * What the user is asking the catalog for. Pure UI state — it becomes query
 * params, and the results themselves stay in the RTK Query cache.
 *
 * Every filter change resets the page: leaving a user on page 4 of a result set
 * that now has one page shows an empty grid and looks like a bug.
 */
export const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    searchChanged: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
      state.page = 1;
    },
    categoryChanged: (state, action: PayloadAction<string | null>) => {
      state.category = action.payload;
      state.page = 1;
    },
    sortChanged: (state, action: PayloadAction<ProductSort>) => {
      state.sort = action.payload;
      state.page = 1;
    },
    pageChanged: (state, action: PayloadAction<number>) => {
      state.page = Math.max(1, action.payload);
    },
    reset: () => initialState,
  },
  selectors: {
    selectFilters: (state) => state,
    selectSearch: (state) => state.search,
    selectCategory: (state) => state.category,
    selectSort: (state) => state.sort,
    selectPage: (state) => state.page,
  },
});

export const filtersActions = filtersSlice.actions;
export const filtersSelectors = filtersSlice.selectors;
