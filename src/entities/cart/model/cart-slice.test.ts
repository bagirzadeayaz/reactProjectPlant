import { describe, expect, it } from 'vitest';
import { cartActions, cartSlice, type CartState } from './cart-slice';

const reduce = (state: CartState, action: Parameters<typeof cartSlice.reducer>[1]): CartState =>
  cartSlice.reducer(state, action);

const empty: CartState = { lines: [] };

describe('cartSlice', () => {
  it('starts empty', () => {
    expect(cartSlice.getInitialState()).toStrictEqual(empty);
  });

  it('adds a line', () => {
    const state = reduce(empty, cartActions.added({ productId: 'p-1' }));
    expect(state.lines).toStrictEqual([{ productId: 'p-1', quantity: 1 }]);
  });

  it('increments an existing line rather than duplicating it', () => {
    let state = reduce(empty, cartActions.added({ productId: 'p-1' }));
    state = reduce(state, cartActions.added({ productId: 'p-1', quantity: 2 }));
    expect(state.lines).toStrictEqual([{ productId: 'p-1', quantity: 3 }]);
  });

  it('sets an explicit quantity', () => {
    let state = reduce(empty, cartActions.added({ productId: 'p-1' }));
    state = reduce(state, cartActions.quantitySet({ productId: 'p-1', quantity: 5 }));
    expect(state.lines[0]?.quantity).toBe(5);
  });

  it('removes the line when the quantity drops to zero', () => {
    let state = reduce(empty, cartActions.added({ productId: 'p-1' }));
    state = reduce(state, cartActions.quantitySet({ productId: 'p-1', quantity: 0 }));
    expect(state.lines).toStrictEqual([]);
  });

  it('ignores a quantity change for a product not in the cart', () => {
    const state = reduce(empty, cartActions.quantitySet({ productId: 'ghost', quantity: 3 }));
    expect(state.lines).toStrictEqual([]);
  });

  it('removes and clears', () => {
    let state = reduce(empty, cartActions.added({ productId: 'p-1' }));
    state = reduce(state, cartActions.added({ productId: 'p-2' }));
    state = reduce(state, cartActions.removed('p-1'));
    expect(state.lines.map((line) => line.productId)).toStrictEqual(['p-2']);

    state = reduce(state, cartActions.cleared());
    expect(state.lines).toStrictEqual([]);
  });

  it('counts total items across lines', () => {
    let state = reduce(empty, cartActions.added({ productId: 'p-1', quantity: 2 }));
    state = reduce(state, cartActions.added({ productId: 'p-2', quantity: 3 }));
    expect(cartSlice.selectors.selectCount({ cart: state })).toBe(5);
    expect(cartSlice.selectors.selectQuantity({ cart: state }, 'p-2')).toBe(3);
    expect(cartSlice.selectors.selectQuantity({ cart: state }, 'ghost')).toBe(0);
  });
});
