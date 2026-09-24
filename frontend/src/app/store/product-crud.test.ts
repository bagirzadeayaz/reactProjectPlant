import { describe, expect, it } from 'vitest';
import { productApi, type ProductDraft } from '../../entities/product';
import { SEED_PRODUCTS } from '../../../test/mocks/seed';
import { makeStore, type AppStore } from './store';

/**
 * Integration tests for the data layer: a real store, real RTK Query, real
 * fetch, answered by MSW. Nothing is stubbed between the hook and the handler,
 * so a broken tag or a wrong URL fails here rather than in the UI.
 */

const draft = (overrides: Partial<ProductDraft> = {}): ProductDraft => ({
  slug: 'monstera-deliciosa',
  name: { en: 'Monstera Deliciosa', ru: 'Монстера' },
  description: { en: 'Split leaves, fast grower.', ru: 'Резные листья, быстро растёт.' },
  price: 1299,
  currency: 'INR',
  category: 'trendy',
  imageUrl: '/plants/monstera.png',
  inStock: true,
  ...overrides,
});

const listProducts = async (store: AppStore) =>
  store.dispatch(productApi.endpoints.getProducts.initiate({ perPage: 50 })).unwrap();

describe('product data layer', () => {
  it('lists the seeded products', async () => {
    const store = makeStore();
    const page = await listProducts(store);

    expect(page.total).toBe(SEED_PRODUCTS.length);
    expect(page.items.map((product) => product.slug)).toContain('calathea-plant');
  });

  it('fetches a single product by slug', async () => {
    const store = makeStore();
    const product = await store
      .dispatch(productApi.endpoints.getProductBySlug.initiate('desk-plant'))
      .unwrap();

    expect(product.name.en).toBe('Desk plant');
    expect(product.name.ru).toBe('Настольное растение');
  });

  it('reports a 404 for an unknown slug', async () => {
    const store = makeStore();
    const result = await store
      .dispatch(productApi.endpoints.getProductBySlug.initiate('no-such-plant'))
      .unwrap()
      .catch((error: unknown) => error);

    expect(result).toMatchObject({ status: 404 });
  });

  it('round-trips a create', async () => {
    const store = makeStore();
    const created = await store
      .dispatch(productApi.endpoints.createProduct.initiate(draft()))
      .unwrap();

    expect(created.id).toBeTruthy();
    expect(created.createdAt).toBeTruthy();

    const fetched = await store
      .dispatch(productApi.endpoints.getProductBySlug.initiate(created.slug))
      .unwrap();
    expect(fetched).toStrictEqual(created);
  });

  it('round-trips an update', async () => {
    const store = makeStore();
    const created = await store
      .dispatch(productApi.endpoints.createProduct.initiate(draft()))
      .unwrap();

    const updated = await store
      .dispatch(
        productApi.endpoints.updateProduct.initiate({
          id: created.id,
          patch: { price: 1499, inStock: false },
        }),
      )
      .unwrap();

    expect(updated.price).toBe(1499);
    expect(updated.inStock).toBe(false);
    expect(updated.name).toStrictEqual(created.name);
  });

  it('round-trips a delete', async () => {
    const store = makeStore();
    const created = await store
      .dispatch(productApi.endpoints.createProduct.initiate(draft()))
      .unwrap();

    await store.dispatch(productApi.endpoints.deleteProduct.initiate(created.id)).unwrap();

    const page = await listProducts(store);
    expect(page.items.map((product) => product.id)).not.toContain(created.id);
  });

  it('rejects an invalid draft with 422 and leaves the list alone', async () => {
    const store = makeStore();
    const before = await listProducts(store);

    const result = await store
      .dispatch(productApi.endpoints.createProduct.initiate(draft({ price: -5 })))
      .unwrap()
      .catch((error: unknown) => error);

    expect(result).toMatchObject({ status: 422 });
    const after = await listProducts(store);
    expect(after.total).toBe(before.total);
  });

  it('gives a duplicate slug a unique one instead of overwriting', async () => {
    const store = makeStore();
    const first = await store
      .dispatch(productApi.endpoints.createProduct.initiate(draft({ slug: 'calathea-plant' })))
      .unwrap();

    expect(first.slug).toBe('calathea-plant-2');
  });
});
