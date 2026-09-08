import { describe, expect, it } from 'vitest';
import { categoryApi } from '../../entities/category';
import { productApi } from '../../entities/product';
import { reviewApi } from '../../entities/review';
import { makeStore } from './store';

/** The list endpoint's search, filter, sort and pagination, through real HTTP. */
describe('product list query', () => {
  it('filters by category', async () => {
    const store = makeStore();
    const page = await store
      .dispatch(productApi.endpoints.getProducts.initiate({ category: 'top-selling' }))
      .unwrap();

    expect(page.total).toBe(2);
    expect(page.items.every((product) => product.category === 'top-selling')).toBe(true);
  });

  it('searches English names', async () => {
    const store = makeStore();
    const page = await store
      .dispatch(productApi.endpoints.getProducts.initiate({ search: 'desk' }))
      .unwrap();

    expect(page.items.map((product) => product.slug)).toStrictEqual(['desk-plant']);
  });

  it('searches Russian names too, so a Russian query finds a product', async () => {
    const store = makeStore();
    const page = await store
      .dispatch(productApi.endpoints.getProducts.initiate({ search: 'Калатея' }))
      .unwrap();

    expect(page.items.length).toBeGreaterThan(0);
    expect(page.items.map((product) => product.slug)).toContain('calathea-plant');
  });

  it('sorts by price ascending and descending', async () => {
    const store = makeStore();

    const cheapFirst = await store
      .dispatch(productApi.endpoints.getProducts.initiate({ sort: 'price-asc', perPage: 50 }))
      .unwrap();
    const prices = cheapFirst.items.map((product) => product.price);
    expect(prices).toStrictEqual([...prices].sort((a, b) => a - b));

    const dearFirst = await store
      .dispatch(productApi.endpoints.getProducts.initiate({ sort: 'price-desc', perPage: 50 }))
      .unwrap();
    expect(dearFirst.items[0]?.price).toBe(759);
  });

  it('paginates, reporting the unpaginated total', async () => {
    const store = makeStore();
    const first = await store
      .dispatch(productApi.endpoints.getProducts.initiate({ page: 1, perPage: 2 }))
      .unwrap();
    const second = await store
      .dispatch(productApi.endpoints.getProducts.initiate({ page: 2, perPage: 2 }))
      .unwrap();

    expect(first.items).toHaveLength(2);
    expect(first.total).toBe(6);
    expect(second.items.map((p) => p.id)).not.toStrictEqual(first.items.map((p) => p.id));
  });

  it('returns an empty page past the end rather than an error', async () => {
    const store = makeStore();
    const page = await store
      .dispatch(productApi.endpoints.getProducts.initiate({ page: 99 }))
      .unwrap();

    expect(page.items).toStrictEqual([]);
    expect(page.total).toBe(6);
  });

  it('falls back to the default sort when given a nonsense value', async () => {
    const store = makeStore();
    const page = await store
      .dispatch(productApi.endpoints.getProducts.initiate({ sort: 'by-vibes', perPage: 50 }))
      .unwrap();

    expect(page.items).toHaveLength(6);
  });
});

describe('reviews and categories', () => {
  it('lists every review', async () => {
    const store = makeStore();
    const reviews = await store
      .dispatch(reviewApi.endpoints.getReviews.initiate(undefined))
      .unwrap();
    expect(reviews).toHaveLength(3);
  });

  it('filters reviews by product', async () => {
    const store = makeStore();
    const reviews = await store
      .dispatch(reviewApi.endpoints.getReviews.initiate({ productId: 'p-1' }))
      .unwrap();

    expect(reviews).toHaveLength(1);
    expect(reviews[0]?.author).toBe('Maln Josi');
  });

  it('lists the categories from the comp sections', async () => {
    const store = makeStore();
    const categories = await store
      .dispatch(categoryApi.endpoints.getCategories.initiate(undefined))
      .unwrap();

    expect(categories.map((category) => category.slug)).toStrictEqual([
      'trendy',
      'top-selling',
      'best-o2',
    ]);
    expect(categories[0]?.label.ru).toBe('Модные растения');
  });
});
