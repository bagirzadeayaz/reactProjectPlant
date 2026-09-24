import { useGetProductsQuery, type Product } from '../../entities/product';
import { useGetReviewsQuery, type Review } from '../../entities/review';

export interface HomeData {
  products: readonly Product[];
  reviews: readonly Review[];
  byCategory: (slug: string) => Product[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

/**
 * Everything the landing page shows comes from two requests: the whole
 * catalog (six products fit in one page) and the reviews. Sections carve up
 * the same cached list rather than issuing one request each.
 */
export const useHomeData = (): HomeData => {
  const products = useGetProductsQuery({ perPage: 50, sort: 'newest' });
  const reviews = useGetReviewsQuery(undefined);
  const items = products.data?.items ?? [];

  return {
    products: items,
    reviews: reviews.data ?? [],
    byCategory: (slug) => items.filter((product) => product.category === slug),
    isLoading: products.isLoading || reviews.isLoading,
    isError: products.isError || reviews.isError,
    refetch: () => {
      void products.refetch();
      void reviews.refetch();
    },
  };
};
