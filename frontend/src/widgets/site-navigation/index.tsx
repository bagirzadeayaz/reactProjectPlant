import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import type { ParseKeys } from 'i18next';
import { Home, Leaf, Compass, ShoppingBag, ChevronRight } from 'lucide-react';
import { cartSelectors, type CartState } from '../../entities/cart';
import { Container } from '../../shared/ui';
import { isShopPath, isExplorePath } from '../../shared/config/navigation';

export const MobileNavigation = () => {
  const { t } = useTranslation();
  const { pathname, hash } = useLocation();
  const count = useSelector((state: { cart: CartState }) => cartSelectors.selectCount(state));
  if (pathname.startsWith('/checkout') || pathname.startsWith('/admin')) return null;
  const explore = isExplorePath(pathname, hash);
  const links = [
    { to: '/', label: 'nav.home', icon: Home, active: pathname === '/' && !explore },
    { to: '/catalog', label: 'nav.shopShort', icon: Leaf, active: isShopPath(pathname) },
    { to: '/discover', label: 'nav.discover', icon: Compass, active: explore },
    { to: '/cart', label: 'checkout.basket', icon: ShoppingBag, active: pathname === '/cart' },
  ] as const;
  return (
    <nav className="mobile-navigation" aria-label={t('a11y.mainNavigation')}>
      {links.map(({ to, label, icon: ItemIcon, active }) => (
        <Link
          key={to}
          to={to}
          aria-current={active ? 'page' : false}
          className={active ? 'is-current' : ''}
        >
          <span className="mobile-navigation__icon">
            <ItemIcon size={22} aria-hidden="true" />
            {to === '/cart' && count > 0 && <b>{count}</b>}
          </span>
          <span>{t(label)}</span>
        </Link>
      ))}
    </nav>
  );
};

interface Trail { parent?: string; parentKey?: ParseKeys; label: ParseKeys }
const trails: Record<string, Trail> = {
  '/catalog': { label: 'nav.catalog' },
  '/discover': { label: 'nav.discover' },
  '/finder': { parent: '/catalog', parentKey: 'nav.catalog', label: 'nav.finder' },
  '/wishlist': { parent: '/catalog', parentKey: 'nav.catalog', label: 'nav.wishlist' },
  '/compare': { parent: '/catalog', parentKey: 'nav.catalog', label: 'nav.compare' },
  '/studio': { parent: '/discover', parentKey: 'nav.discover', label: 'nav.studio' },
  '/care': { label: 'nav.plantCare' },
  '/contact': { label: 'nav.contact' },
  '/cart': { parent: '/catalog', parentKey: 'nav.catalog', label: 'checkout.basket' },
  '/tracking': { label: 'nav.tracking' },
};
export const PageTrail = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { pathname } = location;
  const state: unknown = location.state;
  const returnTo =
    typeof state === 'object' &&
    state !== null &&
    'catalogReturnTo' in state &&
    typeof state.catalogReturnTo === 'string' &&
    /^\/catalog(?:\?|$)/.test(state.catalogReturnTo)
      ? state.catalogReturnTo
      : '/catalog';
  const trail: Trail | undefined =
    trails[pathname] ??
    (pathname.startsWith('/catalog/')
      ? { parent: '/catalog', parentKey: 'nav.catalog', label: 'pages.product' }
      : undefined);
  if (!trail) return null;
  return (
    <Container className="page-trail">
      <nav aria-label={t('a11y.breadcrumb')}>
        <ol>
          <li>
            <Link to="/">{t('nav.home')}</Link>
          </li>
          {trail.parent && trail.parentKey && (
            <li>
              <ChevronRight size={13} aria-hidden="true" />
              <Link to={trail.parent === '/catalog' ? returnTo : trail.parent}>
                {t(trail.parentKey)}
              </Link>
            </li>
          )}
          <li>
            <ChevronRight size={13} aria-hidden="true" />
            <span aria-current="page">{t(trail.label)}</span>
          </li>
        </ol>
      </nav>
    </Container>
  );
};
