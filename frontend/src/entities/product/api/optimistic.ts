import type { Product, ProductPatch } from '../model/schema';
import type { productApi } from './product-api';

type Api = typeof productApi;
type CacheState = Parameters<Api['util']['selectCachedArgsForQuery']>[0];
type Patch = ReturnType<ReturnType<Api['util']['updateQueryData']>>;

/** What `onQueryStarted` hands a mutation, narrowed to what the helpers use. */
export interface OptimisticContext {
  api: Api;
  dispatch: (action: ReturnType<Api['util']['updateQueryData']>) => Patch;
  getState: () => CacheState;
}

/**
 * Applies `edit` to every cached `getProducts` page and every cached single
 * product, and returns the patches so a failed request can undo them.
 *
 * "Every cached page" matters: the admin table, the catalog and the home grid
 * each hold their own args, and a user who edits in the admin expects the
 * storefront to agree the moment they navigate to it — before the refetch
 * that tag invalidation triggers has landed.
 */
const patchEverywhere = (
  { api, dispatch, getState }: OptimisticContext,
  edit: (items: Product[]) => Product[],
): Patch[] => {
  const state = getState();
  const lists = api.util.selectCachedArgsForQuery(state, 'getProducts').map((args) =>
    dispatch(
      api.util.updateQueryData('getProducts', args, (draft) => {
        const next = edit(draft.items);
        draft.total += next.length - draft.items.length;
        draft.items = next;
      }),
    ),
  );
  const singles = api.util.selectCachedArgsForQuery(state, 'getProductBySlug').map((slug) =>
    dispatch(
      api.util.updateQueryData('getProductBySlug', slug, (draft) => {
        const [next] = edit([draft]);
        if (next) Object.assign(draft, next);
      }),
    ),
  );
  return [...lists, ...singles];
};

/** The keys a PATCH body can carry that must not overwrite a cached value. */
const isRealChange = ([key, value]: [string, unknown]): boolean =>
  value !== undefined && !(key === 'slug' && value === '');

/** Merges a patch into the cached copies of one product. */
export const optimisticUpdate = (
  context: OptimisticContext,
  id: string,
  patch: ProductPatch,
): Patch[] => {
  const changes = Object.fromEntries(
    Object.entries(patch).filter(isRealChange),
  ) as Partial<Product>;
  return patchEverywhere(context, (items) =>
    items.map((item) => (item.id === id ? { ...item, ...changes } : item)),
  );
};

/** Removes one product from every cached list. */
export const optimisticDelete = (context: OptimisticContext, id: string): Patch[] =>
  patchEverywhere(context, (items) => items.filter((item) => item.id !== id));

/** Reverts a set of optimistic patches, newest first. */
export const rollback = (patches: Patch[]): void => {
  for (const patch of [...patches].reverse()) patch.undo();
};
