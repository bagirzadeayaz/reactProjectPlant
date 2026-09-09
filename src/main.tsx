import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AppProviders } from './app/index';
import { signalBackendReady } from './shared/api';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element #root was not found in index.html');
}

/**
 * MSW is the app's backend in every environment. It used to be awaited before
 * the first render, which put its whole chunk in front of first paint. Now the
 * shell renders at once and the first *request* waits instead — see
 * `shared/api/backend-ready.ts`. A worker that fails to start still opens the
 * gate, so the failing requests surface as error states rather than a blank
 * page.
 */
const startMockBackend = async (): Promise<void> => {
  try {
    const { worker } = await import('./mocks/browser');
    await worker.start({ onUnhandledRequest: 'bypass', quiet: true });
  } catch (error: unknown) {
    console.error('Mock backend failed to start', error);
  } finally {
    signalBackendReady();
  }
};

createRoot(rootElement).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
);

// Start the mock backend after the first frame has painted rather than in
// the same tick as the render: its chunk is the largest on the page, and on a
// slow connection it would otherwise compete with the entry and the hero image
// for bandwidth before anything is visible.
requestAnimationFrame(() => {
  setTimeout(() => void startMockBackend(), 0);
});
