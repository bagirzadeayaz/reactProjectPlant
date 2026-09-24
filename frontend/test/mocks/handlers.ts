import { delay, http, HttpResponse } from 'msw';
import {
  productDraftSchema,
  productPatchSchema,
  type Product,
} from '../../src/entities/product/model/schema';
import { subscriptions } from './newsletter';
import { db } from './db';
import { parseProductQuery, selectProducts } from './query';
import { toSlug, uniqueSlug } from './slug';

export const API_BASE = '/api';

const notFound = () => HttpResponse.json({ message: 'Not found' }, { status: 404 });

const invalid = (issues: unknown) =>
  HttpResponse.json({ message: 'Invalid product', issues }, { status: 422 });

let idCounter = 0;
const nextId = (): string => {
  idCounter += 1;
  return `p-new-${String(Date.now())}-${String(idCounter)}`;
};

/**
 * The fake backend used by frontend tests. Production requests reach Node.js.
 */
export const handlers = [
  http.post(`${API_BASE}/newsletter`, async ({ request }) => {
    await delay(50);
    const body = (await request.json()) as { email?: string };
    if (body.email?.endsWith('@fail.test'))
      return HttpResponse.json({ message: 'Failed' }, { status: 500 });
    if (body.email) subscriptions.add(body.email);
    return new HttpResponse(null, { status: 204 });
  }),
  http.post(`${API_BASE}/admin/session`, ({ request }) =>
    request.headers.get('Authorization') === 'Bearer test-admin-token'
      ? HttpResponse.json({ email: 'admin@example.test' })
      : HttpResponse.json({ message: 'Sign in required' }, { status: 401 }),
  ),
  http.get(`${API_BASE}/categories`, () => HttpResponse.json(db.get().categories)),

  http.get(`${API_BASE}/reviews`, ({ request }) => {
    const productId = new URL(request.url).searchParams.get('productId');
    const { reviews } = db.get();
    return HttpResponse.json(
      productId === null ? reviews : reviews.filter((review) => review.productId === productId),
    );
  }),

  http.get(`${API_BASE}/products`, ({ request }) => {
    const query = parseProductQuery(new URL(request.url).searchParams);
    return HttpResponse.json(selectProducts(db.get().products, query));
  }),

  // One lookup route for both keys: the storefront links by slug, the admin
  // form by id. Slugs are derived from names and ids carry a `p-` prefix with
  // a counter, so a collision would take a plant literally named "p-1".
  http.get(`${API_BASE}/products/:key`, ({ params }) => {
    const key = String(params.key);
    const product = db.get().products.find((item) => item.slug === key || item.id === key);
    return product ? HttpResponse.json(product) : notFound();
  }),

  http.post(`${API_BASE}/products`, async ({ request }) => {
    const body: unknown = await request.json();
    const parsed = productDraftSchema.safeParse(body);
    if (!parsed.success) return invalid(parsed.error.issues);

    const current = db.get();
    const created: Product = {
      ...parsed.data,
      id: nextId(),
      slug: uniqueSlug(
        toSlug(parsed.data.slug || parsed.data.name.en),
        current.products.map((item) => item.slug),
      ),
      createdAt: new Date().toISOString(),
    };

    db.commit({ ...current, products: [...current.products, created] });
    return HttpResponse.json(created, { status: 201 });
  }),

  http.patch(`${API_BASE}/products/:id`, async ({ params, request }) => {
    const body: unknown = await request.json();
    const parsed = productPatchSchema.safeParse(body);
    if (!parsed.success) return invalid(parsed.error.issues);

    const id = String(params.id);
    const current = db.get();
    const existing = current.products.find((item) => item.id === id);
    if (!existing) return notFound();

    // `exactOptionalPropertyTypes` means an absent field arrives as an explicit
    // `undefined`. Spreading that over `existing` would blank real values, so drop
    // the undefined keys first.
    // An empty slug means "keep the one it has", same as on create.
    const changes = Object.fromEntries(
      Object.entries(parsed.data).filter(
        ([key, value]) => value !== undefined && !(key === 'slug' && value === ''),
      ),
    ) as Partial<Product>;
    const updated: Product = { ...existing, ...changes };
    db.commit({
      ...current,
      products: current.products.map((item) => (item.id === updated.id ? updated : item)),
    });
    return HttpResponse.json(updated);
  }),

  http.delete(`${API_BASE}/products/:id`, ({ params }) => {
    const id = String(params.id);
    const current = db.get();
    if (!current.products.some((item) => item.id === id)) return notFound();

    db.commit({ ...current, products: current.products.filter((item) => item.id !== id) });
    return new HttpResponse(null, { status: 204 });
  }),
];
