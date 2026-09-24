import { handleApi } from './routes.js';
import { sendError } from './errors.js';

/** HTTP adapter: dependencies are supplied by bootstrap or isolated tests. */
export const createRequestHandler =
  ({ services, allowedOrigin, serveFrontend = async () => false, logger = console }) =>
  async (request, response) => {
    response.setHeader('X-Content-Type-Options', 'nosniff');
    const origin = request.headers.origin;
    if (origin && origin === allowedOrigin) {
      response.setHeader('Access-Control-Allow-Origin', origin);
      response.setHeader('Vary', 'Origin');
      response.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
      response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    }
    if (request.method === 'OPTIONS') {
      response.writeHead(origin === allowedOrigin ? 204 : 403);
      response.end();
      return;
    }
    try {
      const url = new URL(request.url, 'http://localhost');
      const isApi = url.pathname === '/api' || url.pathname.startsWith('/api/');
      if (!isApi && request.method === 'GET' && (await serveFrontend(url.pathname, response)))
        return;
      if (isApi) response.setHeader('Cache-Control', 'no-store');
      await handleApi(request, response, url, services);
    } catch (error) {
      sendError(response, error, logger);
    }
  };
