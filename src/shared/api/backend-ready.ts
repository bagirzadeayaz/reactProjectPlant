/**
 * A gate the first request waits at until the mock backend is listening.
 *
 * The app renders immediately — header, hero copy, skeletons — while MSW's
 * service worker registers in parallel. Without this gate the first RTK Query
 * fetch would race the worker and reach the network before anything answered.
 * `signalBackendReady()` is called once from `main.tsx`; in tests the Node
 * server is listening before any test runs, so the gate is opened in setup.
 */
let resolveReady: (() => void) | null = null;

export const backendReady = new Promise<void>((resolve) => {
  resolveReady = resolve;
});

export const signalBackendReady = (): void => {
  resolveReady?.();
  resolveReady = null;
};
