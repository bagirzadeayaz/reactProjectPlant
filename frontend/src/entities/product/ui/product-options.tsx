import { Check, Ruler } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ProductVariant } from '../../../shared/commerce';
import { PLANT_SIZES, POT_STYLES } from '../../../shared/commerce';
import { useFormatters, useLocale } from '../../../shared/i18n';

export const ProductOptions = ({
  variants,
  selected,
  onChange,
}: {
  variants: ProductVariant[];
  selected: ProductVariant;
  onChange: (variant: ProductVariant) => void;
}) => {
  const { t } = useTranslation('product');
  const { locale } = useLocale();
  const format = useFormatters(locale);
  return (
    <div className="product-options">
      <fieldset>
        <legend>
          {t('options.size')} <span>{t('options.height', { height: selected.heightCm })}</span>
        </legend>
        <div className="product-options__sizes">
          {PLANT_SIZES.filter((size) => variants.some((variant) => variant.size === size)).map(
            (size) => {
              const match =
                variants.find((variant) => variant.size === size && variant.pot === selected.pot) ??
                variants.find((variant) => variant.size === size && variant.stock > 0) ??
                variants.find((variant) => variant.size === size);
              if (!match) return null;
              return (
                <button
                  key={size}
                  type="button"
                  aria-pressed={selected.size === size}
                  onClick={() => {
                    onChange(match);
                  }}
                >
                  <Ruler size={16} aria-hidden="true" />
                  <span>
                    {t(`options.sizes.${size}`)}
                    <small>{t('options.height', { height: match.heightCm })}</small>
                  </span>
                  {selected.size === size && <Check size={16} aria-hidden="true" />}
                </button>
              );
            },
          )}
        </div>
      </fieldset>
      <fieldset>
        <legend>
          {t('options.pot')} <span>{t(`options.pots.${selected.pot}`)}</span>
        </legend>
        <div className="product-options__pots">
          {POT_STYLES.map((pot) => {
            const match = variants.find(
              (variant) => variant.size === selected.size && variant.pot === pot,
            );
            if (!match) return null;
            return (
              <button
                key={pot}
                type="button"
                aria-pressed={selected.pot === pot}
                onClick={() => {
                  onChange(match);
                }}
              >
                <span className="product-options__swatch" data-pot={pot} aria-hidden="true" />
                <span>
                  {t(`options.pots.${pot}`)}
                  <small>
                    {match.stock > 0 ? format.currency(match.price, 'AZN') : t('outOfStock')}
                  </small>
                </span>
                {selected.pot === pot && <Check size={16} aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      </fieldset>
      <p className="product-options__note">{t('options.note')}</p>
    </div>
  );
};
