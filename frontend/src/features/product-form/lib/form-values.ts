import type { Product, ProductDraft } from '../../../entities/product';

export type ProductFormValues = ProductDraft;

/** An empty form. `currency` is fixed: the comp prices everything in rupees. */
export const EMPTY_PRODUCT: ProductFormValues = {
  slug: '',
  name: { en: '', ru: '' },
  description: { en: '', ru: '' },
  price: 0,
  currency: 'AZN',
  category: '',
  imageUrl: '',
  inStock: true,
};

/** The editable part of an existing product, in form order. */
export const toFormValues = (product: Product): ProductFormValues => ({
  slug: product.slug,
  name: { ...product.name },
  description: { ...product.description },
  price: product.price,
  currency: product.currency,
  category: product.category,
  imageUrl: product.imageUrl,
  inStock: product.inStock,
});
