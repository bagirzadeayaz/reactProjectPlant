import { createApi, type BaseQueryFn, type FetchArgs } from '@reduxjs/toolkit/query/react';

/**
 * The one RTK Query instance. Entities inject their own endpoints into it with
 * `injectEndpoints`, so this file never grows business logic.
 *
 * `tagTypes` is the one compromise: RTK Query requires every tag to be declared
 * on the root api, so these three names live in `shared` even though they are
 * business nouns. Adding an entity means adding its tag here — nothing else.
 */
interface FirestoreError {
  status: 'CUSTOM_ERROR';
  error: string;
}
const firestoreBaseQuery: BaseQueryFn<string | FetchArgs, unknown, FirestoreError> = async (
  args,
) => {
  try {
    const { runFirestoreRequest } = await import('../firestore/store');
    return { data: await runFirestoreRequest(args) };
  } catch (error) {
    return {
      error: {
        status: 'CUSTOM_ERROR',
        error: error instanceof Error ? error.message : 'Request failed',
      },
    };
  }
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: firestoreBaseQuery,
  tagTypes: ['Product', 'Review', 'Category'],
  endpoints: () => ({}),
});
