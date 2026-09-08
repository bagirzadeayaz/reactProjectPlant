import type { Category } from '../entities/category/model/schema';
import type { Product } from '../entities/product/model/schema';
import type { Review } from '../entities/review/model/schema';
import { SEED_CATEGORIES, SEED_PRODUCTS, SEED_REVIEWS } from './seed';

export const DB_STORAGE_KEY = 'planto:db';

export interface Database {
  products: Product[];
  reviews: Review[];
  categories: Category[];
}

const freshDatabase = (): Database => ({
  products: structuredClone(SEED_PRODUCTS),
  reviews: structuredClone(SEED_REVIEWS),
  categories: structuredClone(SEED_CATEGORIES),
});

/**
 * Reads the persisted database, falling back to the seed.
 *
 * Anything unreadable — private mode, a half-written value, an older shape — is
 * treated as "no database yet" rather than crashing the app on boot.
 */
const load = (): Database => {
  try {
    const raw = globalThis.localStorage.getItem(DB_STORAGE_KEY);
    if (raw === null) return freshDatabase();
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return freshDatabase();
    const { products, reviews, categories } = parsed as Partial<Database>;
    if (!Array.isArray(products) || !Array.isArray(reviews) || !Array.isArray(categories)) {
      return freshDatabase();
    }
    return { products, reviews, categories };
  } catch {
    return freshDatabase();
  }
};

let database: Database = load();

export const db = {
  get: (): Database => database,

  /** Writes through to localStorage so added products survive a reload. */
  commit: (next: Database): void => {
    database = next;
    try {
      globalThis.localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Storage is full or blocked. The in-memory copy is still correct for
      // this session, which is better than failing the request.
    }
  },

  /** Back to the seed. Called between tests, and by the dev-only reset endpoint. */
  reset: (): void => {
    database = freshDatabase();
    try {
      globalThis.localStorage.removeItem(DB_STORAGE_KEY);
    } catch {
      // Nothing to clean up if storage is unavailable.
    }
  },
};
