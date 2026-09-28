import { Heart, Columns3 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { gardenActions, selectGarden } from '../../entities/garden';
import { useLocale } from '../../shared/i18n';
import type { Product } from '../../entities/product';

export const ProductTools = ({ product }: { product: Product }) => {
  const { t } = useTranslation('garden');
  const { localized } = useLocale();
  const dispatch = useDispatch();
  const garden = useSelector(selectGarden);
  const name = localized(product.name);
  return (
    <div className="product-tools">
      {(['saved', 'compare'] as const).map((list) => {
        const active = garden[list].includes(product.id);
        const full = !active && garden[list].length >= (list === 'compare' ? 3 : 100);
        const Icon = list === 'saved' ? Heart : Columns3;
        return (
          <button
            key={list}
            type="button"
            aria-pressed={active}
            disabled={full}
            title={full ? t(list === 'compare' ? 'limit' : 'savedFull') : undefined}
            aria-label={t(
              list === 'saved'
                ? active
                  ? 'unsave'
                  : 'save'
                : active
                  ? 'removeCompare'
                  : 'addCompare',
              { name },
            )}
            onClick={() => {
              dispatch(gardenActions.toggled({ list, id: product.id }));
            }}
          >
            <Icon
              aria-hidden="true"
              size={20}
              fill={list === 'saved' && active ? 'currentColor' : 'none'}
            />
          </button>
        );
      })}
    </div>
  );
};
export const GardenNav = () => {
  const { t } = useTranslation('garden');
  const garden = useSelector(selectGarden);
  return (
    <nav className="garden-nav" aria-label={t('nav')}>
      <Link to="/discover">{t('nav')}</Link>
      <Link to="/finder">{t('finder')}</Link>
      <Link to="/wishlist">
        {t('wishlist')} <span>{garden.saved.length}</span>
      </Link>
      <Link to="/compare">
        {t('compare')} <span>{garden.compare.length}/3</span>
      </Link>
      <Link to="/studio">{t('studio')}</Link>
    </nav>
  );
};
