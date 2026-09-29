import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { z } from 'zod';
const schema = z.object({
  saved: z.array(z.string()).max(100),
  compare: z.array(z.string()).max(3),
  checked: z.array(z.string()).max(1000),
});
export type GardenState = z.infer<typeof schema>;
export const GARDEN_KEY = 'planto:garden';
export const loadGarden = (): GardenState => {
  try {
    const result = schema.safeParse(JSON.parse(localStorage.getItem(GARDEN_KEY) ?? 'null'));
    if (result.success) return result.data;
  } catch {
    /* Storage can be unavailable. */
  }
  return { saved: [], compare: [], checked: [] };
};
export const saveGarden = (state: GardenState): void => {
  try {
    localStorage.setItem(GARDEN_KEY, JSON.stringify(state));
  } catch {
    /* Keep the current session usable. */
  }
};
export const gardenSlice = createSlice({
  name: 'garden',
  initialState: (): GardenState => ({ saved: [], compare: [], checked: [] }),
  reducers: {
    replaced: (state, action: PayloadAction<{ previous: string; next: string }>) => {
      const index = state.compare.indexOf(action.payload.previous);
      if (index >= 0 && !state.compare.includes(action.payload.next))
        state.compare[index] = action.payload.next;
    },
    toggled: (state, action: PayloadAction<{ list: 'saved' | 'compare'; id: string }>) => {
      const { list, id } = action.payload;
      const at = state[list].indexOf(id);
      if (at >= 0) state[list].splice(at, 1);
      else if (state[list].length < (list === 'compare' ? 3 : 100)) state[list].push(id);
    },
    checked: (state, action: PayloadAction<string>) => {
      const at = state.checked.indexOf(action.payload);
      if (at >= 0) state.checked.splice(at, 1);
      else {
        state.checked.push(action.payload);
        if (state.checked.length > 1000) state.checked.shift();
      }
    },
    cleared: (state, action: PayloadAction<'saved' | 'compare'>) => {
      state[action.payload] = [];
    },
  },
});
export const gardenActions = gardenSlice.actions;
export const selectGarden = (state: { garden: GardenState }): GardenState => state.garden;
