import type { Product, ProductDraft } from '../../../entities/product';
import { DEFAULT_DELIVERY } from '../../../shared/commerce';

export type ProductFormValues = ProductDraft;

/** An empty form. Prices use Azerbaijani manat. */
export const EMPTY_PRODUCT: ProductFormValues = {
  slug: '',
  name: { en: '', ru: '' },
  description: { en: '', ru: '' },
  price: 0,
  currency: 'AZN',
  category: '',
  care: {
    light: 'bright',
    watering: 'top-dry',
    size: 'medium',
    effort: 'easy',
    humidity: 'average',
    pets: 'unknown',
  },
  imageUrl: '',
  gallery: [],
  status: 'draft',
  inStock: true,
  variants: [],
  delivery: DEFAULT_DELIVERY,
};

/** The editable part of an existing product, in form order. */
export const toFormValues = (product: Product): ProductFormValues => ({
  slug: product.slug,
  name: { ...product.name },
  description: { ...product.description },
  price: product.price,
  currency: product.currency,
  category: product.category,
  care: product.care ? { ...product.care } : { ...EMPTY_PRODUCT.care },
  imageUrl: product.imageUrl,
  gallery: product.gallery ?? [],
  status: product.status ?? 'published',
  inStock: product.inStock,
  variants: product.variants?.map((variant) => ({ ...variant })) ?? [],
  delivery: product.delivery ?? DEFAULT_DELIVERY,
});
