import { createSlice } from '@reduxjs/toolkit';
import type { Plant } from '../../types';
import { trendyPlants, topSellingPlants, featuredPlant } from '../../data/plants';

interface ProductsState {
  allPlants: Plant[];
  trendyPlants: Plant[];
  topSellingPlants: Plant[];
  featuredPlant: Plant;
}

const initialState: ProductsState = {
  allPlants: [...trendyPlants, ...topSellingPlants, featuredPlant],
  trendyPlants,
  topSellingPlants,
  featuredPlant,
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  selectors: {
    selectAllPlants: (state) => state.allPlants,
    selectTrendyPlants: (state) => state.trendyPlants,
    selectTopSellingPlants: (state) => state.topSellingPlants,
    selectFeaturedPlant: (state) => state.featuredPlant,
    selectPlantById: (state, id: number) =>
      state.allPlants.find((p) => p.id === id) ?? null,
  },
});

export const {
  selectAllPlants,
  selectTrendyPlants,
  selectTopSellingPlants,
  selectFeaturedPlant,
  selectPlantById,
} = productsSlice.selectors;

export default productsSlice.reducer;
