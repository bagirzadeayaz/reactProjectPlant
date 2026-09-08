import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useFormatters, useLocale } from '../../../shared/i18n';
import { cn } from '../../../shared/lib/cn';
import { ResponsiveImage } from '../../../shared/ui';
import { PRODUCT_IMAGE_SIZE, productImageSources } from '../lib/product-image';
import type { Product } from '../model/schema';

export interface ProductCardProps {
  product: Product;
  /** The action slot — an add-to-cart button from `features`. Cards know no verbs. */
  action?: ReactNode;
  /** Hero-position cards load eagerly; grid cards wait. */
  priority?: boolean;
  /**
   * Heading level of the name. `h3` under a section heading (home, related
   * products); `h2` when the card sits directly under the page's `h1` (catalog),
   * so the outline never skips a level.
   */
  headingLevel?: 2 | 3;
  className?: string;
}

/**
 * One product in the grid — nodes 22:95 (frame), 22:97 (name), 22:98 (copy),
 * 22:106 (price row). 512 × 644 in the comp with the plant overflowing the
 * top of the frame; here the frame is the frosted panel and the image sits
 * inside it so the card is self-contained at every width.
 *
 * Reflow: the card is fluid; the grid around it decides how many fit.
 */
export const ProductCard = ({
  product,
  action,
  priority = false,
  headingLevel = 3,
  className,
}: ProductCardProps) => {
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  const { t } = useTranslation('product');
  const { locale, localized } = useLocale();
  const format = useFormatters(locale);
  const name = localized(product.name);

  return (
    <article
      className={cn(
        'flex h-(--size-card-h) flex-col rounded-card border-(length:--border-width-panel) border-border-glass',
        'bg-surface-glass p-8 backdrop-blur-panel',
        className,
      )}
    >
      {/* The picture is a second link to the same place; hiding it from the tab
          order and assistive tech keeps one announced link per card. */}
      <Link
        to={`/catalog/${product.slug}`}
        tabIndex={-1}
        aria-hidden="true"
        className="group -mx-4 -mt-16 block"
      >
        <ResponsiveImage
          src={product.imageUrl}
          sources={productImageSources(product)}
          width={PRODUCT_IMAGE_SIZE}
          height={PRODUCT_IMAGE_SIZE}
          sizes="(min-width: 1024px) 512px, (min-width: 640px) 50vw, 100vw"
          priority={priority}
          alt=""
          className="mx-auto w-3/4 drop-shadow-media transition-transform group-hover:-translate-y-1"
        />
      </Link>

      <div className="mt-6 flex flex-1 flex-col gap-3">
        <Heading className="text-h2 text-ink-muted">
          <Link to={`/catalog/${product.slug}`} className="hover:text-ink">
            {name}
          </Link>
        </Heading>
        <p className="line-clamp-2 text-md text-ink-muted">{localized(product.description)}</p>
        {!product.inStock && <p className="text-sm text-ink-muted">{t('outOfStock')}</p>}
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <p className="text-h2 text-ink-muted">{format.currency(product.price, product.currency)}</p>
        {action}
      </div>
    </article>
  );
};
