import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  FirestoreRest,
  decodeFields,
  encodeFields,
} from '../src/infrastructure/firestore/client.js';

test('Firestore values preserve nested product data and image bytes', () => {
  const data = {
    name: { en: 'Fern', ru: 'Папоротник' },
    price: 309,
    inStock: true,
    labels: ['green', 'indoor'],
    bytes: Buffer.from([0, 1, 255]),
  };
  assert.deepEqual(decodeFields(encodeFields(data)), data);
});

test('public reads paginate and admin writes forward the Firebase ID token', async () => {
  const calls = [];
  const api = new FirestoreRest({
    projectId: 'test-project',
    databaseId: '(default)',
    fetchImpl: async (url, options) => {
      calls.push({ url: String(url), options });
      if (options.method === 'POST') return Response.json({ writeResults: [] });
      if (String(url).includes('pageToken=next')) {
        return Response.json({
          documents: [{ name: `${api.resource}/products/two`, fields: encodeFields({ price: 2 }) }],
        });
      }
      return Response.json({
        documents: [{ name: `${api.resource}/products/one`, fields: encodeFields({ price: 1 }) }],
        nextPageToken: 'next',
      });
    },
  });

  assert.deepEqual(
    (await api.list('products')).map(({ id, data }) => [id, data.price]),
    [
      ['one', 1],
      ['two', 2],
    ],
  );
  assert.equal(calls[0].options.headers.Authorization, undefined);

  const write = api.updateWrite('products', 'three', { price: 3 });
  await api.commit([write], 'firebase-id-token');
  assert.equal(calls[2].url, `${api.root}:commit`);
  assert.equal(calls[2].options.headers.Authorization, 'Bearer firebase-id-token');
  assert.deepEqual(JSON.parse(calls[2].options.body).writes, [write]);
});

test('Firestore permission errors do not expose response details', async () => {
  const api = new FirestoreRest({
    projectId: 'test-project',
    fetchImpl: async () => Response.json({ error: { message: 'private detail' } }, { status: 403 }),
  });
  await assert.rejects(api.list('products'), (error) => {
    assert.equal(error.code, 'UNAVAILABLE');
    assert.doesNotMatch(error.message, /private detail/);
    return true;
  });
});
