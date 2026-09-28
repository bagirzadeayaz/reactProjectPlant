import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Home,
  Leaf,
  Sprout,
  Mail,
  Compass,
  Heart,
  Columns3,
  Armchair,
  Package,
  LogIn,
  ArrowUpRight,
} from 'lucide-react';
import { LanguageSwitcher } from '../../../features/language-switcher';
import { Modal } from '../../../shared/ui';
import { LOGIN_LINK } from '../../../shared/config/navigation';

const groups = [
  {
    label: 'common:nav.shopAndCare',
    links: [
      { to: '/', label: 'common:nav.home', icon: Home },
      { to: '/catalog', label: 'common:nav.catalog', icon: Leaf },
      { to: '/care', label: 'common:nav.plantCare', icon: Sprout },
      { to: '/contact', label: 'common:nav.contact', icon: Mail },
    ],
  },
  {
    label: 'common:actions.explore',
    links: [
      { to: '/discover', label: 'common:nav.discover', icon: Compass },
      { to: '/finder', label: 'garden:finder', icon: Sprout },
      { to: '/wishlist', label: 'common:nav.wishlist', icon: Heart },
      { to: '/compare', label: 'common:nav.compare', icon: Columns3 },
      { to: '/studio', label: 'garden:studio', icon: Armchair },
      { to: '/tracking', label: 'garden:tracking', icon: Package },
    ],
  },
] as const;

export const NavigationPanel = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { t } = useTranslation(['common', 'garden']);
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('a11y.menuNavigation')}
      closeLabel={t('a11y.closeMenu')}
      className="navigation-panel"
      footer={
        <div className="navigation-panel__footer">
          <NavLink to={LOGIN_LINK.to} onClick={onClose} className="navigation-panel__account">
            <LogIn size={19} aria-hidden="true" />
            {t(LOGIN_LINK.labelKey)}
          </NavLink>
          <LanguageSwitcher />
        </div>
      }
    >
      <nav id="header-menu" aria-label={t('a11y.menuNavigation')}>
        {groups.map((group) => (
          <div className="navigation-panel__group" key={group.label}>
            <p className="navigation-panel__label">{t(group.label)}</p>
            <ul>
              {group.links.map(({ to, label, icon: ItemIcon }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={to === '/'}
                    onClick={onClose}
                    className="navigation-panel__link"
                  >
                    <ItemIcon size={21} aria-hidden="true" />
                    <span>{t(label)}</span>
                    <ArrowUpRight
                      size={17}
                      aria-hidden="true"
                      className="navigation-panel__arrow"
                    />
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </Modal>
  );
};
