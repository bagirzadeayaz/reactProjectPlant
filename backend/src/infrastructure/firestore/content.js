import { AppError } from '../../domain/errors.js';

const createIfAbsent = async (db, collection, id, data, token) => {
  try {
    await db.create(collection, id, data, token);
  } catch (error) {
    if (!(error instanceof AppError) || error.code !== 'CONFLICT') throw error;
  }
};

export const createContentRepository = (db) => ({
  listCategories: async () =>
    (await db.list('categories')).map(({ id, data }) => ({ ...data, id: data.id ?? id })),
  listReviews: async (productId) =>
    (await db.list('reviews'))
      .filter(({ data }) => !productId || data.productId === productId)
      .map(({ id, data }) => ({ ...data, id })),
  subscribe: (id, data) => createIfAbsent(db, 'newsletterSubscribers', id, data),
});

export const createImageRepository = (db) => ({
  get: async (hash) => (await db.get('images', hash))?.data ?? null,
  createIfAbsent: (hash, data, token) => createIfAbsent(db, 'images', hash, data, token),
});

export const createSeedRepository = (db) => ({
  isComplete: async (token) => Boolean(await db.get('metadata', 'initial-seed', token)),
  createIfAbsent: (collection, id, data, token) => createIfAbsent(db, collection, id, data, token),
  complete: (data, token) => createIfAbsent(db, 'metadata', 'initial-seed', data, token),
});
