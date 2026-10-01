import { useState } from 'react';
import { ImageIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ProductCare, ProductOptions, DeliveryInfo } from '../../../entities/product';
import type { DeliveryArea } from '../../../shared/commerce';
import { useFormatters, useLocale } from '../../../shared/i18n';
import type { ProductFormValues } from '../lib/form-values';

export const ProductPreview = ({ values }: { values: ProductFormValues }) => {
  const { t } = useTranslation('admin');
  const { locale, localized } = useLocale();
  const format = useFormatters(locale);
  const [selectedImage, setSelectedImage] = useState(0);
  const [variantId, setVariantId] = useState('');
  const [area, setArea] = useState<DeliveryArea>('baku');
  const selected =
    values.variants?.find((variant) => variant.id === variantId) ?? values.variants?.[0];
  const price = selected?.price ?? values.price;
  const available = values.inStock && (!selected || selected.stock > 0);
  const images = [
    ...new Set([selected?.imageUrl ?? values.imageUrl, ...(values.gallery ?? [])].filter(Boolean)),
  ];
  const activeImage = images[selectedImage] ?? images[0];
  const name = localized(values.name) || t('image.noPreview');

  return (
    <div className="admin-product-preview">
      <div className="admin-product-preview__visual">
        <div className="admin-product-preview__image">
          {activeImage ? (
            <img src={activeImage} alt={name} />
          ) : (
            <div className="admin-product-preview__empty">
              <ImageIcon size={42} strokeWidth={1.2} aria-hidden="true" />
              <span>{t('image.noPreview')}</span>
            </div>
          )}
        </div>
        {images.length > 1 && (
          <div className="admin-product-preview__gallery" aria-label={t('inventory.gallery')}>
            {images.map((src, index) => (
              <button
                key={`${src}-${String(index)}`}
                type="button"
                aria-label={t('inventory.galleryImage', { number: index + 1 })}
                aria-pressed={selectedImage === index}
                onClick={() => {
                  setSelectedImage(index);
                }}
              >
                <img src={src} alt="" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="admin-product-preview__content">
        <p className="admin-product-preview__hint">{t('inventory.previewHint')}</p>
        <h3>{name}</h3>
        <p className="admin-product-preview__price">
          {format.currency(Number.isFinite(price) ? price : 0, values.currency)}
        </p>
        <p className="admin-product-preview__availability" data-available={available}>
          <span aria-hidden="true" />
          {t(available ? 'table.inStock' : 'table.outOfStock')}
        </p>
        {selected && values.variants && (
          <ProductOptions
            variants={values.variants}
            selected={selected}
            onChange={(variant) => {
              setVariantId(variant.id);
              setSelectedImage(0);
            }}
          />
        )}
        {localized(values.description) && (
          <div className="admin-product-preview__description">
            <h4>{t('fields.description')}</h4>
            <p>{localized(values.description)}</p>
          </div>
        )}
        <ProductCare care={values.care} compact />
        <DeliveryInfo
          {...(values.delivery ? { delivery: values.delivery } : {})}
          area={area}
          onAreaChange={setArea}
          subtotal={Number.isFinite(price) ? price : 0}
        />
      </div>
    </div>
  );
};
