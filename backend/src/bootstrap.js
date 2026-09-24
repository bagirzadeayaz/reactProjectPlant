import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createAdminService } from './application/admin.js';
import { createContentService } from './application/content.js';
import { createImageService } from './application/images.js';
import { createProductService } from './application/products.js';
import { createSeedService } from './application/seed.js';
import { createTokenVerifier } from './infrastructure/firebase-auth.js';
import { FirestoreRest } from './infrastructure/firestore/client.js';
import { createProductRepository } from './infrastructure/firestore/products.js';
import {
  createContentRepository,
  createImageRepository,
  createSeedRepository,
} from './infrastructure/firestore/content.js';
import { createRequestHandler } from './http/app.js';
import { createFrontendHandler } from './http/static.js';

/** The single composition root: concrete infrastructure is chosen only here. */
export const createApplication = (config) => {
  const db = new FirestoreRest(config);
  const images = createImageService({ images: createImageRepository(db) });
  const services = {
    images,
    products: createProductService({ products: createProductRepository(db), images }),
    content: createContentService({ content: createContentRepository(db) }),
    admin: createAdminService({
      verifyIdToken: createTokenVerifier(config.projectId),
      adminEmails: config.adminEmails,
    }),
    seed: createSeedService({
      repository: createSeedRepository(db),
      loadSeed: async () =>
        JSON.parse(await readFile(new URL('../seed.json', import.meta.url), 'utf8')),
    }),
  };
  return createRequestHandler({
    services,
    allowedOrigin: config.allowedOrigin,
    serveFrontend: createFrontendHandler(
      fileURLToPath(new URL('../../frontend/dist/', import.meta.url)),
    ),
  });
};
