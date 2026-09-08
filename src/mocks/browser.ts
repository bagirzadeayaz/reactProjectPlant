import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

/** The browser worker, started from `src/main.tsx` in development. */
export const worker = setupWorker(...handlers);
