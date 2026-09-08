import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { signalBackendReady } from './src/shared/api/backend-ready';
import { db } from './src/mocks/db';
import { server } from './src/mocks/server';

// One mock backend for the whole suite. `error` on an unhandled request means a
// test that hits a URL nobody defined fails loudly instead of hanging.
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
  signalBackendReady();
});

afterEach(() => {
  cleanup();
  server.resetHandlers();
  // Mutations persist to localStorage, so without this a created product would
  // leak into the next test.
  db.reset();
});

afterAll(() => {
  server.close();
});
