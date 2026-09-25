import { describe, expect, it } from 'vitest';
import { productDraftSchema, productPatchSchema, productSchema } from './schema';

const valid = {
  id: 'p-1',
  slug: 'calathea-plant',
  name: { en: 'Calathea plant', ru: 'Калатея' },
  description: { en: 'Patterned leaves.', ru: 'Узорчатые листья.' },
  price: 309,
  currency: 'AZN',
  category: 'trendy',
  imageUrl: '/plants/calathea.png',
  inStock: true,
  createdAt: '2026-01-12T09:00:00.000Z',
};

describe('productSchema', () => {
  it('accepts a well-formed product', () => {
    expect(productSchema.parse(valid)).toStrictEqual(valid);
  });

  it('requires both translations of a localized field', () => {
    const result = productSchema.safeParse({ ...valid, name: { en: 'Only English' } });
    expect(result.success).toBe(false);
  });

  it('rejects an empty translation', () => {
    expect(productSchema.safeParse({ ...valid, name: { en: 'x', ru: '' } }).success).toBe(false);
  });

  it('rejects a negative or fractional price', () => {
    expect(productSchema.safeParse({ ...valid, price: -1 }).success).toBe(false);
    expect(productSchema.safeParse({ ...valid, price: 12.5 }).success).toBe(false);
  });

  it('rejects an unknown currency', () => {
    expect(productSchema.safeParse({ ...valid, currency: 'XYZ' }).success).toBe(false);
  });

  it('rejects a non-ISO createdAt', () => {
    expect(productSchema.safeParse({ ...valid, createdAt: '12 Jan 2026' }).success).toBe(false);
  });
});

describe('productDraftSchema', () => {
  it('does not require id or createdAt — the server owns those', () => {
    const { id: _id, createdAt: _createdAt, ...draft } = valid;
    expect(productDraftSchema.safeParse(draft).success).toBe(true);
  });

  it('still enforces the rest of the shape', () => {
    const { id: _id, createdAt: _createdAt, ...draft } = valid;
    expect(productDraftSchema.safeParse({ ...draft, price: -1 }).success).toBe(false);
  });
});

describe('productPatchSchema', () => {
  it('accepts an empty patch', () => {
    expect(productPatchSchema.safeParse({}).success).toBe(true);
  });

  it('accepts a single field', () => {
    expect(productPatchSchema.safeParse({ price: 500 }).success).toBe(true);
  });

  it('validates the fields that are present', () => {
    expect(productPatchSchema.safeParse({ price: -500 }).success).toBe(false);
  });
});
