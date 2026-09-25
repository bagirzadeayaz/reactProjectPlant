/** Primary storefront routes shown in the centre of the desktop header. */
export const PRIMARY_NAV_LINKS = [
  { to: '/', labelKey: 'nav.home' },
  { to: '/catalog', labelKey: 'nav.plantTypes' },
  { to: '/care', labelKey: 'nav.more' },
  { to: '/contact', labelKey: 'nav.contact' },
] as const satisfies readonly { to: string; labelKey: string }[];

/** Account entry point, positioned with the header actions on desktop. */
export const LOGIN_LINK = { to: '/admin/products', labelKey: 'nav.admin' } as const;

/** All public routes used by the footer and compact navigation. */
export const NAV_LINKS = [...PRIMARY_NAV_LINKS, LOGIN_LINK] as const;

export type NavLink = (typeof NAV_LINKS)[number];
