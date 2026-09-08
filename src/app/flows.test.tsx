import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { CART_STORAGE_KEY } from '../entities/cart';
import { setAdminEnabled } from '../features/admin-access';
import { i18n } from '../shared/i18n';
import { renderApp } from './testing/render-app';

/**
 * The three user journeys from prompt 13, end to end through the real app on
 * a memory router and the MSW backend. The Playwright suite in `e2e/` walks
 * the same three in a browser.
 */
const heading = (name: string | RegExp) =>
  screen.findByRole('heading', { level: 1, name }, { timeout: 4000 });

describe('flows', () => {
  beforeEach(() => {
    setAdminEnabled(true);
  });
  afterEach(async () => {
    setAdminEnabled(false);
    globalThis.localStorage.removeItem(CART_STORAGE_KEY);
    await i18n.changeLanguage('en');
  });

  it('browse → filter → open product → add to cart', async () => {
    const { router } = renderApp('/');
    await heading(/Breath Natural/);

    await userEvent.click(screen.getAllByRole('link', { name: 'Catalog' })[0]!);
    await heading('Catalog');
    expect(await screen.findByText('6 plants')).toBeInTheDocument();

    await userEvent.selectOptions(screen.getByLabelText('Category'), 'top-selling');
    expect(await screen.findByText('2 plants')).toBeInTheDocument();
    expect(router.state.location.search).toBe('?category=top-selling');

    await userEvent.click(screen.getByRole('link', { name: 'Desk plant' }));
    await heading('Desk plant');
    expect(router.state.location.pathname).toBe('/catalog/desk-plant');

    await userEvent.click(screen.getByRole('button', { name: 'Increase quantity' }));
    await userEvent.click(screen.getAllByRole('button', { name: 'Buy Now' })[0]!);
    expect(screen.getByRole('button', { name: 'Cart, 2 items' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Cart, 2 items' }));
    const dialog = await screen.findByRole('dialog', { name: /Your cart/ });
    expect(await within(dialog).findByRole('link', { name: 'Desk plant' })).toBeInTheDocument();
    // Line total and subtotal both read ₹718 for a single line.
    expect(within(dialog).getAllByText(/718/)).toHaveLength(2);
  });

  it('admin create → verify on catalog', async () => {
    const { router } = renderApp('/admin/products/new');
    await heading('New product');

    const nameGroup = screen.getByRole('group', { name: 'Name' });
    await userEvent.type(within(nameGroup).getByLabelText('English'), 'Flow fern');
    await userEvent.type(within(nameGroup).getByLabelText('Russian'), 'Папоротник');
    const descriptionGroup = screen.getByRole('group', { name: 'Description' });
    await userEvent.type(within(descriptionGroup).getByLabelText('English'), 'From the flow test');
    await userEvent.type(within(descriptionGroup).getByLabelText('Russian'), 'Из теста');
    await userEvent.clear(screen.getByLabelText('Price'));
    await userEvent.type(screen.getByLabelText('Price'), '111');
    await userEvent.selectOptions(screen.getByLabelText('Category'), 'best-o2');
    await userEvent.type(screen.getByLabelText('Image URL'), '/plants/desk-plant.png');
    await userEvent.click(screen.getByRole('button', { name: 'Create product' }));

    await heading('Manage products');
    await act(() => router.navigate('/catalog?category=best-o2'));
    await heading('Catalog');
    expect(await screen.findByRole('heading', { level: 2, name: 'Flow fern' })).toBeInTheDocument();
    expect(screen.getByText('3 plants')).toBeInTheDocument();
  });

  it('language switch preserves the route, the filters and the cart', async () => {
    const { router } = renderApp('/catalog/desk-plant');
    await heading('Desk plant');
    await userEvent.click(screen.getAllByRole('button', { name: 'Buy Now' })[0]!);

    await act(() => router.navigate('/catalog?category=top-selling'));
    await heading('Catalog');
    expect(await screen.findByText('2 plants')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Russian' }));
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Каталог' })).toBeInTheDocument();
    });
    expect(router.state.location.pathname).toBe('/catalog');
    expect(router.state.location.search).toContain('category=top-selling');
    expect(router.state.location.search).toContain('lang=ru');
    expect(screen.getByText('2 растения')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Корзина, 1 товар' })).toBeInTheDocument();
    expect(document.documentElement.lang).toBe('ru');
  });
});
