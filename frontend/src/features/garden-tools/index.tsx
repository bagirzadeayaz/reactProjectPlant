import { Heart, Columns3, ArrowRight } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { gardenActions, selectGarden } from '../../entities/garden';
import { useLocale } from '../../shared/i18n';
import type { Product } from '../../entities/product';
import { useToast } from '../../shared/ui';

export const ProductTools = ({ product }: { product: Product }) => {
  const { t } = useTranslation('garden');
  const { localized } = useLocale();
  const dispatch = useDispatch();
  const garden = useSelector(selectGarden);
  const navigate = useNavigate();
  const toast = useToast();
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
            disabled={list === 'saved' && full}
            className={list === 'compare' ? 'product-compare-button' : undefined}
            title={full ? t(list === 'compare' ? 'limit' : 'savedFull') : undefined}
            aria-label={t(
              list === 'saved'
                ? active
                  ? 'unsave'
                  : 'save'
                : active
                  ? 'removeCompare'
                  : full
                    ? 'comparison.editSelection'
                    : 'addCompare',
              { name },
            )}
            onClick={() => {
              if (list === 'compare' && full) {
                void navigate('/compare');
                return;
              }
              dispatch(gardenActions.toggled({ list, id: product.id }));
              if (list === 'compare')
                toast.show({
                  message: t(active ? 'comparison.removed' : 'comparison.added', { name }),
                  tone: 'success',
                });
            }}
          >
            <Icon
              aria-hidden="true"
              size={20}
              fill={list === 'saved' && active ? 'currentColor' : 'none'}
            />
            {list === 'compare' && (
              <span>
                {t(
                  active
                    ? 'comparison.selectedShort'
                    : full
                      ? 'comparison.editSelection'
                      : 'comparison.short',
                )}
              </span>
            )}
          </button>
        );
      })}
      {garden.compare.includes(product.id) && (
        <Link className="product-compare-link" to="/compare">
          {t('viewCompare')}
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      )}
    </div>
  );
};
export const ShoppingLinks = () => {
  const { t } = useTranslation('garden');
  const garden = useSelector(selectGarden);
  return (
    <nav className="shopping-links" aria-label={t('shoppingTools')}>
      <NavLink to="/wishlist">
        <Heart size={17} aria-hidden="true" />
        {t('wishlist')}
        <span>{garden.saved.length}</span>
      </NavLink>
      <NavLink to="/compare">
        <Columns3 size={17} aria-hidden="true" />
        {t('comparison.short')}
        <span>{garden.compare.length}</span>
      </NavLink>
    </nav>
  );
};
