import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { AppError } from '../domain/errors.js';

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
};

export const createFrontendHandler = (directory) => async (pathname, response) => {
  const dist = resolve(directory);
  if (pathname.startsWith('/api/')) return false;
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    throw new AppError('BAD_REQUEST', 'Invalid path');
  }
  if (decoded.split(/[\\/]/).some((segment) => segment.startsWith('.'))) return false;
  const requested = resolve(join(dist, normalize(decoded)));
  if (requested !== dist && !requested.startsWith(`${dist}${sep}`)) return false;
  let path = requested;
  try {
    if (!(await stat(path)).isFile()) path = join(dist, 'index.html');
  } catch {
    if (extname(requested)) return false;
    path = join(dist, 'index.html');
  }
  try {
    const body = await readFile(path);
    response.writeHead(200, {
      'Content-Type': types[extname(path)] || 'application/octet-stream',
      'Cache-Control': path.endsWith('index.html') ? 'no-cache' : 'public, max-age=86400',
      'X-Content-Type-Options': 'nosniff',
    });
    response.end(body);
    return true;
  } catch {
    return false;
  }
};
