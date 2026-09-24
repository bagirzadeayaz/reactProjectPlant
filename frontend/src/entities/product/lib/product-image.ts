import type { ImageSource } from '../../../shared/ui';
import type { Product } from '../model/schema';

/** The widths `public/plants/<slug>-<w>.webp` is generated at. */
export const PRODUCT_IMAGE_WIDTHS = [400, 800, 1200] as const;

/** Product art is square: the cut-outs are composed onto a 1:1 canvas. */
export const PRODUCT_IMAGE_SIZE = 800;

/**
 * Responsive sources for a product's picture.
 *
 * `imageUrl` is the PNG fallback (`/plants/<slug>.png`); the AVIF and WebP
 * variants sit beside it under the same slug (`scripts/generate-images.mjs`).
 * A product created through the admin form with an arbitrary URL or a data
 * URL simply gets no alternatives.
 */
export const productImageSources = (product: Pick<Product, 'imageUrl'>): ImageSource[] => {
  const match = /^\/plants\/([a-z0-9-]+)\.png$/.exec(product.imageUrl);
  if (!match) return [];
  const slug = match[1] ?? '';
  return (['image/avif', 'image/webp'] as const).flatMap((type) =>
    PRODUCT_IMAGE_WIDTHS.map((width) => ({
      src: `/plants/${slug}-${String(width)}.${type === 'image/avif' ? 'avif' : 'webp'}`,
      width,
      type,
    })),
  );
};
