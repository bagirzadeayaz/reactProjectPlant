import { AddToCartButton } from '../../../features/add-to-cart';
import { ProductCard, type Product } from '../../../entities/product';
import { Skeleton } from '../../../shared/ui';

export interface ProductGridProps {
  products: readonly Product[];
  isLoading?: boolean;
  /** How many placeholders to draw while loading. */
  placeholders?: number;
}

/**
 * Section 5 — the six-card grid under "Our Top Selling".
 *
 * The comp's geometry is exact — 512px columns at x = 77 / 608 / 1139 with
 * 19px gutters — so the grid is `repeat(3, var(--size-column))` with
 * `gap-gutter` at the full 1574px content width, and it closes on the 77px
 * page margin. Reflow: 3-up from lg, 2-up from sm, 1-up below.
 */
export const ProductGrid = ({
  products,
  isLoading = false,
  placeholders = 6,
}: ProductGridProps) => (
  <ul className="grid grid-cols-1 gap-6 pt-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
    {isLoading
      ? Array.from({ length: placeholders }, (_, index) => (
          <li key={index} className="pt-10">
            <Skeleton className="h-[30rem] w-full rounded-card" />
          </li>
        ))
      : products.map((product, index) => (
          <li key={product.id} className="pt-10">
            <ProductCard
              product={product}
              priority={index < 3}
              action={<AddToCartButton product={product} />}
            />
          </li>
        ))}
  </ul>
);
