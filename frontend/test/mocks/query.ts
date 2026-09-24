import type { Product } from '../../src/entities/product/model/schema';

export const SORTS = ['newest', 'price-asc', 'price-desc', 'name-asc'] as const;
export type Sort = (typeof SORTS)[number];

export interface ProductQuery {
  search: string;
  category: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  inStock: boolean;
  sort: Sort;
  page: number;
  perPage: number;
}

export interface ProductPage {
  items: Product[];
  total: number;
  page: number;
  perPage: number;
}

export const DEFAULT_PER_PAGE = 6;

const isSort = (value: string | null): value is Sort =>
  value !== null && (SORTS as readonly string[]).includes(value);

const positiveInt = (value: string | null, fallback: number): number => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const nonNegative = (value: string | null): number | null => {
  if (value === null || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
};

export const parseProductQuery = (params: URLSearchParams): ProductQuery => ({
  search: (params.get('search') ?? '').trim().toLowerCase(),
  category: params.get('category'),
  minPrice: nonNegative(params.get('minPrice')),
  maxPrice: nonNegative(params.get('maxPrice')),
  inStock: params.get('inStock') === 'true',
  sort: isSort(params.get('sort')) ? (params.get('sort') as Sort) : 'newest',
  page: positiveInt(params.get('page'), 1),
  perPage: positiveInt(params.get('perPage'), DEFAULT_PER_PAGE),
});

/** Search matches either language, so a Russian query finds a product too. */
const matchesSearch = (product: Product, search: string): boolean =>
  search === '' ||
  product.name.en.toLowerCase().includes(search) ||
  product.name.ru.toLowerCase().includes(search);

const COMPARATORS: Record<Sort, (a: Product, b: Product) => number> = {
  newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
  'name-asc': (a, b) => a.name.en.localeCompare(b.name.en),
};

/** Filter, sort and slice — the whole list endpoint's behaviour in one place. */
export const selectProducts = (products: readonly Product[], query: ProductQuery): ProductPage => {
  const filtered = products
    .filter((product) => matchesSearch(product, query.search))
    .filter((product) => query.category === null || product.category === query.category)
    .filter((product) => query.minPrice === null || product.price >= query.minPrice)
    .filter((product) => query.maxPrice === null || product.price <= query.maxPrice)
    .filter((product) => !query.inStock || product.inStock)
    .sort(COMPARATORS[query.sort]);

  const start = (query.page - 1) * query.perPage;

  return {
    items: filtered.slice(start, start + query.perPage),
    total: filtered.length,
    page: query.page,
    perPage: query.perPage,
  };
};
