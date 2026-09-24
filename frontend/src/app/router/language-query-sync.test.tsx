import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { LanguageSwitcher } from '../../features/language-switcher';
import { initI18n } from '../../shared/i18n';
import { AppProviders } from '../providers';
import { LanguageQuerySync } from './language-query-sync';

// AppProviders initialises i18next on render, but the hooks below touch it
// before the first render, so initialise it here too. `initI18n` is idempotent.
const i18n = initI18n();

/** Reports the live URL so the assertions can read it. */
const UrlProbe = () => {
  const location = useLocation();
  const { slug } = useParams();
  return (
    <>
      <p data-testid="path">{location.pathname}</p>
      <p data-testid="search">{location.search}</p>
      <p data-testid="slug">{slug}</p>
    </>
  );
};

const renderAt = (entry: string) =>
  render(
    <AppProviders>
      <MemoryRouter initialEntries={[entry]}>
        <LanguageQuerySync />
        <Routes>
          <Route
            path="/catalog/:slug"
            element={
              <>
                <UrlProbe />
                <LanguageSwitcher />
              </>
            }
          />
        </Routes>
      </MemoryRouter>
    </AppProviders>,
  );

describe('language in the URL', () => {
  // `changeLanguage` is async, so a pending switch from the previous test can
  // land after its cleanup. Resetting at the start of each test — not only at
  // the end of the last — makes the starting language deterministic.
  beforeEach(async () => {
    await i18n.changeLanguage('en');
  });

  afterEach(async () => {
    await i18n.changeLanguage('en');
  });

  it('adopts the language from ?lang= on arrival', async () => {
    renderAt('/catalog/desk-plant?lang=ru');
    await waitFor(() => {
      expect(i18n.language).toBe('ru');
    });
  });

  it('leaves a URL without ?lang alone', async () => {
    renderAt('/catalog/desk-plant');
    await waitFor(() => {
      expect(screen.getByTestId('path')).toHaveTextContent('/catalog/desk-plant');
    });
    // An ordinary link keeps its shape; the reader's own preference decides.
    expect(screen.getByTestId('search')).toHaveTextContent('');
    expect(i18n.language).toBe('en');
  });

  it('keeps the path, the route param and other query values when switching', async () => {
    renderAt('/catalog/desk-plant?sort=price-asc');
    await waitFor(() => {
      expect(screen.getByTestId('slug')).toHaveTextContent('desk-plant');
    });

    await userEvent.click(screen.getByRole('button', { name: 'Russian' }));

    await waitFor(() => {
      expect(screen.getByTestId('search')).toHaveTextContent('lang=ru');
    });
    expect(screen.getByTestId('path')).toHaveTextContent('/catalog/desk-plant');
    expect(screen.getByTestId('slug')).toHaveTextContent('desk-plant');
    expect(screen.getByTestId('search')).toHaveTextContent('sort=price-asc');
  });

  it('normalises a regional tag to the base language', async () => {
    renderAt('/catalog/desk-plant?lang=ru-RU');
    await waitFor(() => {
      expect(i18n.language).toBe('ru');
    });
  });

  it('falls back to English for an unsupported language', async () => {
    renderAt('/catalog/desk-plant?lang=de');
    await waitFor(() => {
      expect(screen.getByTestId('slug')).toHaveTextContent('desk-plant');
    });
    expect(i18n.language).toBe('en');
  });

  it('follows the URL back to the previous language', async () => {
    renderAt('/catalog/desk-plant?lang=ru');
    await waitFor(() => {
      expect(i18n.language).toBe('ru');
    });

    await userEvent.click(screen.getByRole('button', { name: 'Английский' }));
    await waitFor(() => {
      expect(screen.getByTestId('search')).toHaveTextContent('lang=en');
    });
    expect(screen.getByTestId('path')).toHaveTextContent('/catalog/desk-plant');
  });
});
