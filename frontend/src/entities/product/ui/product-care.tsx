import { Droplets, Leaf, PawPrint, Ruler, Sparkles, Sun, Waves } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { PlantCare } from '../model/schema';

export const ProductCare = ({ care, compact = false }: { care: PlantCare; compact?: boolean }) => {
  const { t } = useTranslation('product');
  const fields = [
    { key: 'light', icon: Sun, label: t('care.light.label'), value: t(`care.light.${care.light}`) },
    { key: 'watering', icon: Droplets, label: t('care.watering.label'), value: t(`care.watering.${care.watering}`) },
    { key: 'size', icon: Ruler, label: t('care.size.label'), value: t(`care.size.${care.size}`) },
    { key: 'effort', icon: Leaf, label: t('care.effort.label'), value: t(`care.effort.${care.effort}`) },
    { key: 'humidity', icon: Waves, label: t('care.humidity.label'), value: t(`care.humidity.${care.humidity}`) },
    { key: 'pets', icon: PawPrint, label: t('care.pets.label'), value: t(`care.pets.${care.pets}`) },
  ];
  return (
    <section className={`product-care${compact ? ' product-care--compact' : ''}`} aria-label={t('care.title')}>
      <div className="product-care__heading">
        <div>
          <h2>{t('care.title')}</h2>
          {!compact && <p>{t('care.intro')}</p>}
        </div>
        {!compact && <Sparkles className="product-care__mark" size={30} strokeWidth={1.3} aria-hidden="true" />}
      </div>
      <dl className="product-care__grid">
        {fields.map(({ key, icon: Icon, label, value }) => (
          <div className="product-care__item" key={key}>
            <dt>
              <Icon size={19} strokeWidth={1.7} aria-hidden="true" />
              <span>{label}</span>
            </dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      {!compact && <p className="product-care__note">{t('care.note')}</p>}
    </section>
  );
};
