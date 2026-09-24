import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createSeedService } from '../src/application/seed.js';

const fixture = {
  categories: [{ slug: 'trendy' }],
  products: [{ id: 'p-1', slug: 'fern' }],
  reviews: [{ id: 'r-1' }],
};
const setup = (overrides = {}) => {
  const writes = [];
  const repository = {
    isComplete: async () => false,
    createIfAbsent: async (...args) => {
      writes.push(args);
    },
    complete: async (data, token) => {
      writes.push(['metadata', 'initial-seed', data, token]);
    },
    ...overrides,
  };
  return { writes, service: createSeedService({ repository, loadSeed: async () => fixture }) };
};

test('concurrent admin initialization seeds once and forwards the user token', async () => {
  const { service, writes } = setup();
  await Promise.all([service.ensureSeeded('admin-token'), service.ensureSeeded('admin-token')]);
  await service.ensureSeeded('admin-token');
  assert.deepEqual(
    writes.map(([collection]) => collection),
    ['categories', 'products', 'productSlugs', 'reviews', 'metadata'],
  );
  assert.ok(writes.every((write) => write.at(-1) === 'admin-token'));
});

test('an existing completion marker prevents restoring deleted sample products', async () => {
  const { service, writes } = setup({ isComplete: async () => true });
  await service.ensureSeeded('admin-token');
  assert.equal(writes.length, 0);
});

test('a failed initialization retries and separate instances do not share state', async () => {
  let attempts = 0;
  const { service } = setup({
    isComplete: async () => {
      attempts += 1;
      if (attempts === 1) throw new Error('Temporary failure');
      return true;
    },
  });
  await assert.rejects(service.ensureSeeded('old-token'));
  await service.ensureSeeded('new-token');
  assert.equal(attempts, 2);
  const other = setup();
  await other.service.ensureSeeded('other-token');
  assert.equal(other.writes.length, 5);
});
