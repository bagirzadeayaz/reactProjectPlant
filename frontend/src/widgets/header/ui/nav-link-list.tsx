import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { PlantTypeMenu } from './plant-type-menu';
import { NavigationDropdown } from './navigation-dropdown';
import { EXPERIENCE_LINKS, isExplorePath } from '../../../shared/config/navigation';

export const NavLinkList = () => {
  const { t, i18n } = useTranslation();
  const { pathname, hash, key } = useLocation();
  const [menu, setMenu] = useState<{ id: 'shop' | 'explore'; key: string } | null>(null);
  const setOpen = (id: 'shop' | 'explore', open: boolean) => {
    // A delayed close from the previous menu must not close its replacement.
    setMenu((current) => (open ? { id, key } : current?.id === id ? null : current));
  };
  return (
    <ul className="primary-navigation">
      <li>
        <PlantTypeMenu
          open={menu?.id === 'shop' && menu.key === key}
          onOpenChange={(open) => {
            setOpen('shop', open);
          }}
        />
      </li>
      <li>
        <NavigationDropdown
          label={t('nav.discover')}
          active={isExplorePath(pathname, hash)}
          open={menu?.id === 'explore' && menu.key === key}
          onOpenChange={(open) => {
            setOpen('explore', open);
          }}
        >
          {EXPERIENCE_LINKS.map((link) => (
            <Link key={link.to} to={link.to}>
              <span>{t(link.labelKey)}</span>
              <small>{t(link.descriptionKey)}</small>
            </Link>
          ))}
          <a href={`/promo.html?lang=${i18n.resolvedLanguage === 'ru' ? 'ru' : 'en'}`}>
            <span>{t('nav.film')}</span>
            <small>{t('nav.filmHint')}</small>
          </a>
        </NavigationDropdown>
      </li>
      <li>
        <NavLink className="site-nav-link" to="/care">
          {t('nav.plantCare')}
        </NavLink>
      </li>
      <li>
        <NavLink className="site-nav-link" to="/contact">
          {t('nav.contact')}
        </NavLink>
      </li>
    </ul>
  );
};
