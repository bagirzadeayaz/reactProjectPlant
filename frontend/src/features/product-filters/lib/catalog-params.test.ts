import { describe, expect, it } from 'vitest';
import { readCatalogParams, writeCatalogParams } from './catalog-params';

describe('catalog params ⇄ URL', () => {
  it('reads defaults from an empty query', () => {
    expect(readCatalogParams(new URLSearchParams())).toStrictEqual({
      search: '',
      category: null,
      minPrice: null,
      maxPrice: null,
      inStock: false,
      sort: 'newest',
      page: 1,
    });
  });

  it('reads every filter back', () => {
    const params = readCatalogParams(
      new URLSearchParams(
        'search=desk&category=trendy&minPrice=100&maxPrice=500&inStock=true&sort=price-asc&page=3',
      ),
    );
    expect(params).toStrictEqual({
      search: 'desk',
      category: 'trendy',
      minPrice: 100,
      maxPrice: 500,
      inStock: true,
      sort: 'price-asc',
      page: 3,
    });
  });

  it('ignores nonsense rather than throwing', () => {
    const params = readCatalogParams(new URLSearchParams('minPrice=abc&sort=vibes&page=-4'));
    expect(params.minPrice).toBeNull();
    expect(params.sort).toBe('newest');
    expect(params.page).toBe(1);
  });

  it('omits defaults when writing, so /catalog stays /catalog', () => {
    const out = writeCatalogParams(new URLSearchParams(), { sort: 'newest', page: 1, search: '' });
    expect(out.toString()).toBe('');
  });

  it('writes only what differs from the defaults', () => {
    const out = writeCatalogParams(new URLSearchParams(), { category: 'best-o2', page: 2 });
    expect(out.toString()).toBe('category=best-o2&page=2');
  });

  it('preserves unrelated params such as lang', () => {
    const out = writeCatalogParams(new URLSearchParams('lang=ru'), { search: 'cal' });
    expect(out.get('lang')).toBe('ru');
    expect(out.get('search')).toBe('cal');
  });

  it('round-trips', () => {
    const original = new URLSearchParams(
      'search=x&category=trendy&maxPrice=700&sort=name-asc&page=2',
    );
    const params = readCatalogParams(original);
    expect(readCatalogParams(writeCatalogParams(new URLSearchParams(), params))).toStrictEqual(
      params,
    );
  });
});
