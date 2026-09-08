import { describe, expect, it } from 'vitest';
import { filtersActions, filtersSlice } from './filters-slice';

const initial = filtersSlice.getInitialState();
const reduce = filtersSlice.reducer;

describe('filtersSlice', () => {
  it('defaults to an unfiltered first page sorted by newest', () => {
    expect(initial).toStrictEqual({ search: '', category: null, sort: 'newest', page: 1 });
  });

  it('records a search term', () => {
    expect(reduce(initial, filtersActions.searchChanged('calathea')).search).toBe('calathea');
  });

  it('resets to page 1 whenever a filter changes', () => {
    const onPageFour = reduce(initial, filtersActions.pageChanged(4));
    expect(onPageFour.page).toBe(4);

    expect(reduce(onPageFour, filtersActions.searchChanged('desk')).page).toBe(1);
    expect(reduce(onPageFour, filtersActions.categoryChanged('trendy')).page).toBe(1);
    expect(reduce(onPageFour, filtersActions.sortChanged('price-asc')).page).toBe(1);
  });

  it('clamps the page to at least 1', () => {
    expect(reduce(initial, filtersActions.pageChanged(0)).page).toBe(1);
    expect(reduce(initial, filtersActions.pageChanged(-3)).page).toBe(1);
  });

  it('clears the category with null', () => {
    const filtered = reduce(initial, filtersActions.categoryChanged('trendy'));
    expect(reduce(filtered, filtersActions.categoryChanged(null)).category).toBeNull();
  });

  it('resets everything', () => {
    let state = reduce(initial, filtersActions.searchChanged('desk'));
    state = reduce(state, filtersActions.sortChanged('price-desc'));
    expect(reduce(state, filtersActions.reset())).toStrictEqual(initial);
  });
});
