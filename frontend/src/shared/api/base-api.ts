import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getAccessToken } from './access-token';

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
 * is one and fall back to a placeholder that the test mock matches by path.
 */
const apiBaseUrl =
  typeof globalThis.location === 'undefined'
    ? 'http://localhost/api'
    : `${globalThis.location.origin}/api`;

const rawBaseQuery = fetchBaseQuery({
  baseUrl: apiBaseUrl,
  prepareHeaders: async (headers, { arg }) => {
    if (typeof arg === 'object' && arg.method && arg.method !== 'GET') {
      const token = await getAccessToken();
      if (token) headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: rawBaseQuery,
  tagTypes: ['Product', 'Review', 'Category'],
  endpoints: () => ({}),
});
