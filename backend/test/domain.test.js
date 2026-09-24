import assert from 'node:assert/strict';
import { test } from 'node:test';
import { decodeImage } from '../src/domain/image.js';
import { parseProductQuery } from '../src/http/product-query.js';
import { draftSchema, parseProduct, selectProducts } from '../src/domain/product.js';

test('catalog query preserves search, filters and pagination', () => {
  const query = parseProductQuery(
    new URLSearchParams('search=desk&category=top-selling&sort=price-desc&page=1&perPage=1'),
  );
  const result = selectProducts(
    [
      {
        id: '1',
        name: { en: 'Desk plant', ru: 'Растение' },
        category: 'top-selling',
        price: 359,
        createdAt: '2026-01-01',
        inStock: true,
      },
      {
        id: '2',
        name: { en: 'Desk fern', ru: 'Папоротник' },
        category: 'top-selling',
        price: 659,
        createdAt: '2026-01-02',
        inStock: true,
      },
      {
        id: '3',
        name: { en: 'Other', ru: 'Другое' },
        category: 'trendy',
        price: 100,
        createdAt: '2026-01-03',
        inStock: true,
      },
    ],
    query,
  );
  assert.equal(result.total, 2);
  assert.equal(result.items[0].id, '2');
});

test('invalid product fields fail server validation', () => {
  assert.throws(() => parseProduct(draftSchema, { price: -1 }), { code: 'VALIDATION' });
});

test('image upload derives a stable SHA-256 ID and rejects disguised files', () => {
  const bytes = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 1, 2]);
  const dataUrl = `data:image/png;base64,${bytes.toString('base64')}`;
  const parsed = decodeImage(dataUrl);
  assert.equal(parsed.contentType, 'image/png');
  assert.equal(parsed.hash.length, 64);
  assert.deepEqual(parsed.bytes, bytes);
  assert.throws(() => decodeImage('data:image/png;base64,aGVsbG8='), { code: 'VALIDATION' });
});
