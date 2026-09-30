import { useState } from 'react';
import { ImageIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ProductCare } from '../../../entities/product';
import { useFormatters, useLocale } from '../../../shared/i18n';
import type { ProductFormValues } from '../lib/form-values';

export const ProductPreview = ({ values }: { values: ProductFormValues }) => {
  const { t } = useTranslation('admin');
  const { locale, localized } = useLocale();
  const format = useFormatters(locale);
  const [selectedImage, setSelectedImage] = useState(0);
  const images = [values.imageUrl, ...(values.gallery ?? [])].filter(Boolean);
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
          {format.currency(Number.isFinite(values.price) ? values.price : 0, values.currency)}
        </p>
        <p className="admin-product-preview__availability" data-available={values.inStock}>
          <span aria-hidden="true" />
          {t(values.inStock ? 'table.inStock' : 'table.outOfStock')}
        </p>
        {localized(values.description) && (
          <div className="admin-product-preview__description">
            <h4>{t('fields.description')}</h4>
            <p>{localized(values.description)}</p>
          </div>
        )}
        <ProductCare care={values.care} compact />
      </div>
    </div>
  );
};
