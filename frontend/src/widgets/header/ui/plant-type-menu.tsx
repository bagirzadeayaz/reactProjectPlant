import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGetCategoriesQuery } from '../../../entities/category';
import { useLocale } from '../../../shared/i18n';
import { isShopPath } from '../../../shared/config/navigation';
import { NavigationDropdown } from './navigation-dropdown';

export const PlantTypeMenu = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { t } = useTranslation(['common', 'catalog']);
  const { localized } = useLocale();
  const { data: categories = [] } = useGetCategoriesQuery(undefined);
  const { pathname } = useLocation();
  return (
    <NavigationDropdown
      label={t('common:nav.catalog')}
      active={isShopPath(pathname)}
      open={open}
      onOpenChange={onOpenChange}
    >
      <Link to="/catalog" className="navigation-dropdown__featured">
        {t('common:nav.allPlants')}
      </Link>
      {categories.map((category) => (
        <Link key={category.id} to={`/catalog?category=${encodeURIComponent(category.slug)}`}>
          {localized(category.label)}
        </Link>
      ))}
      <div className="navigation-dropdown__divider" />
      <Link to="/finder">
        <span>{t('common:nav.finder')}</span>
        <small>{t('common:nav.finderHint')}</small>
      </Link>
    </NavigationDropdown>
  );
};
