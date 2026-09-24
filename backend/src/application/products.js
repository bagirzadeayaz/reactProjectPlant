import { randomUUID } from 'node:crypto';
import { AppError, notFound } from '../domain/errors.js';
import {
  draftSchema,
  patchSchema,
  parseProduct,
  selectProducts,
  toSlug,
} from '../domain/product.js';

/** Repository operations are documented in README.md; no Firestore or HTTP dependencies. */
export const createProductService = ({
  products,
  images,
  newId = randomUUID,
  now = () => new Date().toISOString(),
}) => {
  const assertCategory = async (slug) => {
    if (!(await products.hasCategory(slug))) throw new AppError('VALIDATION', 'Unknown category');
  };

  return {
    list: async (query) => selectProducts(await products.list(), query),
    find: async (key) => {
      const record = await products.find(key);
      if (!record) throw notFound();
      return record.product;
    },
    create: async (input, token) => {
      const draft = parseProduct(draftSchema, input);
      await assertCategory(draft.category);
      const base = toSlug(draft.slug || draft.name.en);
      if (!base) throw new AppError('VALIDATION', 'Invalid product slug');
      const imageUrl = await images.store(draft.imageUrl, token);
      const id = newId();
      const createdAt = now();
      for (let suffix = 1; suffix < 1000; suffix += 1) {
        const slug = suffix === 1 ? base : `${base}-${suffix}`;
        if (await products.hasSlug(slug)) continue;
        const product = { ...draft, id, slug, imageUrl, createdAt };
        try {
          await products.create(product, token);
          return product;
        } catch (error) {
          if (!(error instanceof AppError) || error.code !== 'CONFLICT') throw error;
        }
      }
      throw new AppError('CONFLICT', 'No available product slug');
    },
    update: async (id, input, token) => {
      const patch = parseProduct(patchSchema, input);
      const record = await products.get(id);
      if (!record) throw notFound();
      if (patch.category) await assertCategory(patch.category);
      const slug = patch.slug ? toSlug(patch.slug) : record.product.slug;
      if (!slug) throw new AppError('VALIDATION', 'Invalid product slug');
      if (slug !== record.product.slug && (await products.hasSlug(slug))) {
        throw new AppError('CONFLICT', 'Product slug already exists');
      }
      const imageUrl = patch.imageUrl
        ? await images.store(patch.imageUrl, token)
        : record.product.imageUrl;
      const product = { ...record.product, ...patch, slug, imageUrl };
      await products.update(product, record, token);
      return product;
    },
    delete: async (id, token) => {
      const record = await products.get(id);
      if (!record) throw notFound();
      await products.delete(record, token);
    },
  };
};
