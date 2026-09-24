import { z } from 'zod';
import { AppError } from './errors.js';

const localized = z.object({
  en: z.string().trim().min(1).max(500),
  ru: z.string().trim().min(1).max(500),
});
const imageUrl = z.string().min(1).max(420_000);
const fields = {
  slug: z.string().max(100),
  name: localized,
  description: localized,
  price: z.number().int().nonnegative(),
  currency: z.literal('INR'),
  category: z.string().min(1).max(100),
  imageUrl,
  inStock: z.boolean(),
};
export const draftSchema = z.strictObject(fields);
export const patchSchema = draftSchema.partial();

export const parseProduct = (schema, value) => {
  const parsed = schema.safeParse(value);
  if (!parsed.success) throw new AppError('VALIDATION', 'Invalid product', parsed.error.issues);
  return parsed.data;
};

export const toSlug = (value) =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100)
    .replace(/-+$/, '');

const comparators = {
  newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
  'name-asc': (a, b) => a.name.en.localeCompare(b.name.en),
};

export const selectProducts = (products, query) => {
  const filtered = products
    .filter(
      (p) =>
        !query.search ||
        p.name.en.toLowerCase().includes(query.search) ||
        p.name.ru.toLowerCase().includes(query.search),
    )
    .filter((p) => !query.category || p.category === query.category)
    .filter((p) => query.minPrice === null || p.price >= query.minPrice)
    .filter((p) => query.maxPrice === null || p.price <= query.maxPrice)
    .filter((p) => !query.inStock || p.inStock)
    .sort(comparators[query.sort]);
  const start = (query.page - 1) * query.perPage;
  return {
    items: filtered.slice(start, start + query.perPage),
    total: filtered.length,
    page: query.page,
    perPage: query.perPage,
  };
};
