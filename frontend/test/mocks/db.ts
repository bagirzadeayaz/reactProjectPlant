import type { Category } from '../../src/entities/category/model/schema';
import type { Product } from '../../src/entities/product/model/schema';
import type { Review } from '../../src/entities/review/model/schema';
import { SEED_CATEGORIES, SEED_PRODUCTS, SEED_REVIEWS } from './seed';

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

let database: Database = freshDatabase();

/** Test-only server state. Each test starts from an independent fixture. */
export const db = {
  get: (): Database => database,
  commit: (next: Database): void => {
    database = next;
  },
  reset: (): void => {
    database = freshDatabase();
  },
};
