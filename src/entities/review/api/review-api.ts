import { baseApi } from '../../../shared/api';
import type { Review } from '../model/schema';

export const reviewApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getReviews: build.query<Review[], { productId?: string } | undefined>({
      query: (params) => ({ url: '/reviews', params: { ...params } }),
      providesTags: [{ type: 'Review', id: 'LIST' }],
    }),
  }),
});

export const { useGetReviewsQuery } = reviewApi;
