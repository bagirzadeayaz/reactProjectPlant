import { notFound } from '../domain/errors.js';
import { requireAdmin } from './admin.js';
import { handleProducts } from './product-routes.js';
import { readJson, sendJson } from './request.js';

export const handleApi = async (request, response, url, services) => {
  const { content, images, admin, seed } = services;
  const { pathname } = url;
  if (request.method === 'GET' && pathname === '/api/health')
    return sendJson(response, 200, { ok: true });
  if (
    (request.method === 'GET' && pathname === '/api/admin/me') ||
    (request.method === 'POST' && pathname === '/api/admin/session')
  ) {
    const user = await requireAdmin(request, admin);
    if (request.method === 'POST') await seed.ensureSeeded(user.token);
    return sendJson(response, 200, { email: user.email });
  }
  if (request.method === 'GET' && pathname === '/api/categories')
    return sendJson(response, 200, await content.listCategories());
  if (request.method === 'GET' && pathname === '/api/reviews')
    return sendJson(response, 200, await content.listReviews(url.searchParams.get('productId')));
  const image = /^\/api\/images\/([a-f0-9]{64})$/.exec(pathname);
  if (request.method === 'GET' && image) {
    const stored = await images.get(image[1]);
    response.writeHead(200, {
      'Content-Type': stored.contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    });
    response.end(stored.bytes);
    return;
  }
  if (request.method === 'POST' && pathname === '/api/newsletter') {
    await content.subscribe((await readJson(request))?.email);
    response.writeHead(204);
    response.end();
    return;
  }
  if (await handleProducts(request, response, url, services)) return;
  throw notFound();
};
