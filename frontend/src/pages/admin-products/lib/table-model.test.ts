import { describe, expect, it } from 'vitest';
import type { Product } from '../../../entities/product';
import { DEFAULT_SORT, filterProducts, nextSort, sortProducts } from './table-model';

const product = (over: Partial<Product>): Product => ({
  id: 'p',
  slug: 'p',
  name: { en: 'Plant', ru: 'Растение' },
  description: { en: '', ru: '' },
  price: 100,
  currency: 'INR',
  category: 'trendy',
  imageUrl: '/x.png',
  inStock: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  ...over,
});

const items = [
  product({ id: 'a', slug: 'aloe', name: { en: 'Aloe', ru: 'Алоэ' }, price: 300, inStock: false }),
  product({
    id: 'b',
    slug: 'basil',
    name: { en: 'Basil', ru: 'Базилик' },
    price: 100,
    createdAt: '2026-02-01T00:00:00.000Z',
  }),
  product({
    id: 'c',
    slug: 'cactus',
    name: { en: 'Cactus', ru: 'Кактус' },
    price: 200,
    category: 'best-o2',
  }),
];

describe('table model', () => {
  it('defaults to newest first', () => {
    expect(sortProducts(items, DEFAULT_SORT, 'en').map((i) => i.id)).toEqual(['b', 'a', 'c']);
  });

  it('sorts by price both ways', () => {
    expect(sortProducts(items, { key: 'price', direction: 'asc' }, 'en').map((i) => i.id)).toEqual([
      'b',
      'c',
      'a',
    ]);
    expect(sortProducts(items, { key: 'price', direction: 'desc' }, 'en').map((i) => i.id)).toEqual(
      ['a', 'c', 'b'],
    );
  });

  it('sorts names in the active language', () => {
    expect(sortProducts(items, { key: 'name', direction: 'asc' }, 'ru').map((i) => i.id)).toEqual([
      'a',
      'b',
      'c',
    ]);
  });

  it('sorts stock and category', () => {
    expect(sortProducts(items, { key: 'stock', direction: 'asc' }, 'en')[0]?.id).toBe('a');
    expect(sortProducts(items, { key: 'category', direction: 'asc' }, 'en')[0]?.id).toBe('c');
  });

  it('flips direction on the same key and resets on a new one', () => {
    expect(nextSort({ key: 'price', direction: 'asc' }, 'price')).toEqual({
      key: 'price',
      direction: 'desc',
    });
    expect(nextSort({ key: 'price', direction: 'desc' }, 'name')).toEqual({
      key: 'name',
      direction: 'asc',
    });
  });

  it('filters on either language or the slug', () => {
    expect(filterProducts(items, 'кАкт').map((i) => i.id)).toEqual(['c']);
    expect(filterProducts(items, 'bas').map((i) => i.id)).toEqual(['b']);
    expect(filterProducts(items, '  ')).toHaveLength(3);
  });
});
