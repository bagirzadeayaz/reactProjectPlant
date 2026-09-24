export {
  productApi,
  useCreateProductMutation,
  useDeleteProductMutation,
  useGetProductBySlugQuery,
  useGetProductsQuery,
  useUpdateProductMutation,
  type ProductListParams,
  type ProductPage,
} from './api/product-api';
// Types only. The zod schemas themselves are imported from `./model/schema`
// by the two runtime consumers (mock backend, admin form) so that the
// storefront chunks never carry zod — see ARCHITECTURE.md decision 56.
export type { Currency, Product, ProductDraft, ProductPatch } from './model/schema';
export { PRODUCT_IMAGE_SIZE, PRODUCT_IMAGE_WIDTHS, productImageSources } from './lib/product-image';
export { ProductCard, type ProductCardProps } from './ui/product-card';
