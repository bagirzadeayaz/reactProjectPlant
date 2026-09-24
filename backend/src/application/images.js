import { decodeImage } from '../domain/image.js';
import { AppError, notFound } from '../domain/errors.js';

export const createImageService = ({ images, now = () => new Date().toISOString() }) => ({
  store: async (imageUrl, token) => {
    if (!imageUrl.startsWith('data:')) {
      if (
        imageUrl.length <= 2048 &&
        (imageUrl.startsWith('/plants/') ||
          /^https:\/\//i.test(imageUrl) ||
          /^\/api\/images\/[a-f0-9]{64}$/.test(imageUrl))
      )
        return imageUrl;
      throw new AppError('VALIDATION', 'Image URL must use HTTPS or be an uploaded image');
    }
    const { bytes, contentType, hash } = decodeImage(imageUrl);
    await images.createIfAbsent(hash, { bytes, contentType, createdAt: now() }, token);
    return `/api/images/${hash}`;
  },
  get: async (hash) => {
    if (!/^[a-f0-9]{64}$/.test(hash)) throw notFound();
    const image = await images.get(hash);
    if (!image) throw notFound();
    return image;
  },
});
