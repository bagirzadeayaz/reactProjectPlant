/** One vocabulary and grouping for header, side menu, footer and page trails. */
export const SHOP_LINKS = [
  { to: '/catalog', labelKey: 'nav.catalog' },
  { to: '/finder', labelKey: 'nav.finder' },
  { to: '/wishlist', labelKey: 'nav.wishlist' },
  { to: '/compare', labelKey: 'nav.compare' },
] as const;
export const EXPERIENCE_LINKS = [
  { to: '/discover', labelKey: 'nav.allExperiences', descriptionKey: 'nav.exploreHint' },
  { to: '/#little-world', labelKey: 'nav.world', descriptionKey: 'nav.worldHint' },
  { to: '/studio', labelKey: 'nav.studio', descriptionKey: 'nav.studioHint' },
] as const;
export const HELP_LINKS = [
  { to: '/care', labelKey: 'nav.plantCare' },
  { to: '/contact', labelKey: 'nav.contact' },
  { to: '/tracking', labelKey: 'nav.tracking' },
] as const;
export const LOGIN_LINK = { to: '/admin/products', labelKey: 'nav.admin' } as const;

export const isShopPath = (pathname: string) =>
  pathname.startsWith('/catalog') || ['/finder', '/wishlist', '/compare'].includes(pathname);
export const isExplorePath = (pathname: string, hash = '') =>
  ['/discover', '/studio'].includes(pathname) || (pathname === '/' && hash === '#little-world');
