import { describe, expect, it } from 'vitest';
import { productApi, type ProductDraft } from '../../entities/product';
import { makeStore } from './store';

const draft: ProductDraft = {
  slug: 'snake-plant',
  name: { en: 'Snake plant', ru: 'Сансевиерия' },
  description: { en: 'Nearly unkillable.', ru: 'Почти неубиваемое.' },
  price: 349,
  currency: 'INR',
  category: 'best-o2',
  imageUrl: '/plants/snake.png',
  inStock: true,
};

/** Fresh client stores must read persisted server changes, without mirroring them locally. */
describe('server state across client stores', () => {
  it('serves a created product to a store that never saw the create', async () => {
    const writer = makeStore();
    const created = await writer
      .dispatch(productApi.endpoints.createProduct.initiate(draft))
      .unwrap();

    const reader = makeStore();
    const fetched = await reader
      .dispatch(productApi.endpoints.getProductBySlug.initiate(created.slug))
      .unwrap();

    expect(fetched.id).toBe(created.id);
  });

  it('keeps a delete across a reload', async () => {
    const writer = makeStore();
    await writer.dispatch(productApi.endpoints.deleteProduct.initiate('p-1')).unwrap();

    const reader = makeStore();
    const page = await reader
      .dispatch(productApi.endpoints.getProducts.initiate({ perPage: 50 }))
      .unwrap();

    expect(page.items.map((product) => product.id)).not.toContain('p-1');
  });
});
