import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { CartBadge } from '../../../entities/cart';
import { LanguageSwitcher } from '../../../features/language-switcher';
import { CartDrawer } from '../../../features/cart-drawer';
import { cn } from '../../../shared/lib/cn';
import { Container, Icon } from '../../../shared/ui';
import { HeaderSearch } from './header-search';
import { NavLinkList } from './nav-link-list';

/**
 * The site header, from node 22:23 — wordmark left, nav centred, actions right.
 *
 * The comp has no mobile design, so below `lg` the nav collapses behind a
 * hamburger. The panel is a disclosure, not a dialog: it does not trap focus,
 * because it sits in the document flow directly after its button and pushes the
 * page down rather than covering it.
 */
export const Header = () => {
  const { t } = useTranslation(['common', 'catalog']);
  const { pathname } = useLocation();
  const reducedMotion = useReducedMotion();
  const toggleRef = useRef<HTMLButtonElement>(null);

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

  useEffect(() => {
    if (!isMenuOpen) return;
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape') return;
      // Escape returns focus to the control that opened the panel, so the
      // keyboard user is not dropped back at the top of the document.
      setMenu({ isOpen: false, pathname });
      toggleRef.current?.focus();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isMenuOpen, pathname]);

  return (
    <header className="relative z-40 border-b border-border-glass/40">
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
            'rounded-icon text-logo font-(--font-weight-wordmark) text-ink-muted transition-colors hover:text-ink',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink',
          )}
        >
          {t('brand')}
        </Link>

        <nav
          aria-label={t('a11y.mainNavigation')}
          className={isSearchOpen ? 'hidden' : 'hidden lg:block'}
        >
          <NavLinkList />
        </nav>

        <div className="flex items-center gap-4">
          <motion.div
            layout={!reducedMotion}
            transition={{ layout: { duration: 0.38, ease: [0.22, 1, 0.36, 1] } }}
            className="hidden sm:block"
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
            ref={toggleRef}
            type="button"
            aria-expanded={isMenuOpen}
            aria-controls="header-menu"
            onClick={() => {
              setIsMenuOpen(!isMenuOpen);
            }}
            className="rounded-icon p-1 text-ink-muted hover:text-ink lg:hidden"
          >
            <Icon
              name={isMenuOpen ? 'close' : 'hamburger'}
              label={isMenuOpen ? t('a11y.closeMenu') : t('a11y.openMenu')}
            />
          </button>
        </div>
      </Container>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => {
          setIsCartOpen(false);
        }}
      />

      <div id="header-menu" hidden={!isMenuOpen} className="lg:hidden">
        <Container as="div" className="pb-8">
          <nav aria-label={t('a11y.menuNavigation')}>
            <NavLinkList
              orientation="vertical"
              onNavigate={() => {
                setIsMenuOpen(false);
              }}
            />
          </nav>
          <LanguageSwitcher className="mt-6 sm:hidden" />
        </Container>
      </div>
    </header>
  );
};
