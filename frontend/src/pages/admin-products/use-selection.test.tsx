import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useSelection } from './use-selection';

describe('useSelection', () => {
  it('toggles single rows and selects or clears all visible rows', () => {
    const { result } = renderHook(() => useSelection(['a', 'b', 'c']));
    act(() => {
      result.current.toggle('a');
    });
    expect([...result.current.selected]).toEqual(['a']);

    act(() => {
      result.current.toggleAll();
    });
    expect([...result.current.selected]).toEqual(['a', 'b', 'c']);

    act(() => {
      result.current.toggleAll();
    });
    expect(result.current.selected.size).toBe(0);

    act(() => {
      result.current.toggle('b');
      result.current.toggle('b');
    });
    expect(result.current.selected.size).toBe(0);
  });

  it('prunes ids that are no longer visible', () => {
    const { result, rerender } = renderHook(({ ids }) => useSelection(ids), {
      initialProps: { ids: ['a', 'b'] },
    });
    act(() => {
      result.current.toggle('a');
      result.current.toggle('b');
    });
    rerender({ ids: ['b'] });
    expect([...result.current.selected]).toEqual(['b']);
    act(() => {
      result.current.clear();
    });
    expect(result.current.selected.size).toBe(0);
  });
});
