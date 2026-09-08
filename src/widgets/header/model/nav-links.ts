/**
 * The primary navigation.
 *
 * The comp's nav (node 22:23) reads Home / Plant Type's / More / Contact, but
 * only Home has a destination in it. These are the routes that actually exist;
 * the comp's labels return in prompts 8-11 once the sections they point at are
 * built. Recorded in the deviations table in ARCHITECTURE.md.
 */
export const NAV_LINKS = [
  { to: '/', labelKey: 'nav.home' },
  { to: '/catalog', labelKey: 'nav.catalog' },
  { to: '/admin/products', labelKey: 'nav.admin' },
] as const satisfies readonly { to: string; labelKey: string }[];

export type NavLink = (typeof NAV_LINKS)[number];
