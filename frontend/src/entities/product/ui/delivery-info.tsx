import { PackageCheck, Truck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  DEFAULT_DELIVERY,
  DELIVERY_AREAS,
  FREE_DELIVERY_FROM,
  deliveryDate,
  deliveryQuote,
  type DeliveryArea,
  type ProductDelivery,
} from '../../../shared/commerce';
import { useFormatters, useLocale } from '../../../shared/i18n';
import { Select } from '../../../shared/ui';

export const DeliveryInfo = ({
  delivery = DEFAULT_DELIVERY,
  area,
  onAreaChange,
  subtotal,
}: {
  delivery?: ProductDelivery;
  area: DeliveryArea;
  onAreaChange: (area: DeliveryArea) => void;
  subtotal: number;
}) => {
  const { t } = useTranslation('product');
  const { locale } = useLocale();
  const format = useFormatters(locale);
  const quote = deliveryQuote(area, subtotal, delivery.dispatchDays);
  const date = new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' });
  const available = delivery.areas.includes(area);
  return (
    <section className="product-delivery" aria-label={t('delivery.title')}>
      <div className="product-delivery__heading">
        <Truck size={22} aria-hidden="true" />
        <h2>{t('delivery.title')}</h2>
        <span>{t('delivery.careful')}</span>
      </div>
      <Select
        label={t('delivery.area')}
        value={area}
        options={DELIVERY_AREAS.map((value) => ({ value, label: t(`delivery.areas.${value}`) }))}
        onChange={(event) => {
          const next = DELIVERY_AREAS.find((value) => value === event.target.value);
          if (next) onAreaChange(next);
        }}
      />
      <div className="product-delivery__quote" aria-live="polite">
        {available ? (
          <>
            <div>
              <span>{t('delivery.arrives')}</span>
              <strong>
                {date.format(deliveryDate(quote.minDays))} –{' '}
                {date.format(deliveryDate(quote.maxDays))}
              </strong>
              <small>{t('delivery.estimate')}</small>
            </div>
            <div>
              <span>{t('delivery.fee')}</span>
              <strong>
                {quote.fee === 0 ? t('delivery.free') : format.currency(quote.fee, 'AZN')}
              </strong>
              <small>
                {t('delivery.freeFrom', { amount: format.currency(FREE_DELIVERY_FROM, 'AZN') })}
              </small>
            </div>
          </>
        ) : (
          <p>{t('delivery.notAvailable')}</p>
        )}
      </div>
      <p className="product-delivery__foot">
        <PackageCheck size={17} aria-hidden="true" />
        {t('delivery.pickup')}
      </p>
    </section>
  );
};
