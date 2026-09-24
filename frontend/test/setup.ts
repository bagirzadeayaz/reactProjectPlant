import '@testing-library/jest-dom/vitest';
import { cleanup, configure } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { subscriptions } from './mocks/newsletter';
import { setAdminEnabled } from './mocks/admin-session';
import { db } from './mocks/db';
import { server } from './mocks/server';

vi.mock('../src/shared/api/access-token', () => ({
  getAccessToken: () => Promise.resolve(undefined),
}));

vi.mock(
  '../src/features/admin-access/lib/admin-session.ts',
  () => import('./mocks/admin-session.ts'),
);

configure({ asyncUtilTimeout: 5_000 });

// jsdom has no scrolling implementation; browser tests cover actual scrolling.
globalThis.scrollTo = vi.fn();

// One mock backend for the whole suite. `error` on an unhandled request means a
// test that hits a URL nobody defined fails loudly instead of hanging.
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  cleanup();
  server.resetHandlers();
  db.reset();
  subscriptions.clear();
  setAdminEnabled(false);
});

afterAll(() => {
  server.close();
});
