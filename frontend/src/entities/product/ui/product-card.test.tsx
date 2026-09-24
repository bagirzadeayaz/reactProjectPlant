import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { SEED_PRODUCTS } from '../../../../test/mocks/seed';
import { initI18n } from '../../../shared/i18n';
import { productImageSources } from '../lib/product-image';
import { ProductCard } from './product-card';

const i18n = initI18n();
const product = SEED_PRODUCTS[0]!;

const renderCard = (element: React.ReactElement) =>
  render(
    <I18nextProvider i18n={i18n}>
      <MemoryRouter>{element}</MemoryRouter>
    </I18nextProvider>,
  );

describe('ProductCard', () => {
  it('is an article with the name as a heading linking to the product', () => {
    renderCard(<ProductCard product={product} />);
    expect(screen.getByRole('article')).toBeInTheDocument();
    const link = screen.getByRole('link', { name: 'Calathea plant' });
    expect(link).toHaveAttribute('href', '/catalog/calathea-plant');
  });

  it('formats the price through Intl', () => {
    renderCard(<ProductCard product={product} />);
    expect(screen.getByText(/309/)).toBeInTheDocument();
  });

  it('renders the action slot', () => {
    renderCard(<ProductCard product={product} action={<button type="button">Buy</button>} />);
    expect(screen.getByRole('button', { name: 'Buy' })).toBeInTheDocument();
  });

  it('flags an out-of-stock product', () => {
    renderCard(<ProductCard product={{ ...product, inStock: false }} />);
    expect(screen.getByText('Out of stock')).toBeInTheDocument();
  });
});

describe('productImageSources', () => {
  it('derives the AVIF and WebP variants from a seeded PNG path', () => {
    expect(productImageSources({ imageUrl: '/plants/desk-plant.png' })).toStrictEqual([
      { src: '/plants/desk-plant-400.avif', width: 400, type: 'image/avif' },
      { src: '/plants/desk-plant-800.avif', width: 800, type: 'image/avif' },
      { src: '/plants/desk-plant-1200.avif', width: 1200, type: 'image/avif' },
      { src: '/plants/desk-plant-400.webp', width: 400, type: 'image/webp' },
      { src: '/plants/desk-plant-800.webp', width: 800, type: 'image/webp' },
      { src: '/plants/desk-plant-1200.webp', width: 1200, type: 'image/webp' },
    ]);
  });

  it('returns nothing for an arbitrary URL', () => {
    expect(productImageSources({ imageUrl: 'https://example.com/x.jpg' })).toStrictEqual([]);
  });
});
