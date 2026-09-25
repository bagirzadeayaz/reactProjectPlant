import { describe, expect, it } from 'vitest';
import { productApi, type ProductDraft } from '../../entities/product';
import { makeStore, type AppStore } from './store';

/**
 * The half of the data layer that is easy to get wrong and invisible until it
 * bites: after a mutation, does a *subscribed* list actually refetch?
 *
 * These tests keep a subscription open (as a mounted component would) and read
 * the cache afterwards, rather than issuing a fresh request — a fresh request
 * would pass even with the tags removed.
 */

const draft = (overrides: Partial<ProductDraft> = {}): ProductDraft => ({
  slug: 'zz-plant',
  name: { en: 'ZZ plant', ru: 'Замиокулькас' },
  description: { en: 'Survives anything.', ru: 'Переживёт что угодно.' },
  price: 499,
  currency: 'AZN',
  category: 'trendy',
  imageUrl: '/plants/zz.png',
  inStock: true,
  ...overrides,
});

const LIST_ARG = { perPage: 50 } as const;

/** Reads the currently cached list without triggering a new request. */
const cachedList = (store: AppStore) =>
  productApi.endpoints.getProducts.select(LIST_ARG)(store.getState());

/**
 * Polls until `predicate` holds, then returns.
 *
 * Waiting for "not fetching" is not enough: right after an invalidation the
 * cache still holds the *previous* fulfilled result, so a status check would
 * pass instantly and the assertion would test nothing. Each caller waits for
 * the specific change it expects instead, and a refetch that never happens
 * fails here rather than passing by accident.
 */
const waitForCache = async (predicate: () => boolean, what: string): Promise<void> => {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (predicate()) return;
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  throw new Error(`cache never updated: ${what}`);
};

describe('product cache invalidation', () => {
  it('refetches a subscribed list after a create', async () => {
    const store = makeStore();
    const subscription = store.dispatch(productApi.endpoints.getProducts.initiate(LIST_ARG));
    await subscription;

    const before = cachedList(store).data?.total ?? 0;

    await store.dispatch(productApi.endpoints.createProduct.initiate(draft())).unwrap();
    await waitForCache(
      () => cachedList(store).data?.total === before + 1,
      'list grew after create',
    );

    expect(cachedList(store).data?.total).toBe(before + 1);
    expect(cachedList(store).data?.items.map((item) => item.slug)).toContain('zz-plant');

    subscription.unsubscribe();
  });

  it('refetches a subscribed list after a delete', async () => {
    const store = makeStore();
    const created = await store
      .dispatch(productApi.endpoints.createProduct.initiate(draft()))
      .unwrap();

    const subscription = store.dispatch(productApi.endpoints.getProducts.initiate(LIST_ARG));
    await subscription;
    const before = cachedList(store).data?.total ?? 0;

    await store.dispatch(productApi.endpoints.deleteProduct.initiate(created.id)).unwrap();
    await waitForCache(
      () => cachedList(store).data?.total === before - 1,
      'list shrank after delete',
    );

    expect(cachedList(store).data?.total).toBe(before - 1);

    subscription.unsubscribe();
  });

  it('refreshes a subscribed list entry after an update', async () => {
    const store = makeStore();
    const created = await store
      .dispatch(productApi.endpoints.createProduct.initiate(draft()))
      .unwrap();

    const subscription = store.dispatch(productApi.endpoints.getProducts.initiate(LIST_ARG));
    await subscription;

    await store
      .dispatch(
        productApi.endpoints.updateProduct.initiate({ id: created.id, patch: { price: 111 } }),
      )
      .unwrap();

    const cachedPrice = () =>
      cachedList(store).data?.items.find((entry) => entry.id === created.id)?.price;
    await waitForCache(() => cachedPrice() === 111, 'list entry reflects the new price');

    expect(cachedPrice()).toBe(111);

    subscription.unsubscribe();
  });

  it('refreshes a subscribed detail view after an update', async () => {
    const store = makeStore();
    const subscription = store.dispatch(
      productApi.endpoints.getProductBySlug.initiate('calathea-plant'),
    );
    const original = await subscription.unwrap();

    await store
      .dispatch(
        productApi.endpoints.updateProduct.initiate({ id: original.id, patch: { price: 1000 } }),
      )
      .unwrap();

    const cachedDetail = () =>
      productApi.endpoints.getProductBySlug.select('calathea-plant')(store.getState());

    await waitForCache(() => cachedDetail().data?.price === 1000, 'detail reflects the new price');

    expect(cachedDetail().data?.price).toBe(1000);

    subscription.unsubscribe();
  });
});
