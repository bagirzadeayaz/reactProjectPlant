import type { Category } from '../entities/category/model/schema';
import type { Product } from '../entities/product/model/schema';
import type { Review } from '../entities/review/model/schema';

/**
 * Seed content lifted from the Figma comp, frame 22:2.
 *
 * Names come from nodes 22:97, 22:129, 22:109, 22:130, 22:117 and 22:131; prices
 * from 22:99, 22:136, 22:112, 22:140, 22:120 and 22:144. Reviewer names are from
 * 22:184, 22:183 and 22:182. The comp's body copy is lorem ipsum, so the English
 * descriptions here are written to match each plant; the Russian is a translation
 * of that English, not of the lorem.
 */

const CATEGORY_SECTIONS = {
  trendy: { en: 'Trendy plants', ru: 'Модные растения' },
  'top-selling': { en: 'Top selling', ru: 'Хиты продаж' },
  'best-o2': { en: 'Best O₂', ru: 'Лучшие для кислорода' },
} as const;

export const SEED_CATEGORIES: Category[] = Object.entries(CATEGORY_SECTIONS).map(
  ([slug, label]) => ({ id: `cat-${slug}`, slug, label }),
);

export const SEED_PRODUCTS: Product[] = [
  {
    id: 'p-1',
    slug: 'calathea-plant',
    name: { en: 'Calathea plant', ru: 'Калатея' },
    description: {
      en: 'Patterned leaves that fold up at night. Happiest in bright, indirect light.',
      ru: 'Узорчатые листья, которые складываются на ночь. Любит яркий рассеянный свет.',
    },
    price: 309,
    currency: 'INR',
    category: 'trendy',
    imageUrl: '/plants/calathea-plant.png',
    inStock: true,
    createdAt: '2026-01-12T09:00:00.000Z',
  },
  {
    id: 'p-2',
    slug: 'cal-874-plant',
    name: { en: 'Cal 874 plant', ru: 'Кал 874' },
    description: {
      en: 'A compact cultivar bred for small rooms. Tolerates a week of forgetfulness.',
      ru: 'Компактный сорт для небольших комнат. Переносит неделю без полива.',
    },
    price: 259,
    currency: 'INR',
    category: 'trendy',
    imageUrl: '/plants/cal-874-plant.png',
    inStock: true,
    createdAt: '2026-01-14T09:00:00.000Z',
  },
  {
    id: 'p-3',
    slug: 'desk-plant',
    name: { en: 'Desk plant', ru: 'Настольное растение' },
    description: {
      en: 'Sized for a monitor stand. Needs little light and even less attention.',
      ru: 'Подходит для подставки под монитор. Нужно мало света и ещё меньше внимания.',
    },
    price: 359,
    currency: 'INR',
    category: 'top-selling',
    imageUrl: '/plants/desk-plant.png',
    inStock: true,
    createdAt: '2026-01-16T09:00:00.000Z',
  },
  {
    id: 'p-4',
    slug: 'show-plant',
    name: { en: 'Show plant', ru: 'Выставочное растение' },
    description: {
      en: 'The one guests ask about. Wide leaves, strong silhouette, slow grower.',
      ru: 'То самое, о котором спрашивают гости. Широкие листья и выразительный силуэт.',
    },
    price: 759,
    currency: 'INR',
    category: 'top-selling',
    imageUrl: '/plants/show-plant.png',
    inStock: false,
    createdAt: '2026-01-18T09:00:00.000Z',
  },
  {
    id: 'p-5',
    slug: 'calathea-ai-plant',
    name: { en: 'Calathea ai plant', ru: 'Калатея ai' },
    description: {
      en: 'Ships with a soil sensor that tells you when to water, and not before.',
      ru: 'Поставляется с датчиком влажности почвы, который подскажет, когда поливать.',
    },
    price: 399,
    currency: 'INR',
    category: 'best-o2',
    imageUrl: '/plants/calathea-ai-plant.png',
    inStock: true,
    createdAt: '2026-01-20T09:00:00.000Z',
  },
  {
    id: 'p-6',
    slug: 'calat-o2-plant',
    name: { en: 'Calat O2 plant', ru: 'Калат O2' },
    description: {
      en: 'Chosen for air quality — dense foliage in a small footprint.',
      ru: 'Выбран за качество воздуха: густая листва на небольшой площади.',
    },
    price: 659,
    currency: 'INR',
    category: 'best-o2',
    imageUrl: '/plants/calat-o2-plant.png',
    inStock: true,
    createdAt: '2026-01-22T09:00:00.000Z',
  },
];

export const SEED_REVIEWS: Review[] = [
  {
    id: 'r-1',
    author: 'Maln Josi',
    avatarUrl: '/avatars/maln-josi.png',
    rating: 5,
    text: {
      en: 'Arrived better packed than anything I have ordered online. Three weeks in and it has put out two new leaves.',
      ru: 'Упаковка лучше, чем у всего, что я заказывал онлайн. Прошло три недели — уже два новых листа.',
    },
    productId: 'p-1',
  },
  {
    id: 'r-2',
    author: 'Alina Thakur',
    avatarUrl: '/avatars/alina-thakur.png',
    rating: 5,
    text: {
      en: 'I kill houseplants. This one has survived me since spring, which I am taking as a personal win.',
      ru: 'Я обычно загубливаю комнатные растения. Это живёт у меня с весны — считаю личной победой.',
    },
    productId: 'p-3',
  },
  {
    id: 'r-3',
    author: 'Max Makvana',
    avatarUrl: '/avatars/max-makvana.png',
    rating: 4,
    text: {
      en: 'Delivery took a day longer than promised, but the plant itself was flawless. Would order again.',
      ru: 'Доставка задержалась на день, но само растение безупречно. Закажу ещё.',
    },
  },
];
