import { createServer } from 'node:http';
import { resolve } from 'node:path';
import { build } from 'vite';
import { createRequestHandler } from '../src/http/app.js';
import { createFrontendHandler } from '../src/http/static.js';
import { createTestServices } from './helpers/services.js';

export default async function setupBrowserServer() {
  // This test-only entry point is never called by npm start/dev. No Firebase writes or login.
  Object.assign(process.env, {
    VITE_FIREBASE_API_KEY: 'test-web-api-key',
    VITE_FIREBASE_PROJECT_ID: 'demo-planto',
    VITE_FIREBASE_AUTH_DOMAIN: 'demo-planto.firebaseapp.com',
    VITE_FIREBASE_STORAGE_BUCKET: 'demo-planto.firebasestorage.app',
    VITE_FIREBASE_MESSAGING_SENDER_ID: '123456789',
    VITE_FIREBASE_APP_ID: '1:123456789:web:test',
    VITE_FIREBASE_MEASUREMENT_ID: '',
  });
  const directory = resolve('node_modules/.cache/planto-e2e');
  await build({ mode: 'test', build: { outDir: directory, emptyOutDir: false } });
  const port = Number(process.env.E2E_PORT || 4173);
  const server = createServer(
    createRequestHandler({
      services: await createTestServices(),
      allowedOrigin: `http://127.0.0.1:${port}`,
      serveFrontend: createFrontendHandler(directory),
    }),
  );
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', resolve);
  });
  return () =>
    new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
}
