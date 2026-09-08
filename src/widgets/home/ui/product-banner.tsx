import { useTranslation } from 'react-i18next';
import { AddToCartButton } from '../../../features/add-to-cart';
import { PRODUCT_IMAGE_SIZE, productImageSources, type Product } from '../../../entities/product';
import { useFormatters, useLocale } from '../../../shared/i18n';
import { cn } from '../../../shared/lib/cn';
import { ResponsiveImage } from '../../../shared/ui';

export interface ProductBannerProps {
  product: Product;
  /** Node 22:65 puts the plant on the left; node 22:76 mirrors it. */
  align?: 'left' | 'right';
}

/**
 * Section 4 — the two pill banners under "Our Trendy plants" (nodes 22:65 and
 * 22:76: 1609 × 526, radius 151, 3px 45%-white border, 11px blur) with a
 * 601 × 732 plant overhanging the top edge and the copy block (22:75 / 22:78)
 * on the other side.
 *
 * Reflow: side by side from lg. Below lg the plant sits above the copy and
 * the pill radius drops to the control radius so the shape still reads.
 */
export const ProductBanner = ({ product, align = 'left' }: ProductBannerProps) => {
  const { t } = useTranslation('home');
  const { locale, localized } = useLocale();
  const format = useFormatters(locale);
  const name = localized(product.name);

  return (
    <article
      className={cn(
        'grid items-center gap-8 rounded-control border-(length:--border-width-panel) border-border-glass',
        'bg-surface-glass px-8 py-10 backdrop-blur-panel',
        'lg:grid-cols-2 lg:rounded-panel lg:px-24 lg:py-12',
      )}
    >
      <div className={cn('flex justify-center', align === 'right' && 'lg:order-2')}>
        <ResponsiveImage
          src={product.imageUrl}
          sources={productImageSources(product)}
          width={PRODUCT_IMAGE_SIZE}
          height={PRODUCT_IMAGE_SIZE}
          sizes="(min-width: 1024px) 601px, 70vw"
          alt={name}
          className="w-[70%] max-w-(--size-banner-media) drop-shadow-media lg:-my-24"
        />
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-h2 text-ink-muted">{name}</h3>
        <p className="max-w-[60ch] text-md text-ink-muted">{t('banner.lead')}</p>
        <p className="text-h2 text-ink-muted">{format.currency(product.price, product.currency)}</p>
        <div className="mt-2">
          <AddToCartButton product={product} variant="label" />
        </div>
      </div>
    </article>
  );
};
