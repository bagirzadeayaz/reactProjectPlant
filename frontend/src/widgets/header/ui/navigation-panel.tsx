import { Link, NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { companionActions } from '../../../entities/companion';
import { ArrowRight, Columns3, Heart, LogIn } from 'lucide-react';
import { selectGarden } from '../../../entities/garden';
import { LanguageSwitcher } from '../../../features/language-switcher';
import { Modal } from '../../../shared/ui';
import { EXPERIENCE_LINKS, HELP_LINKS, LOGIN_LINK } from '../../../shared/config/navigation';

export const NavigationPanel = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const { saved, compare } = useSelector(selectGarden);
  const { pathname, hash } = useLocation();
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
        <Link to="/catalog" onClick={onClose} className="navigation-shop">
          {t('nav.allPlants')}
          <ArrowRight size={20} aria-hidden="true" />
        </Link>
        <Link to="/finder" onClick={onClose} className="navigation-finder">
          {t('nav.finderPrompt')}
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
        <div className="navigation-collections">
          <NavLink to="/wishlist" onClick={onClose}>
            <Heart size={18} aria-hidden="true" />
            {t('nav.wishlist')}
            <span>{saved.length}</span>
          </NavLink>
          <NavLink to="/compare" onClick={onClose}>
            <Columns3 size={18} aria-hidden="true" />
            {t('nav.compare')}
            <span>{compare.length}</span>
          </NavLink>
        </div>
        <div className="navigation-panel__group">
          <p className="navigation-panel__label">{t('nav.discover')}</p>
          <ul>
            {EXPERIENCE_LINKS.map(({ to, labelKey }) => (
              <li key={to}>
                <Link
                  to={to}
                  aria-current={pathname + hash === to ? 'page' : undefined}
                  onClick={onClose}
                  className="navigation-panel__link"
                >
                  <span>{t(labelKey)}</span>
                </Link>
              </li>
            ))}
            <li>
              <a
                href={`/promo.html?lang=${i18n.resolvedLanguage === 'ru' ? 'ru' : 'en'}`}
                className="navigation-panel__link"
              >
                <span>{t('nav.film')}</span>
              </a>
            </li>
            {!/^\/(admin|checkout|cart)(\/|$)/.test(pathname) && (
              <li>
                <button
                  className="navigation-panel__link"
                  onClick={() => {
                    onClose();
                    dispatch(companionActions.opened());
                  }}
                >
                  {t('companion.menu')}
                </button>
              </li>
            )}
          </ul>
        </div>
        <div className="navigation-panel__group">
          <p className="navigation-panel__label">{t('nav.help')}</p>
          <ul>
            {HELP_LINKS.map(({ to, labelKey }) => (
              <li key={to}>
                <NavLink to={to} onClick={onClose} className="navigation-panel__link">
                  <span>{t(labelKey)}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </Modal>
  );
};
