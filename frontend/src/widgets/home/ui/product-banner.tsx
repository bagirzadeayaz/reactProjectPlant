import { useTranslation } from 'react-i18next';
import { AddToCartButton } from '../../../features/add-to-cart';
import { PRODUCT_IMAGE_SIZE, productImageSources, type Product } from '../../../entities/product';
import { useFormatters, useLocale } from '../../../shared/i18n';
import { cn } from '../../../shared/lib/cn';
import { ResponsiveImage } from '../../../shared/ui';

export interface ProductBannerProps {
  product: Product;
  align?: 'left' | 'right';
  artwork?: string;
}
export const ProductBanner = ({ product, align = 'left', artwork }: ProductBannerProps) => {
  const { t } = useTranslation('home');
  const { locale, localized } = useLocale();
  const format = useFormatters(locale);
  return (
    <article
      className={cn('product-banner glass-surface', align === 'right' && 'product-banner--reverse')}
    >
      <div className="product-banner__image">
        <ResponsiveImage
          src={artwork ?? product.imageUrl}
          sources={productImageSources({ imageUrl: artwork ?? product.imageUrl })}
          width={PRODUCT_IMAGE_SIZE}
          height={PRODUCT_IMAGE_SIZE}
          sizes="(min-width: 1728px) 601px, (min-width: 900px) 35vw, 80vw"
          alt={artwork ? '' : localized(product.name)}
        />
      </div>
      <div className="product-banner__copy">
        <h3>{t('banner.title')}</h3>
        <p className="text-md text-ink-muted">{t('banner.lead')}</p>
        <p className="text-h2 text-ink-muted">{format.currency(product.price, product.currency)}</p>
        <div className="flex items-center gap-6">
          <AddToCartButton product={product} variant="label" />
          <AddToCartButton product={product} />
        </div>
      </div>
    </article>
  );
};
