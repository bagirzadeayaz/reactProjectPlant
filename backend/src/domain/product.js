import { z } from 'zod';
import { AppError } from './errors.js';

const localized = z.object({
  en: z.string().trim().min(1).max(500),
  ru: z.string().trim().min(1).max(500),
});
const imageUrl = z.string().min(1).max(420_000);
const care = z.object({
  light: z.enum(['low', 'bright', 'direct']),
  watering: z.enum(['dry', 'top-dry', 'moist']),
  size: z.enum(['compact', 'medium', 'large']),
  effort: z.enum(['easy', 'regular']),
  humidity: z.enum(['average', 'high']),
  pets: z.enum(['safe', 'toxic', 'unknown']),
});
const fields = {
  slug: z.string().max(100),
  name: localized,
  description: localized,
  price: z.number().int().nonnegative(),
  currency: z.literal('AZN'),
  category: z.string().min(1).max(100),
  care,
  imageUrl,
  inStock: z.boolean(),
  variants: z
    .array(
      z.object({
        id: z.string().regex(/^[a-zA-Z0-9-]{1,80}$/),
        size: z.enum(['small', 'medium', 'large']),
        heightCm: z.number().int().min(5).max(300),
        pot: z.enum(['original', 'cream', 'sage', 'terracotta']),
        price: z.number().int().nonnegative(),
        stock: z.number().int().min(0).max(999),
        imageUrl,
      }),
    )
    .max(12)
    .refine(
      (variants) =>
        new Set(variants.map((variant) => variant.id)).size === variants.length &&
        new Set(variants.map((variant) => `${variant.size}:${variant.pot}`)).size ===
          variants.length,
    )
    .optional(),
  delivery: z
    .object({
      areas: z
        .array(z.enum(['baku', 'absheron', 'regions']))
        .min(1)
        .max(3),
      dispatchDays: z.number().int().min(0).max(14),
    })
    .optional(),
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
