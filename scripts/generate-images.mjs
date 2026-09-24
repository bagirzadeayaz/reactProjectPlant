// Generates the WebP and AVIF variants beside every PNG in public/plants and
// the hero photo in public/images. Idempotent; run after adding a picture.
//   node scripts/generate-images.mjs
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const PLANT_WIDTHS = [400, 800, 1200];
const HERO_WIDTHS = [960, 1920];

const variants = async (dir, file, widths) => {
  const base = path.join(dir, file.replace(/\.(png|jpg)$/, ''));
  for (const width of widths) {
    const source = sharp(path.join(dir, file)).resize({ width, withoutEnlargement: true });
    await source.clone().webp({ quality: 82 }).toFile(`${base}-${width}.webp`);
    await source.clone().avif({ quality: 60 }).toFile(`${base}-${width}.avif`);
  }
};

for (const file of await readdir('frontend/public/plants')) {
  if (file.endsWith('.png')) await variants('frontend/public/plants', file, PLANT_WIDTHS);
}
await variants('frontend/public/images', 'hero-bg.jpg', HERO_WIDTHS);
console.log('images generated');
