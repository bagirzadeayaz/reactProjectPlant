import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createProductService } from '../src/application/products.js';
import { createProductRepository } from '../src/infrastructure/firestore/products.js';
import { FirestoreRest } from '../src/infrastructure/firestore/client.js';
import { decodeFields } from '../src/infrastructure/firestore/client.js';
import { AppError } from '../src/domain/errors.js';

const draft = {
  slug: 'fern',
  name: { en: 'Fern', ru: 'Папоротник' },
  description: { en: 'Green', ru: 'Зеленый' },
  price: 309,
  currency: 'INR',
  category: 'trendy',
  imageUrl: '/plants/fern.png',
  inStock: true,
};

test('a raced slug reservation retries with a new slug and the same product identity', async () => {
  const attempts = [];
  const service = createProductService({
    products: {
      hasCategory: async () => true,
      hasSlug: async () => false,
      create: async (product, token) => {
        attempts.push({ product, token });
        if (attempts.length === 1) throw new AppError('CONFLICT', 'Raced reservation');
      },
    },
    images: { store: async (url) => url },
    newId: () => 'new-id',
    now: () => '2026-01-01T00:00:00.000Z',
  });
  const result = await service.create(draft, 'admin-token');
  assert.equal(result.slug, 'fern-2');
  assert.equal(attempts.length, 2);
  assert.ok(
    attempts.every(({ product, token }) => product.id === 'new-id' && token === 'admin-token'),
  );
});

test('invalid input and missing products cause no image writes', async () => {
  let imageWrites = 0;
  const service = createProductService({
    products: { get: async () => null },
    images: {
      store: async () => {
        imageWrites++;
      },
    },
  });
  await assert.rejects(service.create({ ...draft, price: -1 }, 'token'), { code: 'VALIDATION' });
  await assert.rejects(
    service.update('missing', { imageUrl: 'data:image/png;base64,abcd' }, 'token'),
    { code: 'NOT_FOUND' },
  );
  assert.equal(imageWrites, 0);
});

test('Firestore repository commits product and slug changes atomically with version preconditions', async () => {
  const calls = [];
  const db = new FirestoreRest({
    projectId: 'test-project',
    fetchImpl: async (url, options) => {
      calls.push({ url, options, body: JSON.parse(options.body) });
      return Response.json({ writeResults: [] });
    },
  });
  const repository = createProductRepository(db);
  const previous = { product: { ...draft, id: 'p-1' }, version: '2026-01-01T00:00:00Z' };
  await repository.create(previous.product, 'admin-token');
  const creation = calls[0].body.writes;
  assert.equal(creation.length, 2);
  assert.ok(creation.every((write) => write.currentDocument.exists === false));
  assert.equal(decodeFields(creation[1].update.fields).productId, 'p-1');
  await repository.update({ ...previous.product, slug: 'new-fern' }, previous, 'admin-token');
  const update = calls[1].body.writes;
  assert.equal(update.length, 3);
  assert.deepEqual(update[0].currentDocument, { updateTime: previous.version });
  assert.equal(update[1].currentDocument.exists, false);
  assert.ok(update[2].delete.endsWith('/productSlugs/fern'));
  await repository.delete(previous, 'admin-token');
  assert.equal(calls[2].body.writes.length, 2);
  assert.deepEqual(calls[2].body.writes[0].currentDocument, { updateTime: previous.version });
  assert.ok(calls.every(({ options }) => options.headers.Authorization === 'Bearer admin-token'));
});
