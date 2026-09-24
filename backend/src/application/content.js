import { createHash } from 'node:crypto';
import { AppError } from '../domain/errors.js';

export const createContentService = ({ content, now = () => new Date().toISOString() }) => ({
  listCategories: () => content.listCategories(),
  listReviews: (productId) => content.listReviews(productId),
  subscribe: async (value) => {
    const email = typeof value === 'string' ? value.trim().toLowerCase() : '';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      throw new AppError('VALIDATION', 'Invalid email address');
    }
    const id = createHash('sha256').update(email).digest('hex');
    await content.subscribe(id, { email, subscribedAt: now() });
  },
});
