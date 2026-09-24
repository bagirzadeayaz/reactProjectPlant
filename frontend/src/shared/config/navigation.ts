/** Public site routes shared by the header and footer. Labels are i18n keys. */
export const NAV_LINKS = [
  { to: '/', labelKey: 'nav.home' },
  { to: '/catalog', labelKey: 'nav.catalog' },
  { to: '/admin/products', labelKey: 'nav.admin' },
] as const satisfies readonly { to: string; labelKey: string }[];

export type NavLink = (typeof NAV_LINKS)[number];
