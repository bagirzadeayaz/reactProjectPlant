import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { CartBadge } from '../../../entities/cart';
import { LanguageSwitcher } from '../../../features/language-switcher';
import { CartDrawer } from '../../../features/cart-drawer';
import { cn } from '../../../shared/lib/cn';
import { LOGIN_LINK } from '../../../shared/config/navigation';
import { Container, Icon } from '../../../shared/ui';
import { HeaderSearch } from './header-search';
import { NavLinkList } from './nav-link-list';
import { NavigationPanel } from './navigation-panel';

/**
 * The site header, from node 22:23 — wordmark left, nav centred, actions right.
 *
 * The compact menu opens a modal side panel at every viewport, keeping the
 * page in place and the full navigation within reach.
 */
export const Header = () => {
  const { t } = useTranslation(['common', 'catalog']);
  const { pathname } = useLocation();
  const reducedMotion = useReducedMotion();

  // The menu belongs to the page it was opened on. Deriving that from the
  // pathname closes it on *any* navigation — a link inside it, the logo, the
  // back button — without an effect that fires a second render every time the
  // route changes.
  const [menu, setMenu] = useState({ isOpen: false, pathname });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const isMenuOpen = menu.isOpen && menu.pathname === pathname;

  const setIsMenuOpen = (isOpen: boolean): void => {
    setMenu({ isOpen, pathname });
  };

  return (
    <header className={cn('site-header relative z-40', isSearchOpen && 'site-header--search')}>
      <Container
        as="div"
        className={cn(
          'relative flex min-h-(--size-header) items-center justify-between gap-6 py-6',
          'motion-safe:transition-[padding] motion-safe:duration-300 motion-safe:ease-out',
          isSearchOpen && 'pb-28 sm:pb-6',
        )}
      >
        <Link
          to="/"
          className={cn(
            'brand rounded-icon text-logo font-(--font-weight-wordmark) text-ink-muted transition-colors hover:text-ink',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink',
          )}
        >
          <img src="/images/planto-logo.png" alt="" width={60} height={60} />
          {t('brand')}
        </Link>

        <nav
          aria-label={t('a11y.mainNavigation')}
          className={isSearchOpen ? 'hidden' : 'hidden lg:block'}
        >
          <NavLinkList />
        </nav>

        <div className="header-actions">
          <NavLink
            to={LOGIN_LINK.to}
            className={({ isActive }) =>
              cn(
                'hidden rounded-icon text-lg transition-colors lg:inline-flex',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink',
                isActive ? 'text-ink' : 'text-ink-muted hover:text-ink',
              )
            }
          >
            {t(LOGIN_LINK.labelKey)}
          </NavLink>

          <motion.div
            layout={!reducedMotion}
            transition={{ layout: { duration: 0.38, ease: [0.22, 1, 0.36, 1] } }}
            className="hidden xl:block"
          >
            <LanguageSwitcher />
          </motion.div>

          <HeaderSearch
            isSearchOpen={isSearchOpen}
            onOpenChange={(open) => {
              setIsMenuOpen(false);
              setIsSearchOpen(open);
            }}
          />
          <CartBadge
            onClick={() => {
              setIsCartOpen(true);
            }}
          />

          <button
            type="button"
            aria-expanded={isMenuOpen}
            aria-controls={isMenuOpen ? 'header-menu' : undefined}
            aria-haspopup="dialog"
            onClick={() => {
              setIsMenuOpen(!isMenuOpen);
              setIsSearchOpen(false);
            }}
            className="rounded-icon p-2 text-ink-muted hover:text-ink"
          >
            <Icon name="hamburger" label={t('a11y.openMenu')} />
          </button>
        </div>
      </Container>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => {
          setIsCartOpen(false);
        }}
      />

      <NavigationPanel
        isOpen={isMenuOpen}
        onClose={() => {
          setIsMenuOpen(false);
        }}
      />
    </header>
  );
};
