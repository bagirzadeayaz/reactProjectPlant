import { setupServer } from 'msw/node';
import { handlers } from './handlers';

/** The Node-side worker, used by tests. */
export const server = setupServer(...handlers);
