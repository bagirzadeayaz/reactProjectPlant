import type { Product } from '../model/schema';
import type { ProductVariant } from '../../../shared/commerce';

export const defaultVariant = (product: Product): ProductVariant | undefined =>
  product.variants?.find((variant) => variant.stock > 0) ?? product.variants?.[0];

/** Resolve current catalog data every time; removed options never become another option. */
export const resolvePurchase = (product: Product | undefined, variantId?: string) => {
  if (!product) return undefined;
  const variant = variantId
    ? product.variants?.find((option) => option.id === variantId)
    : defaultVariant(product);
  if (variantId && !variant) return undefined;
  return {
    price: variant?.price ?? product.price,
    imageUrl: variant?.imageUrl ?? product.imageUrl,
    inStock: product.inStock && (!variant || variant.stock > 0),
    stock: variant?.stock ?? 99,
    variant,
  };
};
