/** URL-safe slug from a product name. Latin only — Russian names keep the English slug. */
export const toSlug = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/** Appends `-2`, `-3`, ... until the slug is free. */
export const uniqueSlug = (base: string, taken: readonly string[]): string => {
  if (!taken.includes(base)) return base;
  let suffix = 2;
  while (taken.includes(`${base}-${String(suffix)}`)) suffix += 1;
  return `${base}-${String(suffix)}`;
};
