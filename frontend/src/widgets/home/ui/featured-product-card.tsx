import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { AddToCartButton } from '../../../features/add-to-cart';
import { PRODUCT_IMAGE_SIZE, productImageSources, type Product } from '../../../entities/product';
import { useLocale } from '../../../shared/i18n';
import { Icon, ResponsiveImage } from '../../../shared/ui';

export interface FeaturedProductCardProps {
  product: Product;
  onNext?: () => void;
  index?: number;
  count?: number;
  onSelect?: (index: number) => void;
}
export const FeaturedProductCard = ({
  product,
  onNext,
  index = 0,
  count = 1,
  onSelect,
}: FeaturedProductCardProps) => {
  const { t } = useTranslation('home');
  const { localized } = useLocale();
  const reducedMotion = useReducedMotion();
  const name = localized(product.name);
  return (
    <article className="featured-plant glass-surface">
      <motion.div
        key={product.id}
        initial={reducedMotion ? false : { opacity: 0, x: 22 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.55 }}
        className="featured-plant__image"
      >
        <ResponsiveImage
          src={product.imageUrl}
          sources={productImageSources(product)}
          width={PRODUCT_IMAGE_SIZE}
          height={PRODUCT_IMAGE_SIZE}
          sizes="(min-width: 1728px) 459px, (min-width: 900px) 27vw, 320px"
          priority
          alt={name}
          className="plant-float"
        />
      </motion.div>
      <div className="featured-plant__copy">
        <p className="text-md text-ink-muted">{t('featured.eyebrow')}</p>
        <div className="featured-plant__name">
          <h2>
            <Link to={'/catalog/' + product.slug}>{name}</Link>
          </h2>
          {onNext !== undefined && (
            <button
              type="button"
              onClick={onNext}
              aria-label={t('featured.next')}
              className="plant-next"
            >
              <Icon name="chevron-right" />
            </button>
          )}
        </div>
        <AddToCartButton product={product} variant="label" />
        <div className="carousel-dots" aria-label={t('featured.slides')}>
          {Array.from({ length: count }, (_, dot) => (
            <button
              key={dot}
              type="button"
              aria-label={t('featured.goTo', { number: dot + 1 })}
              aria-pressed={dot === index}
              onClick={() => {
                onSelect?.(dot);
              }}
            >
              <span />
            </button>
          ))}
        </div>
      </div>
    </article>
  );
};
