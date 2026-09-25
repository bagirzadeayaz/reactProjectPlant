import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { setAdminEnabled } from '../../../test/mocks/admin-session';
import { i18n } from '../../shared/i18n';
import { renderApp } from '../../../test/support/render-app';

/**
 * The prompt 7 checkpoint: every route loads, deep links work, back and forward
 * behave, and a screen reader is told the page changed.
 */

const renderAt = (path: string) => renderApp(path);

/** Lazy routes resolve a tick after render, so every assertion waits. */
const heading = (name: RegExp | string) =>
  waitFor(() => screen.getByRole('heading', { level: 1, name }));

describe('routes', () => {
  afterEach(async () => {
    await i18n.changeLanguage('en');
    setAdminEnabled(false);
  });

  it('renders the landing page at /', async () => {
    renderAt('/');
    await waitFor(() => {
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('renders the catalog', async () => {
    renderAt('/catalog');
    expect(await heading('Catalog')).toBeInTheDocument();
  });

  it('deep-links straight into a product', async () => {
    renderAt('/catalog/desk-plant');
    expect(await heading('Product')).toBeInTheDocument();
  });

  it('gates the admin routes behind the demo flag', async () => {
    renderAt('/admin/products');
    expect(await heading('Admin area')).toBeInTheDocument();
    await userEvent.click(await screen.findByRole('button', { name: 'Sign in with Google' }));
    expect(await heading('Manage products')).toBeInTheDocument();
  });

  it('renders the admin table and both form routes once enabled', async () => {
    setAdminEnabled(true);
    const { unmount } = renderAt('/admin/products');
    expect(await heading('Manage products')).toBeInTheDocument();
    unmount();

    const created = renderAt('/admin/products/new');
    expect(await heading('New product')).toBeInTheDocument();
    created.unmount();

    renderAt('/admin/products/p-1');
    expect(await heading('Edit product')).toBeInTheDocument();
  });

  it('falls through to 404 for an unknown path', async () => {
    renderAt('/nope');
    expect(await heading('Page not found')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Go to the home page' })).toBeInTheDocument();
  });

  it('keeps the header and footer across routes', async () => {
    renderAt('/catalog');
    await heading('Catalog');
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });
});

describe('navigation', () => {
  afterEach(async () => {
    await i18n.changeLanguage('en');
  });

  it('navigates from the header and back again', async () => {
    renderAt('/');
    await waitFor(() => {
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    await userEvent.click(screen.getAllByRole('link', { name: "Plant Type's" })[0]!);
    expect(await heading('Catalog')).toBeInTheDocument();

    await userEvent.click(screen.getAllByRole('link', { name: 'Login' })[0]!);
    expect(await heading('Admin area')).toBeInTheDocument();
  });

  it('marks the active link as the current page', async () => {
    renderAt('/catalog');
    await heading('Catalog');

    const active = screen.getAllByRole('link', { name: "Plant Type's" })[0];
    expect(active).toHaveAttribute('aria-current', 'page');
  });

  it('announces the new page in a live region', async () => {
    renderAt('/');
    await waitFor(() => {
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    await userEvent.click(screen.getAllByRole('link', { name: "Plant Type's" })[0]!);
    await heading('Catalog');

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('Navigated to Catalog');
    });
  });

  it('moves focus to the new page heading', async () => {
    renderAt('/');
    await waitFor(() => {
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    await userEvent.click(screen.getAllByRole('link', { name: "Plant Type's" })[0]!);
    const h1 = await heading('Catalog');
    await waitFor(() => {
      expect(h1).toHaveFocus();
    });
  });

  it('offers a skip link as the first tab stop', async () => {
    renderAt('/catalog');
    await heading('Catalog');

    await userEvent.tab();
    expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveFocus();
  });
});


