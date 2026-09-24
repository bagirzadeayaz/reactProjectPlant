import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, test } from 'node:test';
import { createRequestHandler } from '../src/http/app.js';
import { createFrontendHandler } from '../src/http/static.js';
import { createTestServices } from './helpers/services.js';

let server, baseUrl, directory, services;
before(async () => {
  directory = await mkdtemp(join(tmpdir(), 'planto-http-'));
  await writeFile(join(directory, 'index.html'), '<div id="root"></div>');
  services = await createTestServices();
  server = createServer(
    createRequestHandler({
      services,
      allowedOrigin: 'http://localhost:5173',
      serveFrontend: createFrontendHandler(directory),
    }),
  );
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});
after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
  if (directory) {
    assert.ok(directory.startsWith(join(tmpdir(), 'planto-http-')));
    await rm(directory, { recursive: true, force: true });
  }
});
const request = (path, method = 'GET', body, token) =>
  fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });

test('health and public catalog require no credentials', async () => {
  assert.deepEqual(await (await request('/api/health')).json(), { ok: true });
  const page = await (await request('/api/products?category=top-selling&perPage=1')).json();
  assert.equal(page.total, 2);
  assert.equal(page.items.length, 1);
  assert.equal((await request('/api/categories')).status, 200);
});

test('admin requests reject missing, invalid, unverified and unapproved identities', async () => {
  for (const [token, status] of [
    [undefined, 401],
    ['invalid', 401],
    ['test-member', 403],
    ['test-unverified', 403],
  ]) {
    assert.equal((await request('/api/admin/me', 'GET', undefined, token)).status, status);
    assert.equal((await request('/api/products', 'POST', {}, token)).status, status);
  }
});

test('admin reads do not seed; session initialization uses POST', async () => {
  let seeds = 0;
  services.seed.ensureSeeded = async (token) => {
    assert.equal(token, 'test-admin');
    seeds += 1;
  };
  assert.equal((await request('/api/admin/me', 'GET', undefined, 'test-admin')).status, 200);
  assert.equal(seeds, 0);
  assert.equal((await request('/api/admin/session', 'POST', undefined, 'test-admin')).status, 200);
  assert.equal(seeds, 1);
});

test('admin CRUD validates fields, reserves unique slugs, updates lookup and deletes', async () => {
  const draft = {
    slug: 'test-fern',
    name: { en: 'Fern', ru: 'Папоротник' },
    description: { en: 'Green', ru: 'Зеленый' },
    price: 309,
    currency: 'INR',
    category: 'trendy',
    imageUrl: '/plants/fern.png',
    inStock: true,
  };
  assert.equal(
    (await request('/api/products', 'POST', { ...draft, price: -1 }, 'test-admin')).status,
    422,
  );
  const createdResponse = await request('/api/products', 'POST', draft, 'test-admin');
  assert.equal(createdResponse.status, 201);
  const created = await createdResponse.json();
  const duplicate = await (await request('/api/products', 'POST', draft, 'test-admin')).json();
  assert.equal(duplicate.slug, 'test-fern-2');
  assert.equal((await (await request('/api/products/test-fern')).json()).id, created.id);
  assert.equal(
    (await request(`/api/products/${created.id}`, 'PATCH', { slug: duplicate.slug }, 'test-admin'))
      .status,
    409,
  );
  const updated = await (
    await request(
      `/api/products/${created.id}`,
      'PATCH',
      { slug: 'renamed', price: 500 },
      'test-admin',
    )
  ).json();
  assert.equal(updated.price, 500);
  assert.equal((await request('/api/products/test-fern')).status, 404);
  assert.equal((await request('/api/products/renamed')).status, 200);
  assert.equal(
    (await request(`/api/products/${created.id}`, 'DELETE', undefined, 'test-admin')).status,
    204,
  );
  assert.equal((await request('/api/products/renamed')).status, 404);
  await request(`/api/products/${duplicate.id}`, 'DELETE', undefined, 'test-admin');
});

test('newsletter validates addresses and repeated subscriptions succeed', async () => {
  assert.equal((await request('/api/newsletter', 'POST', { email: 'bad' })).status, 422);
  for (let i = 0; i < 2; i++)
    assert.equal(
      (await request('/api/newsletter', 'POST', { email: 'USER@example.test' })).status,
      204,
    );
});

test('static routes work without a frontend build and never serve dotfiles', async () => {
  assert.match(await (await request('/catalog/desk-plant')).text(), /id="root"/);
  assert.equal((await request('/.env')).status, 404);
  assert.equal((await request('/missing.js')).status, 404);
  assert.equal((await request('/api')).status, 404);
  assert.equal((await request('/api/products/%GG')).status, 400);
});

test('CORS accepts only the configured origin', async () => {
  for (const [origin, status] of [
    ['http://localhost:5173', 204],
    ['https://other.example', 403],
  ]) {
    const response = await fetch(`${baseUrl}/api/products`, {
      method: 'OPTIONS',
      headers: { Origin: origin },
    });
    assert.equal(response.status, status);
  }
});
