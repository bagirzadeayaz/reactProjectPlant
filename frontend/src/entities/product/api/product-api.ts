import { baseApi } from '../../../shared/api';
import type { Product, ProductDraft, ProductPatch } from '../model/schema';
import { optimisticDelete, optimisticUpdate, rollback, type OptimisticContext } from './optimistic';

export interface ProductListParams {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sort?: string;
  page?: number;
  perPage?: number;
}

export interface ProductPage {
  items: Product[];
  total: number;
  page: number;
  perPage: number;
}

/**
 * Server state for products. Never copy a result out of here into a slice —
 * this cache is the single source of truth (see ARCHITECTURE.md).
 *
 * Every mutation invalidates the `LIST` tag, so any mounted list refetches on
 * its own after a create, update or delete. Update and delete also patch the
 * cache *before* the request resolves and undo it on failure — the admin
 * table should feel instant, and a rolled-back row plus an error toast is a
 * clearer story than a spinner. Create stays pessimistic: there is no id to
 * insert until the server answers.
 */
/** The lifecycle's dispatch/getState, bound so the helpers can call them freely. */
const context = (lifecycle: {
  dispatch: OptimisticContext['dispatch'];
  getState: OptimisticContext['getState'];
}): OptimisticContext => ({
  api: productApi,
  dispatch: (action) => lifecycle.dispatch(action),
  getState: () => lifecycle.getState(),
});

export const productApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getProducts: build.query<ProductPage, ProductListParams | undefined>({
      query: (params) => ({ url: '/products', params: { ...params } }),
      providesTags: (result) => [
        { type: 'Product' as const, id: 'LIST' },
        ...(result?.items ?? []).map((product) => ({
          type: 'Product' as const,
          id: product.id,
        })),
      ],
    }),

    /** The API accepts either the public slug or the admin-facing product ID. */
    getProductBySlug: build.query<Product, string>({
      query: (slug) => `/products/${slug}`,
      providesTags: (result) => (result ? [{ type: 'Product', id: result.id }] : []),
    }),

    createProduct: build.mutation<Product, ProductDraft>({
      query: (body) => ({ url: '/products', method: 'POST', body }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }],
    }),

    updateProduct: build.mutation<Product, { id: string; patch: ProductPatch }>({
      query: ({ id, patch }) => ({ url: `/products/${id}`, method: 'PATCH', body: patch }),
      onQueryStarted: async ({ id, patch }, lifecycle) => {
        const patches = optimisticUpdate(context(lifecycle), id, patch);
        try {
          await lifecycle.queryFulfilled;
        } catch {
          rollback(patches);
        }
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Product', id },
        { type: 'Product', id: 'LIST' },
      ],
    }),

    deleteProduct: build.mutation<undefined, string>({
      query: (id) => ({ url: `/products/${id}`, method: 'DELETE' }),
      onQueryStarted: async (id, lifecycle) => {
        const patches = optimisticDelete(context(lifecycle), id);
        try {
          await lifecycle.queryFulfilled;
        } catch {
          rollback(patches);
        }
      },
      invalidatesTags: (_result, _error, id) => [
        { type: 'Product', id },
        { type: 'Product', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductBySlugQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productApi;
