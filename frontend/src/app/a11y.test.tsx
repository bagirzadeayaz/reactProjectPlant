import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { setAdminEnabled } from '../../test/mocks/admin-session';
import { audit } from '../../test/support/axe';
import { renderApp } from '../../test/support/render-app';

/**
 * axe on every route, after the page has actually rendered (lazy chunk
 * resolved, data arrived). Color contrast is checked in Chromium instead —
 * jsdom has no layout, so axe cannot see what sits over what.
 */
const settle = async (heading: string | RegExp): Promise<void> => {
  await screen.findByRole('heading', { level: 1, name: heading }, { timeout: 4000 });
  // Let images and the second data query land before asserting.
  await act(() => new Promise((resolve) => setTimeout(resolve, 50)));
};

const routes: [path: string, heading: string | RegExp][] = [
  ['/', /Breath Natural/],
  ['/catalog', 'Catalog'],
  ['/catalog?search=zzzz', 'Catalog'],
  ['/catalog/desk-plant', 'Desk plant'],
  ['/catalog/no-such-plant', 'Page not found'],
  ['/nope', 'Page not found'],
  ['/admin/products', 'Manage products'],
  ['/admin/products/new', 'New product'],
  ['/admin/products/p-1', 'Edit product'],
];

describe('accessibility', () => {
  beforeEach(() => {
    setAdminEnabled(true);
  });
  afterEach(() => {
    setAdminEnabled(false);
  });

  for (const [path, heading] of routes) {
    it(`has no axe violations at ${path}`, async () => {
      const { container } = renderApp(path);
      await settle(heading);
      expect(await audit(container)).toEqual([]);
    });
  }

  it('has no axe violations on the admin gate', async () => {
    setAdminEnabled(false);
    const { container } = renderApp('/admin/products');
    await settle('Admin area');
    expect(await audit(container)).toEqual([]);
  });

  it('has no axe violations with the cart drawer and mobile menu open', async () => {
    const { container } = renderApp('/catalog/desk-plant');
    await settle('Desk plant');
    await userEvent.click(screen.getAllByRole('button', { name: 'Buy Now' })[0]!);
    await userEvent.click(screen.getByRole('button', { name: 'Cart, 1 item' }));
    await screen.findByRole('dialog');
    expect(await audit(document.body)).toEqual([]);
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    await userEvent.click(screen.getByRole('button', { name: 'Open menu' }));
    expect(await audit(container)).toEqual([]);
  });

  it('has no axe violations with a delete dialog open', async () => {
    renderApp('/admin/products');
    await settle('Manage products');
    await screen.findByRole('table');
    await userEvent.click(screen.getByRole('button', { name: 'Delete Desk plant' }));
    await screen.findByRole('dialog');
    expect(await audit(document.body)).toEqual([]);
  });

  it('has exactly one h1 and no heading level skips on the landing page', async () => {
    renderApp('/');
    await settle(/Breath Natural/);
    const levels = screen.getAllByRole('heading').map((h) => Number(h.tagName.slice(1)));
    expect(levels.filter((level) => level === 1)).toHaveLength(1);
    for (let index = 1; index < levels.length; index += 1) {
      expect(levels[index]! - levels[index - 1]!).toBeLessThanOrEqual(1);
    }
  });
});


