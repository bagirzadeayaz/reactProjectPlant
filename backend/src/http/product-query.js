export const parseProductQuery = (params) => {
  const positive = (key, fallback, max) => {
    const value = Number(params.get(key));
    return Number.isInteger(value) && value > 0 ? Math.min(value, max) : fallback;
  };
  const price = (key) => {
    const raw = params.get(key);
    if (!raw) return null;
    const value = Number(raw);
    return Number.isFinite(value) && value >= 0 ? value : null;
  };
  const sort = params.get('sort');
  return {
    search: (params.get('search') || '').trim().toLowerCase(),
    category: params.get('category'),
    minPrice: price('minPrice'),
    maxPrice: price('maxPrice'),
    inStock: params.get('inStock') === 'true',
    sort: ['newest', 'price-asc', 'price-desc', 'name-asc'].includes(sort) ? sort : 'newest',
    page: positive('page', 1, 10_000),
    perPage: positive('perPage', 6, 100),
  };
};
