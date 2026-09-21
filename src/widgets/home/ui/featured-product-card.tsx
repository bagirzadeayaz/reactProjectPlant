import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { AddToCartButton } from '../../../features/add-to-cart';
import { PRODUCT_IMAGE_SIZE, productImageSources, type Product } from '../../../entities/product';
import { useLocale } from '../../../shared/i18n';
import { Icon, ResponsiveImage } from '../../../shared/ui';

export interface FeaturedProductCardProps {
  product: Product;
  onNext?: () => void;
}

/**
 * Section 2 — node 22:59, the tall card beside the hero copy. In Figma it is
 * wrapped in four single-child groups (22:105 → 22:102 → 22:104 → 22:103);
 * they carry nothing and are flattened here.
 *
 * The plant (459px, node 17:167) overhangs the top of the 512 × 644 panel; the
 * copy and Buy Now sit inside it. Reflow: fluid width, the overhang scales
 * with the card.
 */
export const FeaturedProductCard = ({ product, onNext }: FeaturedProductCardProps) => {
  const { t } = useTranslation('home');
  const { localized } = useLocale();
  const name = localized(product.name);

  return (
    <article className="relative mx-auto mt-8 w-full max-w-md xl:mt-10">
      <ResponsiveImage
        src={product.imageUrl}
        sources={productImageSources(product)}
        width={PRODUCT_IMAGE_SIZE}
        height={PRODUCT_IMAGE_SIZE}
        sizes="(min-width: 1280px) 459px, 80vw"
        priority
        alt={name}
        className="relative z-10 mx-auto -mb-16 h-72 w-[78%] object-contain drop-shadow-media sm:h-80"
      />
      <div className="rounded-card border-(length:--border-width-control) border-border-glass bg-surface-glass px-6 pb-7 pt-24 backdrop-blur-panel sm:px-8 sm:pb-8">
        <p className="text-md text-ink">{t('featured.eyebrow')}</p>
        <h2 className="mt-3 text-h2 text-ink-muted">
          <Link to={`/catalog/${product.slug}`} className="hover:text-ink">
            {name}
          </Link>
        </h2>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <AddToCartButton product={product} variant="label" />
          {onNext !== undefined && (
            <button
              type="button"
              onClick={onNext}
              aria-label={t('featured.next')}
              className="rounded-icon p-2 text-ink-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
            >
              <Icon name="arrow-right" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
};
