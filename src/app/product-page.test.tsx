import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { CART_STORAGE_KEY } from '../entities/cart';
import { i18n } from '../shared/i18n';
import { renderApp } from './testing/render-app';

const renderAt = (path: string) => renderApp(path);

/** The prompt 10 checkpoint, parts 2 and 3: the dynamic route and the cart. */
describe('ProductPage', () => {
  afterEach(async () => {
    await i18n.changeLanguage('en');
    globalThis.localStorage.removeItem(CART_STORAGE_KEY);
  });

  it('renders a product from its slug', async () => {
    renderAt('/catalog/desk-plant');
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Desk plant' }),
    ).toBeInTheDocument();
    expect(screen.getByText('In stock')).toBeInTheDocument();
    expect(screen.getByText(/359/)).toBeInTheDocument();
  });

  it('renders a real 404 for an unknown slug', async () => {
    renderAt('/catalog/no-such-plant');
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Page not found' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Go to the home page' })).toBeInTheDocument();
  });

  it('sets the document title to the product name', async () => {
    renderAt('/catalog/desk-plant');
    await screen.findByRole('heading', { level: 1, name: 'Desk plant' });
    await waitFor(() => {
      expect(document.title).toBe('Desk plant · Planto.');
    });
  });

  it('shows related products from the same category', async () => {
    renderAt('/catalog/desk-plant');
    await screen.findByRole('heading', { level: 1, name: 'Desk plant' });
    const related = await screen.findByRole('heading', { level: 2, name: 'You might also like' });
    expect(related).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Show plant' })).toBeInTheDocument();
  });

  it('disables buying when out of stock', async () => {
    renderAt('/catalog/show-plant');
    await screen.findByRole('heading', { level: 1, name: 'Show plant' });
    expect(screen.getByText('Out of stock')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Buy Now' })[0]).toBeDisabled();
  });

  it('adds the chosen quantity to the cart and the header badge updates', async () => {
    renderAt('/catalog/desk-plant');
    await screen.findByRole('heading', { level: 1, name: 'Desk plant' });

    await userEvent.click(screen.getByRole('button', { name: 'Increase quantity' }));
    await userEvent.click(screen.getAllByRole('button', { name: 'Buy Now' })[0]!);

    expect(screen.getByRole('button', { name: 'Cart, 2 items' })).toBeInTheDocument();
  });
});

describe('cart persistence', () => {
  afterEach(() => {
    globalThis.localStorage.removeItem(CART_STORAGE_KEY);
  });

  it('survives a reload', async () => {
    const first = renderAt('/catalog/desk-plant');
    await screen.findByRole('heading', { level: 1, name: 'Desk plant' });
    await userEvent.click(screen.getAllByRole('button', { name: 'Buy Now' })[0]!);
    expect(screen.getByRole('button', { name: 'Cart, 1 item' })).toBeInTheDocument();

    // A fresh mount with a fresh store is the closest thing to a reload.
    first.unmount();
    renderAt('/');
    await screen.findByRole('banner');
    expect(screen.getByRole('button', { name: 'Cart, 1 item' })).toBeInTheDocument();
  });

  it('opens the drawer, shows the line, and clears', async () => {
    renderAt('/catalog/desk-plant');
    await screen.findByRole('heading', { level: 1, name: 'Desk plant' });
    await userEvent.click(screen.getAllByRole('button', { name: 'Buy Now' })[0]!);

    await userEvent.click(screen.getByRole('button', { name: 'Cart, 1 item' }));
    const dialog = await screen.findByRole('dialog', { name: /Your cart/ });
    expect(dialog).toBeInTheDocument();
    expect(await within(dialog).findByRole('link', { name: 'Desk plant' })).toBeInTheDocument();

    // The page's own quantity stepper is still mounted behind the drawer, so
    // scope to the dialog to reach the line's stepper.
    await userEvent.click(within(dialog).getByRole('button', { name: 'Increase quantity' }));
    expect(screen.getByRole('button', { name: 'Cart, 2 items' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Clear cart' }));
    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
