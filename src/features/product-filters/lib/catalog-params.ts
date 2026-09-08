export const CATALOG_SORTS = ['newest', 'price-asc', 'price-desc', 'name-asc'] as const;
export type CatalogSort = (typeof CATALOG_SORTS)[number];

export interface CatalogParams {
  search: string;
  category: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  inStock: boolean;
  sort: CatalogSort;
  page: number;
}

export const DEFAULT_CATALOG_PARAMS: CatalogParams = {
  search: '',
  category: null,
  minPrice: null,
  maxPrice: null,
  inStock: false,
  sort: 'newest',
  page: 1,
};

const isSort = (value: string | null): value is CatalogSort =>
  value !== null && (CATALOG_SORTS as readonly string[]).includes(value);

const nonNegative = (value: string | null): number | null => {
  if (value === null || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
};

/**
 * The catalog's state *is* the URL. These two functions are the only place
 * the query-string shape is known, so a shared link, a reload and the back
 * button all rebuild the same filters.
 *
 * Defaults are omitted when writing, so `/catalog` stays `/catalog` until the
 * user changes something.
 */
export const readCatalogParams = (params: URLSearchParams): CatalogParams => ({
  search: params.get('search') ?? '',
  category: params.get('category'),
  minPrice: nonNegative(params.get('minPrice')),
  maxPrice: nonNegative(params.get('maxPrice')),
  inStock: params.get('inStock') === 'true',
  sort: isSort(params.get('sort')) ? (params.get('sort') as CatalogSort) : 'newest',
  page: Math.max(1, Number.parseInt(params.get('page') ?? '1', 10) || 1),
});

export const writeCatalogParams = (
  current: URLSearchParams,
  next: Partial<CatalogParams>,
): URLSearchParams => {
  const merged = { ...readCatalogParams(current), ...next };
  const out = new URLSearchParams(current);
  const set = (key: string, value: string | null): void => {
    if (value === null || value === '') out.delete(key);
    else out.set(key, value);
  };
  set('search', merged.search.trim());
  set('category', merged.category);
  set('minPrice', merged.minPrice === null ? null : String(merged.minPrice));
  set('maxPrice', merged.maxPrice === null ? null : String(merged.maxPrice));
  set('inStock', merged.inStock ? 'true' : null);
  set('sort', merged.sort === 'newest' ? null : merged.sort);
  set('page', merged.page <= 1 ? null : String(merged.page));
  return out;
};

/** Everything that narrows the result set; a change to any of these resets the page. */
export const isFilterKey = (key: keyof CatalogParams): boolean => key !== 'page';
