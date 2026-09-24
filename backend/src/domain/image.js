import { createHash } from 'node:crypto';
import { AppError } from './errors.js';

const MAX_IMAGE_BYTES = 300 * 1024;
const signatures = {
  'image/png': (b) => b.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])),
  'image/jpeg': (b) => b[0] === 255 && b[1] === 216 && b[2] === 255,
  'image/webp': (b) =>
    b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP',
  'image/gif': (b) => ['GIF87a', 'GIF89a'].includes(b.toString('ascii', 0, 6)),
};

export const decodeImage = (dataUrl) => {
  const match = /^data:(image\/(?:png|jpeg|webp|gif));base64,([A-Za-z0-9+/]+={0,2})$/.exec(dataUrl);
  if (!match) throw new AppError('VALIDATION', 'Invalid image data');
  const bytes = Buffer.from(match[2], 'base64');
  if (!bytes.length || bytes.length > MAX_IMAGE_BYTES || !signatures[match[1]](bytes)) {
    throw new AppError('VALIDATION', 'Invalid or oversized image');
  }
  return {
    bytes,
    contentType: match[1],
    hash: createHash('sha256').update(bytes).digest('hex'),
  };
};
