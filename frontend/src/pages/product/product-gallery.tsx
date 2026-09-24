import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PRODUCT_IMAGE_SIZE, productImageSources, type Product } from '../../entities/product';
import { cn } from '../../shared/lib/cn';
import { ResponsiveImage } from '../../shared/ui';

export interface ProductGalleryProps {
  product: Product;
  name: string;
}

/** Framing options for the one picture each product ships with. */
const FRAMES = ['object-contain', 'object-cover object-top', 'object-cover object-bottom'] as const;

/**
 * The product picture, large, with three framings underneath.
 *
 * Every seeded product has a single cut-out image, so a "gallery" of
 * different photographs is not possible with the data at hand. The
 * thumbnails reframe that image instead — full, top and base — which is
 * more honest than repeating it three times.
 */
export const ProductGallery = ({ product, name }: ProductGalleryProps) => {
  const { t } = useTranslation('product');
  const [frame, setFrame] = useState(0);
  const sources = productImageSources(product);

  return (
    <div role="group" aria-label={t('gallery')} className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-card border-(length:--border-width-control) border-border-glass bg-surface-glass p-6 backdrop-blur-panel sm:p-8">
        <ResponsiveImage
          src={product.imageUrl}
          sources={sources}
          width={PRODUCT_IMAGE_SIZE}
          height={PRODUCT_IMAGE_SIZE}
          sizes="(min-width: 1024px) 40vw, 90vw"
          priority
          alt={name}
          className={cn('aspect-square w-full drop-shadow-media', FRAMES[frame])}
        />
      </div>

      <ul className="flex gap-3">
        {FRAMES.map((framing, index) => (
          <li key={framing}>
            <button
              type="button"
              onClick={() => {
                setFrame(index);
              }}
              aria-label={t('imageN', { n: index + 1, total: FRAMES.length })}
              aria-pressed={index === frame}
              className={cn(
                'block size-20 overflow-hidden rounded-icon border-(length:--border-width-control)',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink',
                index === frame ? 'border-ink' : 'border-border-glass opacity-70 hover:opacity-100',
              )}
            >
              <img
                src={product.imageUrl}
                alt=""
                width={80}
                height={80}
                loading="lazy"
                className={cn('size-full', framing)}
              />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
