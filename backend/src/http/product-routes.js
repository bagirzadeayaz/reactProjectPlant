import { AppError } from '../domain/errors.js';
import { parseProductQuery } from './product-query.js';
import { requireAdmin } from './admin.js';
import { readJson, sendJson } from './request.js';

export const handleProducts = async (request, response, url, { products, admin }) => {
  if (url.pathname === '/api/products') {
    if (request.method === 'GET') {
      sendJson(response, 200, await products.list(parseProductQuery(url.searchParams)));
      return true;
    }
    if (request.method === 'POST') {
      const user = await requireAdmin(request, admin);
      sendJson(response, 201, await products.create(await readJson(request), user.token));
      return true;
    }
  }
  const match = /^\/api\/products\/([^/]+)$/.exec(url.pathname);
  if (!match) return false;
  let key;
  try {
    key = decodeURIComponent(match[1]);
  } catch {
    throw new AppError('BAD_REQUEST', 'Invalid product key');
  }
  if (!key || key.includes('/')) throw new AppError('BAD_REQUEST', 'Invalid product key');
  if (request.method === 'GET') {
    sendJson(response, 200, await products.find(key));
  } else if (request.method === 'PATCH') {
    const user = await requireAdmin(request, admin);
    sendJson(response, 200, await products.update(key, await readJson(request), user.token));
  } else if (request.method === 'DELETE') {
    const user = await requireAdmin(request, admin);
    await products.delete(key, user.token);
    response.writeHead(204);
    response.end();
  } else return false;
  return true;
};
