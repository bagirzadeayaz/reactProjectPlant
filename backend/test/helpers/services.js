import { readFile } from 'node:fs/promises';
import { AppError } from '../../src/domain/errors.js';
import { createAdminService } from '../../src/application/admin.js';
import { createContentService } from '../../src/application/content.js';
import { createImageService } from '../../src/application/images.js';
import { createProductService } from '../../src/application/products.js';

/** Fresh repositories per test/server. This module is never imported by production. */
export const createTestServices = async () => {
  const seed = JSON.parse(await readFile(new URL('../../seed.json', import.meta.url), 'utf8'));
  const records = new Map(seed.products.map((product) => [product.id, { product, version: 1 }]));
  const images = new Map();
  const subscriptions = new Map();
  const hasSlug = async (slug) =>
    [...records.values()].some(({ product }) => product.slug === slug);
  const checkVersion = (previous) => {
    if (records.get(previous.product.id)?.version !== previous.version)
      throw new AppError('CONFLICT', 'Product changed');
  };
  const repository = {
    list: async () => [...records.values()].map(({ product }) => structuredClone(product)),
    get: async (id) => structuredClone(records.get(id) ?? null),
    find: async (key) =>
      structuredClone(
        records.get(key) ??
          [...records.values()].find(({ product }) => product.slug === key) ??
          null,
      ),
    hasCategory: async (slug) => seed.categories.some((category) => category.slug === slug),
    hasSlug,
    create: async (product) => {
      if (await hasSlug(product.slug)) throw new AppError('CONFLICT', 'Slug already exists');
      records.set(product.id, { product: structuredClone(product), version: 1 });
    },
    update: async (product, previous) => {
      checkVersion(previous);
      if (product.slug !== previous.product.slug && (await hasSlug(product.slug)))
        throw new AppError('CONFLICT', 'Slug already exists');
      records.set(product.id, { product: structuredClone(product), version: previous.version + 1 });
    },
    delete: async (previous) => {
      checkVersion(previous);
      records.delete(previous.product.id);
    },
  };
  const imageService = createImageService({
    images: {
      get: async (hash) => images.get(hash) ?? null,
      createIfAbsent: async (hash, data) => {
        if (!images.has(hash)) images.set(hash, data);
      },
    },
  });
  return {
    products: createProductService({ products: repository, images: imageService }),
    images: imageService,
    content: createContentService({
      content: {
        listCategories: async () => structuredClone(seed.categories),
        listReviews: async (productId) =>
          seed.reviews.filter((review) => !productId || review.productId === productId),
        subscribe: async (id, data) => {
          if (!subscriptions.has(id)) subscriptions.set(id, data);
        },
      },
    }),
    admin: createAdminService({
      adminEmails: new Set(['admin@example.test']),
      verifyIdToken: async (token) => {
        if (token === 'test-admin') return { email: 'admin@example.test', email_verified: true };
        if (token === 'test-member') return { email: 'member@example.test', email_verified: true };
        if (token === 'test-unverified')
          return { email: 'admin@example.test', email_verified: false };
        throw new Error('Invalid test token');
      },
    }),
    seed: { ensureSeeded: () => Promise.resolve() },
  };
};
