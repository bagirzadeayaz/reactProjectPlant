import { createApi, fetchBaseQuery, type BaseQueryFn } from '@reduxjs/toolkit/query/react';
import { backendReady } from './backend-ready';

/**
 * The one RTK Query instance. Entities inject their own endpoints into it with
 * `injectEndpoints`, so this file never grows business logic.
 *
 * `tagTypes` is the one compromise: RTK Query requires every tag to be declared
 * on the root api, so these three names live in `shared` even though they are
 * business nouns. Adding an entity means adding its tag here — nothing else.
 */
/**
 * Node's fetch rejects a relative URL, and the test runner uses it. The browser
 * would be happy with `/api`, so take the origin from the document when there
 * is one and fall back to a placeholder that MSW matches by path anyway.
 */
const apiBaseUrl =
  typeof globalThis.location === 'undefined'
    ? 'http://localhost/api'
    : `${globalThis.location.origin}/api`;

const rawBaseQuery = fetchBaseQuery({ baseUrl: apiBaseUrl });

/** Holds every request until the backend has signalled it is listening. */
const gatedBaseQuery: BaseQueryFn<Parameters<typeof rawBaseQuery>[0]> = async (
  args,
  api,
  extraOptions,
) => {
  await backendReady;
  return rawBaseQuery(args, api, extraOptions);
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: gatedBaseQuery,
  tagTypes: ['Product', 'Review', 'Category'],
  endpoints: () => ({}),
});
