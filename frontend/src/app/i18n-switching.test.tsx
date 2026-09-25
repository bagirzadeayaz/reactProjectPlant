import { useEffect } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useTranslation } from 'react-i18next';
import { MemoryRouter, Route, Routes, useParams } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { LanguageSwitcher } from '../features/language-switcher';
import { useFormatters, useLocale, i18n } from '../shared/i18n';
import { AppProviders } from './providers';

/**
 * The prompt 6 checkpoint: switching language updates every string, `<html lang>`
 * and the number formatting, without remounting the tree or losing route state.
 */

let mountCount = 0;

/** A stand-in for a real page: reads copy, a localized field, and a price. */
const Screen = () => {
  const { t } = useTranslation(['catalog', 'common']);
  const { locale, localized } = useLocale();
  const format = useFormatters(locale);
  const { slug } = useParams();

  // Counts mounts, not renders. A language change must re-render, never remount:
  // a remount would clear component state and flash the page. The counter lives
  // outside the component so a remount cannot reset the evidence.
  useEffect(() => {
    mountCount += 1;
  }, []);

  return (
    <>
      <h1>{t('catalog:title')}</h1>
      <p data-testid="nav-home">{t('common:nav.home')}</p>
      <p data-testid="product-name">{localized({ en: 'Calathea plant', ru: 'Калатея' })}</p>
      <p data-testid="price">{format.currency(1299, 'AZN')}</p>
      <p data-testid="count">{t('catalog:results', { count: 2 })}</p>
      <p data-testid="slug">{slug}</p>
      <LanguageSwitcher />
    </>
  );
};

const renderApp = () => {
  mountCount = 0;
  return render(
    <AppProviders>
      <MemoryRouter initialEntries={['/catalog/calathea-plant']}>
        <Routes>
          <Route path="/catalog/:slug" element={<Screen />} />
        </Routes>
      </MemoryRouter>
    </AppProviders>,
  );
};

describe('language switching', () => {
  afterEach(async () => {
    await i18n.changeLanguage('en');
  });

  it('starts in English', () => {
    renderApp();
    expect(screen.getByRole('heading', { name: 'Catalog' })).toBeInTheDocument();
    expect(screen.getByTestId('nav-home')).toHaveTextContent('Home');
  });

  it('translates every string on the screen at once', async () => {
    renderApp();
    await userEvent.click(screen.getByRole('button', { name: 'Russian' }));

    expect(screen.getByRole('heading', { name: 'Каталог' })).toBeInTheDocument();
    expect(screen.getByTestId('nav-home')).toHaveTextContent('Главная');
  });

  it('re-reads localized entity fields without refetching', async () => {
    renderApp();
    expect(screen.getByTestId('product-name')).toHaveTextContent('Calathea plant');

    await userEvent.click(screen.getByRole('button', { name: 'Russian' }));
    expect(screen.getByTestId('product-name')).toHaveTextContent('Калатея');
  });

  it('reformats currency for the new locale', async () => {
    renderApp();
    const before = screen.getByTestId('price').textContent;

    await userEvent.click(screen.getByRole('button', { name: 'Russian' }));
    expect(screen.getByTestId('price').textContent).not.toBe(before);
  });

  it('applies the target language plural rules', async () => {
    renderApp();
    expect(screen.getByTestId('count')).toHaveTextContent('2 plants');

    await userEvent.click(screen.getByRole('button', { name: 'Russian' }));
    // Russian "few" for 2, not the "many" form used for 5.
    expect(screen.getByTestId('count')).toHaveTextContent('2 растения');
  });

  it('sets <html lang>', async () => {
    renderApp();
    await userEvent.click(screen.getByRole('button', { name: 'Russian' }));
    expect(document.documentElement.lang).toBe('ru');
  });

  it('does not remount the tree — no flash', async () => {
    renderApp();
    expect(mountCount).toBe(1);

    await userEvent.click(screen.getByRole('button', { name: 'Russian' }));
    await userEvent.click(screen.getByRole('button', { name: 'Английский' }));

    // Still one: the tree re-rendered in the new language rather than being
    // torn down and rebuilt.
    expect(mountCount).toBe(1);
  });

  it('keeps the route and its params', async () => {
    renderApp();
    expect(screen.getByTestId('slug')).toHaveTextContent('calathea-plant');

    await userEvent.click(screen.getByRole('button', { name: 'Russian' }));
    expect(screen.getByTestId('slug')).toHaveTextContent('calathea-plant');
  });
});
