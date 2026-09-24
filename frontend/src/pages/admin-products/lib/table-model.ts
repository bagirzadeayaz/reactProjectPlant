import type { Product } from '../../../entities/product';
import { type Locale, pickLocalized } from '../../../shared/api';

export const SORT_KEYS = ['name', 'price', 'category', 'stock', 'created'] as const;
export type SortKey = (typeof SORT_KEYS)[number];
export type SortDirection = 'asc' | 'desc';

export interface TableSort {
  key: SortKey;
  direction: SortDirection;
}

export const DEFAULT_SORT: TableSort = { key: 'created', direction: 'desc' };

/** Clicking the active column flips it; clicking another starts ascending. */
export const nextSort = (current: TableSort, key: SortKey): TableSort =>
  current.key === key
    ? { key, direction: current.direction === 'asc' ? 'desc' : 'asc' }
    : { key, direction: 'asc' };

const compareBy = (key: SortKey, locale: Locale) => {
  const collator = new Intl.Collator(locale);
  const text = (a: string, b: string): number => collator.compare(a, b);
  switch (key) {
    case 'name':
      return (a: Product, b: Product) =>
        text(pickLocalized(a.name, locale), pickLocalized(b.name, locale));
    case 'price':
      return (a: Product, b: Product) => a.price - b.price;
    case 'category':
      return (a: Product, b: Product) => text(a.category, b.category);
    case 'stock':
      return (a: Product, b: Product) => Number(a.inStock) - Number(b.inStock);
    case 'created':
      return (a: Product, b: Product) => a.createdAt.localeCompare(b.createdAt);
  }
};

/** A sorted copy. Never mutates the cache's array. */
export const sortProducts = (
  items: readonly Product[],
  sort: TableSort,
  locale: Locale,
): Product[] => {
  const compare = compareBy(sort.key, locale);
  const sign = sort.direction === 'asc' ? 1 : -1;
  return [...items].sort((a, b) => sign * compare(a, b));
};

/** Case-insensitive match on either name or the slug. */
export const filterProducts = (items: readonly Product[], query: string): Product[] => {
  const needle = query.trim().toLowerCase();
  if (needle === '') return [...items];
  return items.filter(
    (item) =>
      item.slug.includes(needle) ||
      item.name.en.toLowerCase().includes(needle) ||
      item.name.ru.toLowerCase().includes(needle),
  );
};
