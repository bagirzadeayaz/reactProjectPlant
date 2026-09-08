import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { configureStore } from '@reduxjs/toolkit';
import { I18nextProvider } from 'react-i18next';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { cartSlice } from '../../../entities/cart';
import { baseApi } from '../../../shared/api';
import { initI18n } from '../../../shared/i18n';
import { Header } from './header';

const i18n = initI18n();

// The header owns the cart badge and drawer, so it needs the cart slice and
// the API (for the drawer's product join). A widget test may not import
// `app/store`, hence this local store.
const makeTestStore = () =>
  configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
      [cartSlice.reducerPath]: cartSlice.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
  });

const renderHeader = (path = '/') =>
  render(
    <Provider store={makeTestStore()}>
      <I18nextProvider i18n={i18n}>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route path="*" element={<Header />} />
          </Routes>
        </MemoryRouter>
      </I18nextProvider>
    </Provider>,
  );

describe('Header', () => {
  afterEach(async () => {
    await i18n.changeLanguage('en');
  });

  it('is a banner landmark with a labelled nav', () => {
    renderHeader();
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getAllByRole('navigation', { name: 'Main navigation' }).length).toBeGreaterThan(
      0,
    );
  });

  it('marks the current route as the current page', () => {
    renderHeader('/catalog');
    const [link] = screen.getAllByRole('link', { name: 'Catalog' });
    expect(link).toHaveAttribute('aria-current', 'page');
  });

  it('gives the icon buttons accessible names', () => {
    renderHeader();
    expect(screen.getByRole('img', { name: 'Search' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cart, 0 items' })).toBeInTheDocument();
  });

  it('starts with the mobile menu collapsed', () => {
    renderHeader();
    expect(screen.getByRole('button', { name: 'Open menu' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('expands and collapses the mobile menu', async () => {
    renderHeader();
    const toggle = screen.getByRole('button', { name: 'Open menu' });

    await userEvent.click(toggle);
    expect(screen.getByRole('button', { name: 'Close menu' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );

    await userEvent.click(screen.getByRole('button', { name: 'Close menu' }));
    expect(screen.getByRole('button', { name: 'Open menu' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('points the toggle at the panel it controls', async () => {
    renderHeader();
    const toggle = screen.getByRole('button', { name: 'Open menu' });
    const controls = toggle.getAttribute('aria-controls') ?? '';

    expect(document.getElementById(controls)).not.toBeNull();
    expect(document.getElementById(controls)).toHaveAttribute('hidden');

    await userEvent.click(toggle);
    expect(document.getElementById(controls)).not.toHaveAttribute('hidden');
  });

  it('closes on Escape and returns focus to the toggle', async () => {
    renderHeader();
    const toggle = screen.getByRole('button', { name: 'Open menu' });
    await userEvent.click(toggle);

    await userEvent.keyboard('{Escape}');
    const reopened = screen.getByRole('button', { name: 'Open menu' });
    expect(reopened).toHaveAttribute('aria-expanded', 'false');
    expect(reopened).toHaveFocus();
  });

  it('translates its links', async () => {
    renderHeader();
    expect(screen.getAllByRole('link', { name: 'Catalog' }).length).toBeGreaterThan(0);

    await i18n.changeLanguage('ru');
    expect(screen.getAllByRole('link', { name: 'Каталог' }).length).toBeGreaterThan(0);
  });
});
