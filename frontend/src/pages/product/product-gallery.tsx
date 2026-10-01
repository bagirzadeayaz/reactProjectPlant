import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PRODUCT_IMAGE_SIZE, productImageSources, type Product } from '../../entities/product';
import { cn } from '../../shared/lib/cn';
import { ResponsiveImage } from '../../shared/ui';

export interface ProductGalleryProps {
  product: Product;
  name: string;
  selectedImage?: string;
}

export const ProductGallery = ({ product, name, selectedImage }: ProductGalleryProps) => {
  const { t } = useTranslation('product');
  const [frame, setFrame] = useState(0);
  const images = [...new Set([selectedImage ?? product.imageUrl, ...(product.gallery ?? [])])];
  const activeIndex = Math.min(frame, images.length - 1);
  const activeImage = images[activeIndex] ?? product.imageUrl;
  const sources = activeImage === product.imageUrl ? productImageSources(product) : undefined;

  return (
    <div role="group" aria-label={t('gallery')} className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-card border-(length:--border-width-control) border-border-glass bg-surface-glass p-6 backdrop-blur-panel sm:p-8">
        <ResponsiveImage
          src={activeImage}
          {...(sources ? { sources } : {})}
          width={PRODUCT_IMAGE_SIZE}
          height={PRODUCT_IMAGE_SIZE}
          sizes="(min-width: 1024px) 40vw, 90vw"
          priority
          alt={name}
          className="aspect-square w-full object-contain drop-shadow-media"
        />
      </div>

      <ul className="flex gap-3 overflow-x-auto">
        {images.length > 1 &&
          images.map((image, index) => (
            <li key={index}>
              <button
                type="button"
                onClick={() => {
                  setFrame(index);
                }}
                aria-label={t('imageN', { n: index + 1, total: images.length })}
                aria-pressed={index === activeIndex}
                className={cn(
                  'block size-20 overflow-hidden rounded-icon border-(length:--border-width-control)',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink',
                  index === activeIndex
                    ? 'border-ink'
                    : 'border-border-glass opacity-70 hover:opacity-100',
                )}
              >
                <img
                  src={image}
                  alt=""
                  width={80}
                  height={80}
                  loading="lazy"
                  className="size-full object-contain"
                />
              </button>
            </li>
          ))}
      </ul>
    </div>
  );
};
