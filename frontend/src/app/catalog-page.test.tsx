import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { CatalogPage } from '../pages/catalog';
import { initI18n } from '../shared/i18n';
import { ToastProvider } from '../shared/ui';
import { AppProviders } from './providers';

const i18n = initI18n();

const UrlProbe = () => <p data-testid="url">{useLocation().search}</p>;

const renderCatalog = (entry = '/catalog') =>
  render(
    <AppProviders>
      <MemoryRouter initialEntries={[entry]}>
        <ToastProvider regionLabel="Notifications" dismissLabel="Dismiss">
          <Routes>
            <Route
              path="/catalog"
              element={
                <>
                  <CatalogPage />
                  <UrlProbe />
                </>
              }
            />
          </Routes>
        </ToastProvider>
      </MemoryRouter>
    </AppProviders>,
  );

/** The prompt 10 checkpoint, part 1: filters live in the URL. */
describe('CatalogPage', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
  });
  afterEach(async () => {
    await i18n.changeLanguage('en');
  });

  it('lists the seeded products', async () => {
    renderCatalog();
    expect(await screen.findByText('6 plants')).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(6);
  });

  it('writes a category choice to the URL and narrows the list', async () => {
    renderCatalog();
    await screen.findByText('6 plants');

    await userEvent.selectOptions(screen.getByLabelText('Category'), 'top-selling');

    await waitFor(() => {
      expect(screen.getByTestId('url')).toHaveTextContent('category=top-selling');
    });
    expect(await screen.findByText('2 plants')).toBeInTheDocument();
  });

  it('rebuilds the filters from a deep link', async () => {
    renderCatalog('/catalog?category=best-o2&sort=price-desc');
    expect(await screen.findByText('2 plants')).toBeInTheDocument();
    expect(screen.getByLabelText('Category')).toHaveValue('best-o2');
    expect(screen.getByLabelText('Sort by')).toHaveValue('price-desc');
  });

  it('debounces the search box into the URL', async () => {
    renderCatalog();
    await screen.findByText('6 plants');

    await userEvent.type(screen.getByLabelText('Search plants'), 'desk');
    // Not yet — the debounce has not elapsed.
    expect(screen.getByTestId('url')).not.toHaveTextContent('search=');

    await waitFor(() => {
      expect(screen.getByTestId('url')).toHaveTextContent('search=desk');
    });
    expect(await screen.findByText('1 plant')).toBeInTheDocument();
  });

  it('shows the empty state and clears back to /catalog', async () => {
    renderCatalog('/catalog?search=zzzz');
    expect(await screen.findByText('No plants match those filters')).toBeInTheDocument();

    // Both the filter form and the empty state offer "Clear filters"; the
    // empty state's is the one a stuck user actually sees.
    const [, emptyStateClear] = screen.getAllByRole('button', { name: 'Clear filters' });
    expect(emptyStateClear).toBeDefined();
    await userEvent.click(emptyStateClear ?? document.body);
    await waitFor(() => {
      expect(screen.getByTestId('url')).toHaveTextContent('');
    });
    expect(await screen.findByText('6 plants')).toBeInTheDocument();
  });

  it('filters by price range and stock', async () => {
    renderCatalog('/catalog?minPrice=350&maxPrice=700&inStock=true');
    // 359, 399, 659 are in range; 759 (show plant) is out of stock anyway.
    expect(await screen.findByText('3 plants')).toBeInTheDocument();
  });

  it('sets the document title', async () => {
    renderCatalog();
    await screen.findByText('6 plants');
    await waitFor(() => {
      expect(document.title).toBe('Catalog · Planto.');
    });
  });
});
