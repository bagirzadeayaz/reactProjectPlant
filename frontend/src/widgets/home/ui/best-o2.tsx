import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PRODUCT_IMAGE_SIZE, productImageSources, type Product } from '../../../entities/product';
import { useLocale } from '../../../shared/i18n';
import { cn } from '../../../shared/lib/cn';
import { Button, Icon, ResponsiveImage } from '../../../shared/ui';

export interface BestO2Props {
  products: readonly Product[];
}

const arrowClass = cn(
  'rounded-icon p-1 text-ink-muted transition-colors hover:text-ink',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink',
  'disabled:cursor-not-allowed disabled:opacity-40',
);

/**
 * Section 7 — node 22:194 (1600 × 755 banner), the 1036px plant (22:195)
 * overflowing its left edge, copy at x = 877 (22:196 / 22:197 / 22:198), an
 * Explore button (22:199) and the "01/04" pager (22:202 / 22:203 / 22:204).
 *
 * The pager is real: it steps through the products passed in. The number is a
 * live region so a screen reader hears "2 of 4" when it changes.
 *
 * Reflow: plant left, copy right from lg; stacked below, with the plant
 * capped at 70vw so it never forces horizontal scroll at 320px.
 */
export const BestO2 = ({ products }: BestO2Props) => {
  const { t } = useTranslation(['home', 'common']);
  const { localized } = useLocale();
  const [index, setIndex] = useState(0);
  const product = products[index];
  const total = products.length;

  if (!product) return null;

  return (
    <div
      role="region"
      aria-label={t('home:bestO2.carouselLabel')}
      className={cn(
        'best-o2 grid items-center border-(length:--border-width-control) border-border-glass',
        'bg-surface-glass backdrop-blur-panel',
      )}
    >
      <div key={product.id} className="best-o2__image page-enter">
        <ResponsiveImage
          src={product.imageUrl}
          sources={productImageSources(product)}
          width={PRODUCT_IMAGE_SIZE}
          height={PRODUCT_IMAGE_SIZE}
          sizes="(min-width: 1024px) 700px, 70vw"
          alt={localized(product.name)}
          className="mx-auto object-contain drop-shadow-media"
        />
      </div>

      <div className="best-o2__copy flex flex-col">
        <h3 className="text-h2 font-(--font-weight-heading) text-ink-muted sm:text-h1">
          {t('home:bestO2.title')}
        </h3>
        <p className="text-md text-ink-muted">{t('home:bestO2.body')}</p>
        <p className="text-md text-ink-muted">{localized(product.description)}</p>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-6">
          <Button as="a" href={`/catalog/${product.slug}`}>
            {t('common:actions.explore')}
          </Button>

          <div className="flex items-center gap-4 text-lg text-ink-muted">
            <button
              type="button"
              onClick={() => {
                setIndex((current) => Math.max(0, current - 1));
              }}
              disabled={index === 0}
              aria-label={t('home:bestO2.prev')}
              className={arrowClass}
            >
              <Icon name="arrow-left" />
            </button>
            <span aria-live="polite" aria-atomic="true" className="tabular-nums">
              {t('home:bestO2.pageOf', {
                current: String(index + 1).padStart(2, '0'),
                total: String(total).padStart(2, '0'),
              })}
            </span>
            <button
              type="button"
              onClick={() => {
                setIndex((current) => Math.min(total - 1, current + 1));
              }}
              disabled={index === total - 1}
              aria-label={t('home:bestO2.next')}
              className={arrowClass}
            >
              <Icon name="arrow-right" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
