import { type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { useFormatters, useLocale } from '../../../shared/i18n';
import { cn } from '../../../shared/lib/cn';
import { ResponsiveImage } from '../../../shared/ui';
import { PRODUCT_IMAGE_SIZE, productImageSources } from '../lib/product-image';
import type { Product } from '../model/schema';

export interface ProductCardProps {
  product: Product;
  /** The action slot — an add-to-cart button from `features`. Cards know no verbs. */
  action?: ReactNode;
  tools?: ReactNode;
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
  tools,
  priority = false,
  headingLevel = 3,
  className,
}: ProductCardProps) => {
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  const reducedMotion = useReducedMotion();
  const { t } = useTranslation('product');
  const { locale, localized } = useLocale();
  const format = useFormatters(locale);
  const name = localized(product.name);
  const { pathname, search } = useLocation();
  const returnState = pathname === '/catalog' ? { catalogReturnTo: pathname + search } : undefined;

  return (
    <motion.article
      whileHover={reducedMotion ? {} : { y: -8 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      className={cn(
        'product-card linked-product flex h-full flex-col',
        'backdrop-blur-panel',
        className,
      )}
    >
      <Link
        to={`/catalog/${product.slug}`}
        state={returnState}
        aria-hidden="true"
        tabIndex={-1}
        className="product-card-hitarea"
      />
      {tools && <div className="product-card__tools">{tools}</div>}
      {/* The picture is a second link to the same place; hiding it from the tab
          order and assistive tech keeps one announced link per card. */}
      <Link
        to={`/catalog/${product.slug}`}
        state={returnState}
        tabIndex={-1}
        aria-hidden="true"
        className="product-card__image group"
      >
        <ResponsiveImage
          src={product.imageUrl}
          sources={productImageSources(product)}
          width={PRODUCT_IMAGE_SIZE}
          height={PRODUCT_IMAGE_SIZE}
          sizes="(min-width: 1024px) 512px, (min-width: 640px) 50vw, 100vw"
          priority={priority}
          alt=""
          className="mx-auto object-contain drop-shadow-media"
        />
      </Link>

      <div className="product-card__copy flex flex-1 flex-col gap-3">
        <Heading className="text-h2 text-ink-muted">
          <Link to={`/catalog/${product.slug}`} state={returnState} className="hover:text-ink">
            {name}
          </Link>
        </Heading>
        <p className="product-card__description line-clamp-2 text-md text-ink-muted">
          {localized(product.description)}
        </p>
        <p className="product-card__stock text-sm text-ink-muted" data-available={product.inStock}>
          {t(product.inStock ? 'inStock' : 'outOfStock')}
        </p>
      </div>

      <div className="product-card__price flex items-center justify-between gap-4">
        <p className="text-h2 text-ink-muted">{format.currency(product.price, product.currency)}</p>
        {action}
      </div>
    </motion.article>
  );
};
