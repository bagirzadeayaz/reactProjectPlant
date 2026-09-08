import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Menu,
  Play,
  Search,
  ShoppingBag,
  Star,
  X,
  type LucideIcon,
} from 'lucide-react';

/**
 * The icons the design actually uses, named after their role rather than their
 * glyph. Adding a name here is the only way to add an icon to the app — that
 * keeps the set closed and reviewable.
 *
 * Sources: search + bag (node 22:13, 22:14), chevron (22:8), arrow-right
 * (22:36), hamburger (22:21), play (22:45).
 */
export const ICONS = {
  search: Search,
  bag: ShoppingBag,
  chevron: ChevronDown,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  'arrow-right': ArrowRight,
  'arrow-left': ArrowLeft,
  star: Star,
  play: Play,
  hamburger: Menu,
  close: X,
} as const satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICONS;
