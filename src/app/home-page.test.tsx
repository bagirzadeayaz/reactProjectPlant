import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { AppProviders } from './providers';
import { initI18n } from '../shared/i18n';
import { ToastProvider } from '../shared/ui';
import { HomePage } from '../pages/home';

const i18n = initI18n();

const renderHome = () =>
  render(
    <AppProviders>
      <MemoryRouter>
        <ToastProvider regionLabel="Notifications" dismissLabel="Dismiss">
          <HomePage />
        </ToastProvider>
      </MemoryRouter>
    </AppProviders>,
  );

/**
 * The prompt 8/9 checkpoint, minus the pixels: every section renders from live
 * data. Lives in `app` because it mounts the real providers, which `pages`
 * may not import.
 */
describe('HomePage', () => {
  afterEach(async () => {
    await i18n.changeLanguage('en');
  });

  it('renders the hero with the comp headline and an Explore link', () => {
    renderHome();
    expect(screen.getByRole('heading', { level: 1, name: 'Breath Natural' })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Explore' })[0]).toHaveAttribute('href', '/catalog');
  });

  it('renders all four section headings', async () => {
    renderHome();
    for (const name of ['Our Trendy plants', 'Our Top Selling', 'Customer Review', 'Our Best o2']) {
      expect(await screen.findByRole('heading', { level: 2, name })).toBeInTheDocument();
    }
  });

  it('fills the grid with the six seeded products', async () => {
    renderHome();
    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: 'Add to cart' }).length).toBeGreaterThanOrEqual(
        6,
      );
    });
    expect(screen.getAllByText('Calathea plant').length).toBeGreaterThan(0);
  });

  it('renders the three reviews in a named region', async () => {
    renderHome();
    const region = await screen.findByRole('region', { name: 'Customer reviews' });
    expect(await within(region).findByText('Maln Josi')).toBeInTheDocument();
    expect(within(region).getByText('Alina Thakur')).toBeInTheDocument();
    expect(within(region).getByText('Max Makvana')).toBeInTheDocument();
  });

  it('pages through the Best O₂ plants', async () => {
    renderHome();
    const region = await screen.findByRole('region', { name: 'Best O₂ plants' });
    expect(await within(region).findByText('01 of 02')).toBeInTheDocument();

    await userEvent.click(within(region).getByRole('button', { name: 'Next plant' }));
    expect(within(region).getByText('02 of 02')).toBeInTheDocument();
    expect(within(region).getByRole('button', { name: 'Next plant' })).toBeDisabled();

    await userEvent.click(within(region).getByRole('button', { name: 'Previous plant' }));
    expect(within(region).getByText('01 of 02')).toBeInTheDocument();
  });

  it('adds to the cart and confirms with a toast', async () => {
    renderHome();
    const [button] = await screen.findAllByRole('button', { name: 'Add to cart' });
    await userEvent.click(button!);
    expect(await screen.findByRole('status')).toHaveTextContent(/Added .* to your cart/);
  });

  it('switches every section to Russian without refetching', async () => {
    renderHome();
    await screen.findByRole('heading', { level: 2, name: 'Our Top Selling' });

    await i18n.changeLanguage('ru');
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Дышите свободно' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Хиты продаж' })).toBeInTheDocument();
    expect(screen.getAllByText('Калатея').length).toBeGreaterThan(0);
  });

  it('reserves dimensions and offers AVIF and WebP sources on the featured image', async () => {
    renderHome();
    const image = await screen.findByRole('img', { name: 'Calathea plant' });
    expect(image).toHaveAttribute('width');
    expect(image).toHaveAttribute('height');
    const picture = image.closest('picture');
    expect(picture).not.toBeNull();
    const types = [...(picture?.querySelectorAll('source') ?? [])].map((s) => s.getAttribute('type'));
    expect(types).toEqual(['image/avif', 'image/webp']);
  });
});
